# Run Prisma Seed with DATABASE_URL
# This is a workaround for Prisma 7.2.0 issue

$env:DATABASE_URL = "postgresql://postgres:920214@localhost:5432/mkcs_db"

Write-Host "🌱 Running Prisma seed..." -ForegroundColor Green
Write-Host "DATABASE_URL set in environment" -ForegroundColor Gray

# Run seed directly with node
node prisma/seed.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Seed completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Seed failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
