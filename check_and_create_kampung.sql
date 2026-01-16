-- Quick Check and Create Script for Kampung
-- Run this in PostgreSQL to check and create kampung table

-- Step 1: Check if kampung table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'kampung'
        ) THEN '✅ Kampung table EXISTS'
        ELSE '❌ Kampung table DOES NOT EXIST'
    END as kampung_table_status;

-- Step 2: Check if village column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'household_version'
            AND column_name = 'village'
        ) THEN '✅ Village column EXISTS'
        ELSE '❌ Village column DOES NOT EXIST'
    END as village_column_status;

-- Step 3: CREATE KAMPUNG TABLE (only if it doesn't exist)
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

-- Step 4: Add unique constraint on name (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'kampung_name_key'
    ) THEN
        ALTER TABLE kampung ADD CONSTRAINT kampung_name_key UNIQUE (name);
    END IF;
END $$;

-- Step 5: Create index (if not exists)
CREATE INDEX IF NOT EXISTS kampung_masjid_id_idx ON kampung(masjid_id);

-- Step 6: Add village column to household_version (if not exists)
ALTER TABLE household_version 
ADD COLUMN IF NOT EXISTS village TEXT;

-- Step 7: Verify everything
SELECT '✅ All tables and columns created/verified!' as status;

-- Step 8: Show kampung table structure
\d kampung

-- Step 9: Check if any kampung data exists
SELECT COUNT(*) as kampung_count FROM kampung;
