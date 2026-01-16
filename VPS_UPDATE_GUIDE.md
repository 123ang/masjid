# VPS Update Guide - Adding Kampung Feature

This guide will help you update your VPS deployment to include the new Kampung (Village) management feature.

## Prerequisites

- SSH access to your VPS
- Access to your PostgreSQL database
- Git repository access (or ability to upload files)

## Step-by-Step Update Process

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### Step 2: Navigate to Project Directory

```bash
cd /root/projects/masjid
# or wherever your project is located
```

### Step 3: Pull Latest Code (if using Git)

If you're using Git:

```bash
# Backup current code (optional but recommended)
cp -r backend backend-backup-$(date +%Y%m%d)
cp -r frontend frontend-backup-$(date +%Y%m%d)

# Pull latest changes
git pull origin main
# or
git pull origin master
```

If you're not using Git, you'll need to:
1. Upload the updated files via SCP/SFTP
2. Or manually copy the new files

### Step 4: Update Backend Dependencies

```bash
cd backend
npm install
```

This ensures all new dependencies (if any) are installed.

### Step 5: Run Database Migration

This is the **most important step** - it will create the `kampung` table in PostgreSQL.

```bash
# Make sure you're in the backend directory
cd /root/projects/masjid/backend

# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate deploy
```

**Alternative: If migrate deploy doesn't work, use:**

```bash
# Create a new migration
npx prisma migrate dev --name add_kampung_model

# Then apply it to production
npx prisma migrate deploy
```

**Note:** The migration will:
- Create the `kampung` table
- Add the `village` field to `household_version` table (if not already there)
- Set up proper relationships

### Step 6: Verify Database Migration

Connect to PostgreSQL and verify the table was created:

```bash
# Connect to PostgreSQL
psql -U your_db_user -d your_database_name

# Check if kampung table exists
\dt kampung

# Check the structure
\d kampung

# Exit PostgreSQL
\q
```

You should see a table with columns:
- `id` (primary key)
- `masjid_id` (foreign key)
- `name` (village name)
- `is_active` (boolean)
- `created_at`
- `updated_at`

### Step 7: Build Backend

```bash
cd /root/projects/masjid/backend
npm run build
```

This compiles TypeScript to JavaScript in the `dist` folder.

### Step 8: Update Frontend Dependencies

```bash
cd /root/projects/masjid/frontend
npm install
```

### Step 9: Build Frontend

```bash
cd /root/projects/masjid/frontend
npm run build
```

This creates the production build in the `.next` folder.

### Step 10: Restart Services with PM2

```bash
# Navigate to project root
cd /root/projects/masjid

# Restart all services
pm2 restart all

# Or restart individually
pm2 restart mkcs-backend
pm2 restart mkcs-frontend

# Check status
pm2 status

# View logs if needed
pm2 logs mkcs-backend
pm2 logs mkcs-frontend
```

### Step 11: Verify the Update

1. **Check Backend Logs:**
   ```bash
   pm2 logs mkcs-backend --lines 50
   ```
   Look for any errors. The backend should start successfully.

2. **Check Frontend Logs:**
   ```bash
   pm2 logs mkcs-frontend --lines 50
   ```

3. **Test the Application:**
   - Open your website in a browser
   - Log in as an ADMIN user
   - Navigate to "Pengurusan Kampung" (should be visible in the sidebar/navbar)
   - Try creating a new kampung

### Step 12: Verify Nginx Configuration (if needed)

If you're using Nginx, make sure it's still working:

```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Reload Nginx if needed
sudo systemctl reload nginx
```

## Troubleshooting

### Issue: Migration Fails

**Error:** `Error: P3005 - Database schema is not in sync with migrations`

**Solution:**
```bash
# Reset and apply migrations (WARNING: This will drop all data!)
npx prisma migrate reset

# OR manually create the table in PostgreSQL:
psql -U your_db_user -d your_database_name
```

Then run this SQL:
```sql
CREATE TABLE kampung (
    id TEXT PRIMARY KEY,
    masjid_id TEXT NOT NULL REFERENCES masjid(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX kampung_masjid_id_idx ON kampung(masjid_id);
```

### Issue: Backend Won't Start

**Check:**
1. Database connection in `.env` file
2. Port availability (check if port 4008 is free)
3. PM2 logs: `pm2 logs mkcs-backend`

**Solution:**
```bash
# Check if port is in use
sudo netstat -tulpn | grep 4008

# Kill process if needed
sudo kill -9 <PID>

# Restart backend
pm2 restart mkcs-backend
```

### Issue: Frontend Shows Old Version

**Solution:**
```bash
# Clear Next.js cache
cd /root/projects/masjid/frontend
rm -rf .next

# Rebuild
npm run build

# Restart
pm2 restart mkcs-frontend
```

## Quick Update Script

Save this as `update-vps.sh` and run it:

```bash
#!/bin/bash

# VPS Update Script for Kampung Feature
set -e

echo "Starting VPS update..."

# Navigate to project
cd /root/projects/masjid

# Backup (optional)
echo "Creating backup..."
cp -r backend backend-backup-$(date +%Y%m%d-%H%M%S) || true

# Update backend
echo "Updating backend..."
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Update frontend
echo "Updating frontend..."
cd ../frontend
npm install
npm run build

# Restart services
echo "Restarting services..."
cd ..
pm2 restart all

echo "Update complete! Check logs with: pm2 logs"
```

Make it executable:
```bash
chmod +x update-vps.sh
./update-vps.sh
```

## Manual Database Migration (If Prisma Migrate Fails)

If `prisma migrate deploy` doesn't work, you can manually create the table:

```bash
psql -U your_db_user -d your_database_name
```

Then run:

```sql
-- Create kampung table
CREATE TABLE IF NOT EXISTS kampung (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    masjid_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT kampung_masjid_id_fkey FOREIGN KEY (masjid_id) 
        REFERENCES masjid(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS kampung_masjid_id_idx ON kampung(masjid_id);

-- Verify table was created
\dt kampung

-- Exit
\q
```

## Post-Update Checklist

- [ ] Database migration completed successfully
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] PM2 services are running
- [ ] Can access the website
- [ ] Can log in as ADMIN
- [ ] "Pengurusan Kampung" menu appears
- [ ] Can create a new kampung
- [ ] Can edit/delete kampung
- [ ] No errors in PM2 logs

## Rollback (If Something Goes Wrong)

If you need to rollback:

```bash
# Stop services
pm2 stop all

# Restore backup
cd /root/projects/masjid
rm -rf backend frontend
mv backend-backup-YYYYMMDD backend
mv frontend-backup-YYYYMMDD frontend

# Restart
pm2 restart all
```

## Need Help?

If you encounter issues:

1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check database connection in `.env` file
4. Verify all environment variables are set correctly

---

**Last Updated:** $(date)
**Version:** 1.0
