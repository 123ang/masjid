-- SQL script to add poskod, daerah, and negeri columns to household_version table
-- Run this script manually on your PostgreSQL database

-- Add poskod column (nullable, VARCHAR)
ALTER TABLE household_version
ADD COLUMN IF NOT EXISTS poskod VARCHAR(10);

-- Add daerah column (nullable, VARCHAR, default 'Langkawi')
ALTER TABLE household_version
ADD COLUMN IF NOT EXISTS daerah VARCHAR(100) DEFAULT 'Langkawi';

-- Add negeri column (nullable, VARCHAR, default 'Kedah')
ALTER TABLE household_version
ADD COLUMN IF NOT EXISTS negeri VARCHAR(100) DEFAULT 'Kedah';

-- Update existing rows to set default values for daerah and negeri if they are NULL
UPDATE household_version
SET daerah = 'Langkawi'
WHERE daerah IS NULL;

UPDATE household_version
SET negeri = 'Kedah'
WHERE negeri IS NULL;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN household_version.poskod IS 'Postcode (07000 or 07100)';
COMMENT ON COLUMN household_version.daerah IS 'District (default: Langkawi)';
COMMENT ON COLUMN household_version.negeri IS 'State (default: Kedah)';
