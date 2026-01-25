-- Migration: Add Gender field to HouseholdVersion and Person tables
-- Date: 2026-01-25
-- Description: Adds gender (LELAKI/PEREMPUAN) field for applicants and dependents

-- Step 1: Create Gender enum type
DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM ('LELAKI', 'PEREMPUAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add gender column to household_version table (for applicants)
ALTER TABLE "household_version" 
ADD COLUMN IF NOT EXISTS "gender" "Gender";

-- Step 3: Add gender column to person table (for dependents)
ALTER TABLE "person" 
ADD COLUMN IF NOT EXISTS "gender" "Gender";

-- Step 4: Auto-populate gender based on IC number for applicants
-- Last digit odd = LELAKI (Male), Last digit even = PEREMPUAN (Female)
UPDATE "household_version"
SET "gender" = CASE
    WHEN LENGTH(ic_no) = 12 AND RIGHT(ic_no, 1) ~ '^[0-9]$' THEN
        CASE
            WHEN CAST(RIGHT(ic_no, 1) AS INTEGER) % 2 = 1 THEN 'LELAKI'::"Gender"
            WHEN CAST(RIGHT(ic_no, 1) AS INTEGER) % 2 = 0 THEN 'PEREMPUAN'::"Gender"
            ELSE NULL
        END
    ELSE NULL
END
WHERE "gender" IS NULL 
  AND ic_no IS NOT NULL 
  AND LENGTH(ic_no) = 12
  AND RIGHT(ic_no, 1) ~ '^[0-9]$';

-- Step 5: Auto-populate gender based on IC number for dependents
UPDATE "person"
SET "gender" = CASE
    WHEN LENGTH(ic_no) = 12 AND RIGHT(ic_no, 1) ~ '^[0-9]$' THEN
        CASE
            WHEN CAST(RIGHT(ic_no, 1) AS INTEGER) % 2 = 1 THEN 'LELAKI'::"Gender"
            WHEN CAST(RIGHT(ic_no, 1) AS INTEGER) % 2 = 0 THEN 'PEREMPUAN'::"Gender"
            ELSE NULL
        END
    ELSE NULL
END
WHERE "gender" IS NULL 
  AND ic_no IS NOT NULL 
  AND LENGTH(ic_no) = 12
  AND RIGHT(ic_no, 1) ~ '^[0-9]$';

-- Add comments for documentation
COMMENT ON COLUMN "household_version"."gender" IS 'Gender of the applicant (LELAKI = Male, PEREMPUAN = Female)';
COMMENT ON COLUMN "person"."gender" IS 'Gender of the person (LELAKI = Male, PEREMPUAN = Female)';

-- Success message
DO $$ 
DECLARE
    applicant_count INTEGER;
    dependent_count INTEGER;
BEGIN 
    -- Count updated records
    SELECT COUNT(*) INTO applicant_count 
    FROM "household_version" 
    WHERE "gender" IS NOT NULL;
    
    SELECT COUNT(*) INTO dependent_count 
    FROM "person" 
    WHERE "gender" IS NOT NULL;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE '- Gender fields added to household_version and person tables';
    RAISE NOTICE '- Auto-populated % applicants with gender from IC number', applicant_count;
    RAISE NOTICE '- Auto-populated % dependents with gender from IC number', dependent_count;
END $$;
