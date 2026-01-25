# Multi-Tenant Deployment Guide

This guide covers the complete deployment of the multi-tenant i-masjid.my platform.

## Prerequisites

- Access to VPS server
- Cloudflare account with i-masjid.my domain
- PostgreSQL database access
- SSH access to VPS

---

## Step 1: Database Migration

### 1.1 Run Multi-Tenant Schema Migration

Connect to your PostgreSQL database and run:

```bash
# On VPS, connect to database
psql -h localhost -U postgres -d masjid_db
```

Then execute the migration script:

```sql
-- Run the ADD_MULTI_TENANT.sql script
\i /path/to/ADD_MULTI_TENANT.sql
```

Or copy the contents from `ADD_MULTI_TENANT.sql` and paste into psql.

### 1.2 Migrate Existing Al-Huda Data

```sql
-- Run the MIGRATE_ALHUDA.sql script
\i /path/to/MIGRATE_ALHUDA.sql
```

### 1.3 Create Master Admin Account

```sql
-- Generate password hash (run in Node.js)
-- node -e "console.log(require('bcrypt').hashSync('YOUR_PASSWORD', 10))"

-- Update the master admin password
UPDATE "master_admin" 
SET "password_hash" = '$2b$10$YOUR_GENERATED_HASH_HERE'
WHERE "email" = 'admin@i-masjid.my';
```

---

## Step 2: Backend Deployment

### 2.1 Pull Latest Code

```bash
cd /path/to/masjid/backend
git pull origin main
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Generate Prisma Client

```bash
npx prisma generate
```

### 2.4 Build Backend

```bash
npm run build
```

### 2.5 Restart Backend Service

```bash
# Using PM2
pm2 restart masjid-backend

# Or using systemd
sudo systemctl restart masjid-backend
```

---

## Step 3: Frontend Deployment

### 3.1 Pull Latest Code

```bash
cd /path/to/masjid/frontend
git pull origin main
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Build Frontend

```bash
npm run build
```

### 3.4 Restart Frontend Service

```bash
# Using PM2
pm2 restart masjid-frontend

# Or using systemd
sudo systemctl restart masjid-frontend
```

---

## Step 4: Infrastructure Setup

Follow the instructions in `MULTI_TENANT_SETUP.md` for:

1. Cloudflare DNS configuration
2. Wildcard SSL certificate
3. Nginx configuration

---

## Step 5: Verification

### 5.1 Test Master Dashboard

1. Navigate to `https://i-masjid.my/master/login`
2. Login with master admin credentials
3. Verify dashboard loads and shows stats

### 5.2 Test Existing Tenant

1. Navigate to `https://alhuda.i-masjid.my`
2. Verify the site loads correctly
3. Login with existing user credentials
4. Verify all data is accessible

### 5.3 Test Creating New Tenant

1. From master dashboard, create a new tenant
2. Try accessing the new subdomain
3. Login with the created admin credentials

---

## Rollback Plan

If issues occur, you can rollback:

### Database Rollback

```sql
-- Remove tenant link from masjid
UPDATE "masjid" SET "tenant_id" = NULL;

-- Drop new tables (CAUTION: data will be lost)
DROP TABLE IF EXISTS "master_admin" CASCADE;
DROP TABLE IF EXISTS "tenant" CASCADE;

-- Drop new column from masjid
ALTER TABLE "masjid" DROP COLUMN IF EXISTS "tenant_id";

-- Drop new enum types
DROP TYPE IF EXISTS "MasterRole";
DROP TYPE IF EXISTS "TenantStatus";
```

### Code Rollback

```bash
# Rollback to previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
npm run build
pm2 restart all
```

---

## New API Endpoints

### Master Auth
- `POST /api/master/auth/login` - Master admin login
- `POST /api/master/auth/refresh` - Refresh token
- `GET /api/master/auth/me` - Get current admin

### Tenant Management (Master only)
- `GET /api/master/tenants` - List all tenants
- `GET /api/master/tenants/stats` - Get platform stats
- `GET /api/master/tenants/:slug` - Get tenant details
- `POST /api/master/tenants` - Create new tenant
- `PUT /api/master/tenants/:slug` - Update tenant
- `DELETE /api/master/tenants/:slug` - Deactivate tenant

### Public (with tenant context)
- `GET /api/analytics/public/tenant-info` - Get tenant branding

---

## Environment Variables

No new environment variables are required. The system uses:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (used for both tenant and master auth)

---

## File Changes Summary

### New Files

**Backend:**
- `src/master/` - Master admin module
  - `master.module.ts`
  - `master-auth.controller.ts`
  - `master-auth.service.ts`
  - `tenant.controller.ts`
  - `tenant.service.ts`
  - `dto/master-login.dto.ts`
  - `dto/create-tenant.dto.ts`
  - `guards/master-auth.guard.ts`
- `src/tenant/` - Tenant middleware
  - `tenant.module.ts`
  - `tenant.middleware.ts`

**Frontend:**
- `src/app/master/` - Master dashboard pages
  - `layout.tsx`
  - `login/page.tsx`
  - `dashboard/page.tsx`
  - `tenants/page.tsx`
  - `tenants/baru/page.tsx`
- `src/lib/tenant.ts` - Subdomain detection
- `src/context/TenantContext.tsx` - Tenant context

### Modified Files

**Backend:**
- `prisma/schema.prisma` - Added Tenant, MasterAdmin models
- `src/app.module.ts` - Added MasterModule, TenantModule
- `src/main.ts` - Updated CORS for wildcard domains
- `src/analytics/analytics.public.controller.ts` - Added tenant context

**Frontend:**
- `src/app/layout.tsx` - Added TenantProvider

---

## Support

If you encounter issues:

1. Check backend logs: `pm2 logs masjid-backend`
2. Check frontend logs: `pm2 logs masjid-frontend`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify database connection and migrations
