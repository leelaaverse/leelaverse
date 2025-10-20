# Leelaverse Database Migration Script
# MongoDB → PostgreSQL (Supabase + Prisma)

Write-Host "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🔄 Leelaverse Database Migration                     ║
║     MongoDB → PostgreSQL (Supabase + Prisma)             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Navigate to backend directory
$backendPath = "c:\Users\a2z\Desktop\leelaverse\backend"
Set-Location $backendPath

Write-Host "📁 Working directory: $backendPath" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1/5: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully`n" -ForegroundColor Green

# Step 2: Generate Prisma Client
Write-Host "Step 2/5: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated successfully`n" -ForegroundColor Green

# Step 3: Validate schema
Write-Host "Step 3/5: Validating Prisma schema..." -ForegroundColor Yellow
npx prisma validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Schema validation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema is valid`n" -ForegroundColor Green

# Step 4: Run migration
Write-Host "Step 4/5: Running database migration..." -ForegroundColor Yellow
Write-Host "⚠️  This will create tables in your Supabase database" -ForegroundColor Cyan
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Red
    exit 0
}

npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host "💡 Check your DATABASE_URL in .env file" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Migration completed successfully`n" -ForegroundColor Green

# Step 5: Verify
Write-Host "Step 5/5: Verifying migration..." -ForegroundColor Yellow
npx prisma migrate status
Write-Host "✅ Migration verification complete`n" -ForegroundColor Green

# Success message
Write-Host "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ✅ MIGRATION COMPLETED SUCCESSFULLY!                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npx prisma studio (to view your database)" -ForegroundColor White
Write-Host "  2. Run: npm run dev (to start the server)" -ForegroundColor White
Write-Host "  3. Test authentication endpoints" -ForegroundColor White
Write-Host "  4. Read NEXT_STEPS.md for remaining tasks" -ForegroundColor White
Write-Host ""

# Option to open Prisma Studio
$openStudio = Read-Host "Open Prisma Studio to view database? (y/n)"
if ($openStudio -eq "y") {
    Write-Host "Opening Prisma Studio..." -ForegroundColor Yellow
    Start-Process npx -ArgumentList "prisma studio" -NoNewWindow
    Write-Host "✅ Prisma Studio opened at http://localhost:5555" -ForegroundColor Green
}

Write-Host "
🎉 Migration complete! Happy coding!
" -ForegroundColor Magenta
