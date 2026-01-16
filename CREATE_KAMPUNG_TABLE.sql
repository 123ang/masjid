-- SQL Script to Create Kampung Table
-- Run this directly in PostgreSQL if migrations don't work

-- First, check if kampung table already exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'kampung'
);

-- If the above returns false, run the following:

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

-- Create unique constraint on name (if not exists)
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

-- Verify table was created
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'kampung'
ORDER BY ordinal_position;

-- Check if village column exists in household_version table
SELECT EXISTS (
   SELECT FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'household_version'
   AND column_name = 'village'
);

-- If village column doesn't exist, add it:
ALTER TABLE household_version 
ADD COLUMN IF NOT EXISTS village TEXT;

-- Verify all changes
\dt kampung
\d kampung
\d household_version
