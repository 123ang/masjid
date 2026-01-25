# Gender Field Implementation Guide

## Overview
This guide documents the implementation of gender fields (Lelaki/Perempuan) for both the applicant (Maklumat Pemohon) and dependents (Ahli Tanggungan) with automatic detection based on IC number.

## Features Implemented

### 1. Auto-Detection Logic
- **Last digit of IC number determines gender:**
  - Odd number (1, 3, 5, 7, 9) = Lelaki (Male)
  - Even number (0, 2, 4, 6, 8) = Perempuan (Female)
- Users can manually override the auto-detected gender using a dropdown

### 2. Database Changes
- Added `Gender` enum type with values: `LELAKI`, `PEREMPUAN`
- Added `gender` field to `household_version` table (for applicants)
- Added `gender` field to `person` table (for dependents)

### 3. Frontend Changes
- Gender dropdown added to "Maklumat Pemohon" section
- Gender dropdown added to each dependent in "Senarai Tanggungan"
- Auto-detection triggers when IC number is entered or changed
- Gender field shows in both "Borang Baru" and "Kemas Kini Isi Rumah" forms

## Deployment Steps

### Step 1: Database Migration

Run the SQL migration file:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database_name -f ADD_GENDER_FIELD.sql
```

Or manually execute the SQL commands in your database management tool.

### Step 2: Backend Update

1. Navigate to backend directory:
```bash
cd backend
```

2. Generate Prisma client with new schema:
```bash
npx prisma generate
```

3. Verify the schema is valid:
```bash
npx prisma validate
```

4. Restart the backend server:
```bash
npm run start:dev
```

### Step 3: Frontend Update

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Build the frontend:
```bash
npm run build
```

3. Restart the frontend server:
```bash
npm run start
# or for development
npm run dev
```

## Files Modified

### Backend Files
1. `backend/prisma/schema.prisma`
   - Added `Gender` enum
   - Added `gender` field to `HouseholdVersion` model
   - Added `gender` field to `Person` model

2. `backend/src/household/dto/create-household.dto.ts`
   - Added `Gender` enum export
   - Added `gender` field to `DependentDto` class
   - Added `gender` field to `CreateHouseholdDto` class

3. `backend/src/household/dto/update-household.dto.ts`
   - Inherits changes from `CreateHouseholdDto`

4. `backend/src/household/household.service.ts`
   - Updated `create()` method to save gender for applicant and dependents
   - Updated `update()` method to save gender for applicant and dependents

### Frontend Files
1. `frontend/src/types/index.ts`
   - Added `Gender` enum
   - Added `gender` field to `Person` interface
   - Added `gender` field to `HouseholdVersionDependent` interface
   - Added `gender` field to `HouseholdVersion` interface
   - Added `gender` field to `CreateHouseholdDto` interface

2. `frontend/src/components/forms/HouseholdForm.tsx`
   - Added `detectGenderFromIC()` function
   - Added `handleApplicantIcChange()` function
   - Added gender dropdown to Maklumat Pemohon section
   - Auto-detection on IC number entry

3. `frontend/src/components/forms/DependentFields.tsx`
   - Added `detectGenderFromIC()` function
   - Added `handleDependentIcChange()` function
   - Added gender dropdown to each dependent
   - Auto-detection on IC number entry

### New Files
1. `ADD_GENDER_FIELD.sql` - Database migration script
2. `GENDER_IMPLEMENTATION_GUIDE.md` - This file

## Testing Checklist

### Test Cases

- [ ] **New Form (Borang Baru)**
  - [ ] Enter IC number for applicant - verify gender auto-fills
  - [ ] Manually change gender - verify it stays changed
  - [ ] Add dependent with IC number - verify gender auto-fills
  - [ ] Save form and verify data is stored correctly

- [ ] **Update Form (Kemas Kini)**
  - [ ] Load existing household without gender data
  - [ ] Enter/change IC number - verify gender auto-detects
  - [ ] Update gender manually - verify it saves correctly
  - [ ] Add new dependent with IC number - verify gender auto-fills

- [ ] **Edge Cases**
  - [ ] IC number less than 12 digits - gender should not auto-fill
  - [ ] IC number with last digit 0 (even) - should be Perempuan
  - [ ] IC number with last digit 9 (odd) - should be Lelaki
  - [ ] Clear IC number - gender should remain as previously selected

- [ ] **API Validation**
  - [ ] Verify gender is saved in database for applicant
  - [ ] Verify gender is saved in database for dependents
  - [ ] Verify gender can be null/empty (optional field)

## Example IC Numbers for Testing

- **Lelaki (Male):**
  - 900101-01-5001 (last digit 1 - odd)
  - 850615-02-5003 (last digit 3 - odd)
  - 920925-03-5005 (last digit 5 - odd)

- **Perempuan (Female):**
  - 880505-04-5002 (last digit 2 - even)
  - 750820-05-5004 (last digit 4 - even)
  - 930112-06-5000 (last digit 0 - even)

## Rollback Instructions

If you need to rollback these changes:

```sql
-- Remove gender columns
ALTER TABLE "household_version" DROP COLUMN IF EXISTS "gender";
ALTER TABLE "person" DROP COLUMN IF EXISTS "gender";

-- Drop the Gender enum type (only if not used elsewhere)
DROP TYPE IF EXISTS "Gender";
```

Then revert the code changes using git:
```bash
git revert HEAD
```

## Notes

- Gender field is optional - forms can be submitted without gender
- Auto-detection is a convenience feature - users can always override
- Existing data will not have gender information until updated
- Gender display uses Malay terms: "Lelaki" (Male), "Perempuan" (Female)

## Support

For issues or questions regarding this implementation:
1. Check the test cases above
2. Review the error logs in browser console (frontend) or server logs (backend)
3. Verify database migration was successful
4. Ensure Prisma client was regenerated after schema changes
