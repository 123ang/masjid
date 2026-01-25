-- Migration: Add Multi-Tenant Support
-- Date: 2026-01-25
-- Description: Adds Tenant and MasterAdmin tables for multi-tenant architecture

-- ============================================
-- Step 1: Create new ENUM types
-- ============================================

DO $$ BEGIN
    CREATE TYPE "MasterRole" AS ENUM ('SUPER_ADMIN', 'SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Step 2: Create master_admin table
-- ============================================

CREATE TABLE IF NOT EXISTS "master_admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "MasterRole" NOT NULL DEFAULT 'SUPPORT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "master_admin_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "master_admin_email_key" ON "master_admin"("email");

-- ============================================
-- Step 3: Create tenant table
-- ============================================

CREATE TABLE IF NOT EXISTS "tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "logo" TEXT,
    "primary_color" TEXT DEFAULT '#16a34a',
    "secondary_color" TEXT DEFAULT '#15803d',
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "tenant_slug_key" ON "tenant"("slug");

-- ============================================
-- Step 4: Add tenant_id column to masjid table
-- ============================================

ALTER TABLE "masjid" 
ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;

-- Create unique index on tenant_id (one masjid per tenant)
CREATE UNIQUE INDEX IF NOT EXISTS "masjid_tenant_id_key" ON "masjid"("tenant_id");

-- Add foreign key constraint
DO $$ BEGIN
    ALTER TABLE "masjid" 
    ADD CONSTRAINT "masjid_tenant_id_fkey" 
    FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Step 5: Create initial master admin (CHANGE PASSWORD!)
-- ============================================

-- Generate a bcrypt hash for 'admin123' - YOU MUST CHANGE THIS!
-- Use: node -e "console.log(require('bcrypt').hashSync('YOUR_PASSWORD', 10))"
INSERT INTO "master_admin" ("id", "email", "password_hash", "name", "role", "is_active", "created_at", "updated_at")
VALUES (
    'master_' || gen_random_uuid()::text,
    'admin@i-masjid.my',
    '$2b$10$rQZQZQZQZQZQZQZQZQZQZeYK3YK3YK3YK3YK3YK3YK3YK3YK3YK3Y', -- CHANGE THIS!
    'Master Admin',
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Step 6: Add comments for documentation
-- ============================================

COMMENT ON TABLE "master_admin" IS 'Super admin users for master dashboard at i-masjid.my';
COMMENT ON TABLE "tenant" IS 'Tenants (masjids) with their subdomain and branding settings';
COMMENT ON COLUMN "tenant"."slug" IS 'Subdomain identifier (e.g., alhuda for alhuda.i-masjid.my)';
COMMENT ON COLUMN "tenant"."primary_color" IS 'Primary brand color in hex format';
COMMENT ON COLUMN "tenant"."secondary_color" IS 'Secondary brand color in hex format';
COMMENT ON COLUMN "masjid"."tenant_id" IS 'Reference to tenant for multi-tenant support';

-- ============================================
-- Success message
-- ============================================

DO $$ 
DECLARE
    master_count INTEGER;
    tenant_count INTEGER;
BEGIN 
    SELECT COUNT(*) INTO master_count FROM "master_admin";
    SELECT COUNT(*) INTO tenant_count FROM "tenant";
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Multi-Tenant Migration Completed Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '- Created master_admin table';
    RAISE NOTICE '- Created tenant table';
    RAISE NOTICE '- Added tenant_id to masjid table';
    RAISE NOTICE '- Master admins count: %', master_count;
    RAISE NOTICE '- Tenants count: %', tenant_count;
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Change the master admin password!';
    RAISE NOTICE '';
END $$;
