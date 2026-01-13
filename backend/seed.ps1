# Prisma Seed Script Runner
# This script sets DATABASE_URL and runs the seed

$env:DATABASE_URL = "postgresql://postgres:920214@localhost:5432/mkcs_db"

Write-Host "🌱 Running Prisma seed..." -ForegroundColor Green
Write-Host "DATABASE_URL: $($env:DATABASE_URL -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray

npx ts-node prisma/seed.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Seed completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Seed failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
