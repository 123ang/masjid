# Manual Migration Guide for VPS - Kampung Feature

Since `prisma migrate dev` requires shadow database permissions (which you don't have), we'll create the kampung table manually.

## Step 1: Check Current Database State

Connect to PostgreSQL:

```bash
psql -U your_db_user -d mkcs_db
```

Then run:

```sql
-- Check if kampung table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'kampung'
);

-- Check if village column exists in household_version
SELECT EXISTS (
   SELECT FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'household_version'
   AND column_name = 'village'
);
```

## Step 2: Create Kampung Table

If the kampung table doesn't exist, run:

```sql
-- Create kampung table
CREATE TABLE IF NOT EXISTS kampung (
    id TEXT PRIMARY KEY,
    masjid_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT kampung_masjid_id_fkey FOREIGN KEY (masjid_id) 
        REFERENCES masjid(id) ON DELETE CASCADE
);

-- Create unique constraint on name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'kampung_name_key'
    ) THEN
        ALTER TABLE kampung ADD CONSTRAINT kampung_name_key UNIQUE (name);
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS kampung_masjid_id_idx ON kampung(masjid_id);
```

## Step 3: Add Village Column to Household Version

If the village column doesn't exist:

```sql
ALTER TABLE household_version 
ADD COLUMN IF NOT EXISTS village TEXT;
```

## Step 4: Verify Tables

```sql
-- Check kampung table structure
\d kampung

-- Check household_version has village column
\d household_version

-- Exit
\q
```

## Step 5: Seed Kampung Data

```bash
# Option 1: Run seed script
cd /root/projects/masjid/backend
npm run seed

# Option 2: Manual SQL
psql -U your_db_user -d mkcs_db
```

Then run:

```sql
-- First, find your masjid ID
SELECT id, name FROM masjid;

-- Then insert kampung (replace 'masjid-alhuda' with your actual masjid ID)
INSERT INTO kampung (id, masjid_id, name, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::TEXT,
    'masjid-alhuda',  -- Replace with your masjid ID
    unnest(ARRAY[
        'Kg Raja',
        'Kg Atas',
        'Kg Atas Selatan',
        'Kg Bawah',
        'Kg Darat',
        'Kg Padang Matsirat',
        'Kg Kuala Muda',
        'Kg Paya',
        'Kg Limbong Putra',
        'Kg Bukit Nau'
    ]),
    true,
    NOW(),
    NOW()
ON CONFLICT (name) DO NOTHING;

-- Verify kampung were created
SELECT * FROM kampung ORDER BY name;
```

## Step 6: Restart Backend

```bash
cd /root/projects/masjid
pm2 restart mkcs-backend
```

## Step 7: Verify Everything Works

1. **Check PM2 logs:**
   ```bash
   pm2 logs mkcs-backend --lines 20
   ```

2. **Test in browser:**
   - Log in to your application
   - Go to "Borang Baru"
   - Check if "Nama Kampung" dropdown shows kampung list

3. **Check API:**
   - Visit: `https://your-domain.com/api/kampung` (with auth token)
   - Should return kampung list

## Quick One-Liner Script

Save this as `create-kampung.sh`:

```bash
#!/bin/bash

# Get database credentials from .env
source .env
DB_USER=$(echo $DATABASE_URL | grep -oP 'postgresql://\K[^:]+')
DB_PASS=$(echo $DATABASE_URL | grep -oP '://[^:]+:\K[^@]+')
DB_NAME=$(echo $DATABASE_URL | grep -oP '@[^/]+/\K[^?]+')

# Create kampung table
PGPASSWORD=$DB_PASS psql -U $DB_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS kampung (
    id TEXT PRIMARY KEY,
    masjid_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT kampung_masjid_id_fkey FOREIGN KEY (masjid_id) 
        REFERENCES masjid(id) ON DELETE CASCADE
);

ALTER TABLE kampung ADD CONSTRAINT kampung_name_key UNIQUE (name);
CREATE INDEX IF NOT EXISTS kampung_masjid_id_idx ON kampung(masjid_id);
ALTER TABLE household_version ADD COLUMN IF NOT EXISTS village TEXT;
EOF

echo "✅ Kampung table created!"
```

Make it executable and run:
```bash
chmod +x create-kampung.sh
./create-kampung.sh
```

## Troubleshooting

### Issue: "relation kampung already exists"

This means the table already exists. Skip Step 2 and proceed to Step 5 (seeding data).

### Issue: "column village already exists"

This means the column already exists. Skip Step 3.

### Issue: "permission denied"

Make sure you're using the correct database user with CREATE TABLE permissions.

---

**Note:** After running these SQL commands, your database will have the kampung table and village column, matching your Prisma schema.
