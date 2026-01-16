# Guide: Seeding Kampung Data to Database

This guide will help you seed the kampung (village) data to your PostgreSQL database.

## What Changed

1. **Form Updated**: The kampung dropdown in "Borang Baru" and "Kemaskini" now fetches data from the database instead of hardcoded values
2. **Seed Script Updated**: Added kampung seeding to `backend/prisma/seed.ts`
3. **API Access**: All authenticated users can now read kampung list (for form dropdowns)

## How to Seed Kampung Data

### Option 1: Run Full Seed Script (Recommended)

This will seed all data including kampung:

```bash
cd backend
npm run seed
# or
npx ts-node prisma/seed.ts
```

### Option 2: Run Only Kampung Seed (Quick)

If you only want to seed kampung data:

```bash
cd backend

# Connect to your database and run this SQL
psql -U your_db_user -d your_database_name
```

Then run this SQL:

```sql
-- Insert kampung data (replace 'masjid-alhuda' with your actual masjid ID)
INSERT INTO kampung (id, masjid_id, name, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Raja', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Atas', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Atas Selatan', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Bawah', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Darat', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Padang Matsirat', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Kuala Muda', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Paya', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Limbong Putra', true, NOW(), NOW()),
  (gen_random_uuid()::TEXT, 'masjid-alhuda', 'Kg Bukit Nau', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify
SELECT * FROM kampung ORDER BY name;
```

**Note:** Replace `'masjid-alhuda'` with your actual masjid ID. To find your masjid ID:

```sql
SELECT id, name FROM masjid;
```

### Option 3: Using Prisma Studio (GUI)

1. Open Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```

2. Navigate to the `kampung` table
3. Click "Add record"
4. Fill in:
   - `masjidId`: Your masjid ID
   - `name`: Kampung name (e.g., "Kg Raja")
   - `isActive`: true
5. Click "Save 1 change"
6. Repeat for all kampung

## For VPS Deployment

### Step 1: Update Code

Make sure you've uploaded the latest code with kampung feature.

### Step 2: Run Migration (if not done)

```bash
cd /root/projects/masjid/backend
npx prisma migrate deploy
```

### Step 3: Seed Kampung Data

**Option A: Run seed script**
```bash
cd /root/projects/masjid/backend
npm run seed
```

**Option B: Manual SQL (if seed script doesn't work)**
```bash
# Connect to PostgreSQL
psql -U your_db_user -d your_database_name

# Find your masjid ID first
SELECT id, name FROM masjid;

# Then insert kampung (replace 'your-masjid-id' with actual ID)
INSERT INTO kampung (id, masjid_id, name, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid()::TEXT,
  'your-masjid-id',
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

-- Verify
SELECT * FROM kampung ORDER BY name;
\q
```

### Step 4: Restart Backend

```bash
pm2 restart mkcs-backend
```

## Verify It Works

1. **Check Database:**
   ```sql
   SELECT COUNT(*) FROM kampung;
   -- Should return 10
   ```

2. **Test in Browser:**
   - Log in to your application
   - Go to "Borang Baru" or edit an existing household
   - Click on "Nama Kampung" dropdown
   - You should see all 10 kampung listed

3. **Check API:**
   ```bash
   # If you have curl installed
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/kampung
   ```

## Troubleshooting

### Issue: "Nama kampung sudah wujud" Error

This means the kampung already exists. The seed script will skip existing kampung, so this is normal.

### Issue: Dropdown is Empty

1. Check if kampung data exists:
   ```sql
   SELECT * FROM kampung WHERE masjid_id = 'your-masjid-id';
   ```

2. Check backend logs:
   ```bash
   pm2 logs mkcs-backend
   ```

3. Verify API endpoint:
   - Make sure you're logged in
   - Check browser console for API errors
   - Verify the kampung API returns data

### Issue: Can't Create Kampung via UI

- Make sure you're logged in as ADMIN
- Check that the kampung name doesn't already exist
- Verify backend is running and accessible

## Kampung List

The following 10 kampung will be seeded:

1. Kg Raja
2. Kg Atas
3. Kg Atas Selatan
4. Kg Bawah
5. Kg Darat
6. Kg Padang Matsirat
7. Kg Kuala Muda
8. Kg Paya
9. Kg Limbong Putra
10. Kg Bukit Nau

You can add more kampung via the "Pengurusan Kampung" page (ADMIN only) or by running additional SQL inserts.

---

**Last Updated:** $(date)
