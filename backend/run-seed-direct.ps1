# PowerShell script to run seed with explicit DATABASE_URL

Write-Host "Running database seed..." -ForegroundColor Green

# Set DATABASE_URL explicitly
$env:DATABASE_URL = "postgresql://postgres:920214@localhost:5432/mkcs_db"

# Compile TypeScript to JavaScript
Write-Host "Compiling seed script..." -ForegroundColor Gray
npx tsc prisma/seed.ts --outDir prisma --skipLibCheck --esModuleInterop --resolveJsonModule --module commonjs --target es2020

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed" -ForegroundColor Red
    exit 1
}

# Run the compiled JavaScript
Write-Host "Running seed..." -ForegroundColor Gray
node prisma/seed.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "Seed completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Seed failed" -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item prisma/seed.js -ErrorAction SilentlyContinue
