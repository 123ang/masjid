-- Migration: Migrate existing Al-Huda data to Multi-Tenant Structure
-- Date: 2026-01-25
-- Description: Creates tenant record for existing Al-Huda masjid and links it

-- ============================================
-- Step 1: Check if migration has already been done
-- ============================================

DO $$ 
DECLARE
    existing_tenant_count INTEGER;
    existing_masjid_id TEXT;
BEGIN
    -- Check if tenant already exists
    SELECT COUNT(*) INTO existing_tenant_count FROM "tenant" WHERE slug = 'alhuda';
    
    IF existing_tenant_count > 0 THEN
        RAISE NOTICE 'Migration already completed. Tenant "alhuda" already exists.';
        RETURN;
    END IF;
    
    -- Get the existing masjid ID
    SELECT id INTO existing_masjid_id FROM "masjid" ORDER BY created_at ASC LIMIT 1;
    
    IF existing_masjid_id IS NULL THEN
        RAISE NOTICE 'No existing masjid found. Skipping migration.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found existing masjid with ID: %', existing_masjid_id;
END $$;

-- ============================================
-- Step 2: Create tenant record for Al-Huda
-- ============================================

INSERT INTO "tenant" (
    "id",
    "slug",
    "name",
    "status",
    "logo",
    "primary_color",
    "secondary_color",
    "email",
    "phone",
    "created_at",
    "updated_at"
)
SELECT
    'tenant_alhuda_' || SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8),
    'alhuda',
    name,
    'ACTIVE'::"TenantStatus",
    NULL,
    '#16a34a',  -- Green (existing color)
    '#15803d',  -- Darker green
    NULL,
    phone,
    created_at,
    CURRENT_TIMESTAMP
FROM "masjid"
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Step 3: Link existing masjid to the new tenant
-- ============================================

UPDATE "masjid"
SET "tenant_id" = (
    SELECT id FROM "tenant" WHERE slug = 'alhuda' LIMIT 1
)
WHERE id = (
    SELECT id FROM "masjid" ORDER BY created_at ASC LIMIT 1
)
AND "tenant_id" IS NULL;

-- ============================================
-- Step 4: Verify migration
-- ============================================

DO $$ 
DECLARE
    tenant_record RECORD;
    masjid_record RECORD;
    household_count INTEGER;
    user_count INTEGER;
    kampung_count INTEGER;
BEGIN 
    -- Get tenant info
    SELECT * INTO tenant_record FROM "tenant" WHERE slug = 'alhuda' LIMIT 1;
    
    IF tenant_record IS NULL THEN
        RAISE EXCEPTION 'Migration failed: Tenant not created';
    END IF;
    
    -- Get masjid info
    SELECT * INTO masjid_record FROM "masjid" WHERE tenant_id = tenant_record.id LIMIT 1;
    
    IF masjid_record IS NULL THEN
        RAISE EXCEPTION 'Migration failed: Masjid not linked to tenant';
    END IF;
    
    -- Count records
    SELECT COUNT(*) INTO household_count FROM "household" WHERE masjid_id = masjid_record.id;
    SELECT COUNT(*) INTO user_count FROM "user" WHERE masjid_id = masjid_record.id;
    SELECT COUNT(*) INTO kampung_count FROM "kampung" WHERE masjid_id = masjid_record.id;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Al-Huda Migration Completed Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tenant Details:';
    RAISE NOTICE '  ID: %', tenant_record.id;
    RAISE NOTICE '  Slug: %', tenant_record.slug;
    RAISE NOTICE '  Name: %', tenant_record.name;
    RAISE NOTICE '  Status: %', tenant_record.status;
    RAISE NOTICE '';
    RAISE NOTICE 'Masjid Details:';
    RAISE NOTICE '  ID: %', masjid_record.id;
    RAISE NOTICE '  Name: %', masjid_record.name;
    RAISE NOTICE '  Tenant ID: %', masjid_record.tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Data Summary:';
    RAISE NOTICE '  Households: %', household_count;
    RAISE NOTICE '  Users: %', user_count;
    RAISE NOTICE '  Kampungs: %', kampung_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Access URL: https://alhuda.i-masjid.my';
    RAISE NOTICE '';
END $$;
