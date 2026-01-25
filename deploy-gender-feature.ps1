# Gender Feature Deployment Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Gender Feature Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Run Database Migration
Write-Host "Step 1: Running database migration..." -ForegroundColor Yellow
Write-Host "Please run this SQL file in your database:" -ForegroundColor White
Write-Host "  File: ADD_GENDER_FIELD.sql" -ForegroundColor Green
Write-Host ""
$continue = Read-Host "Have you run the SQL migration? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Please run the migration first, then run this script again." -ForegroundColor Red
    exit
}

# Step 2: Regenerate Prisma Client
Write-Host ""
Write-Host "Step 2: Regenerating Prisma client..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma client!" -ForegroundColor Red
    exit 1
}

Write-Host "Prisma client generated successfully!" -ForegroundColor Green

# Step 3: Restart Backend
Write-Host ""
Write-Host "Step 3: Backend needs to be restarted" -ForegroundColor Yellow
Write-Host "Please restart your backend server:" -ForegroundColor White
Write-Host "  npm run start:dev" -ForegroundColor Green
Write-Host ""

# Step 4: Restart Frontend
Write-Host "Step 4: Frontend may need to be restarted" -ForegroundColor Yellow
Write-Host "If frontend has issues, restart with:" -ForegroundColor White
Write-Host "  cd frontend" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Deployment Steps Summary:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. ✓ Database migration (you confirmed)" -ForegroundColor Green
Write-Host "2. ✓ Prisma client generated" -ForegroundColor Green
Write-Host "3. ⚠ Please restart backend server now" -ForegroundColor Yellow
Write-Host "4. ⚠ Restart frontend if needed" -ForegroundColor Yellow
Write-Host ""
Write-Host "After restarting backend, the gender chart should work!" -ForegroundColor Green

Set-Location ..
