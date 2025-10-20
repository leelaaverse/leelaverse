# Alternative Installation Script for SSL Cipher Issues
# Run this in PowerShell as Administrator

Write-Host "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🔧 Alternative Package Installation Script              ║
║  Workaround for SSL Cipher Errors                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$backendPath = "c:\Users\a2z\Desktop\leelaverse\backend"
Set-Location $backendPath

Write-Host "Current Node.js version: $(node --version)" -ForegroundColor Yellow
Write-Host "Current OpenSSL version: $(node -p 'process.versions.openssl')" -ForegroundColor Yellow
Write-Host ""

# Solution 1: Try with specific Node TLS settings
Write-Host "Attempt 1: Using legacy TLS settings..." -ForegroundColor Cyan
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$env:NODE_OPTIONS = "--openssl-legacy-provider --no-experimental-fetch"

npm cache clean --force 2>$null

Write-Host "Trying npm install with adjusted settings..." -ForegroundColor Yellow
npm install --legacy-peer-deps --prefer-offline --no-audit 2>&1 | Tee-Object -Variable installOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Installation successful!" -ForegroundColor Green
    exit 0
}

# Solution 2: Try individual package installation
Write-Host "`nAttempt 2: Installing packages individually..." -ForegroundColor Cyan

$packages = @(
    "express@^4.18.2",
    "cors@^2.8.5",
    "dotenv@^16.3.1",
    "helmet@^7.1.0",
    "bcryptjs@^2.4.3",
    "jsonwebtoken@^9.0.2",
    "express-rate-limit@^7.1.5",
    "express-session@^1.18.2",
    "express-validator@^7.0.1",
    "@fal-ai/client@^1.6.2",
    "axios@^1.12.2",
    "cloudinary@^1.41.3",
    "google-auth-library@^10.4.0",
    "node-fetch@^3.3.2",
    "passport@^0.7.0",
    "passport-google-oauth20@^2.0.0"
)

$devPackages = @(
    "nodemon@^3.0.2"
)

foreach ($package in $packages) {
    Write-Host "Installing $package..." -ForegroundColor Yellow
    npm install $package --save --legacy-peer-deps --no-audit 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $package installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $package failed, continuing..." -ForegroundColor Red
    }
}

foreach ($package in $devPackages) {
    Write-Host "Installing $package (dev)..." -ForegroundColor Yellow
    npm install $package --save-dev --legacy-peer-deps --no-audit 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $package installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $package failed, continuing..." -ForegroundColor Red
    }
}

# Solution 3: Try Prisma separately with direct download
Write-Host "`nAttempt 3: Installing Prisma separately..." -ForegroundColor Cyan

# Try npx to download Prisma directly
Write-Host "Downloading Prisma CLI..." -ForegroundColor Yellow
npx --yes prisma@latest --version

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma CLI downloaded" -ForegroundColor Green

    # Manually install @prisma/client
    Write-Host "Installing @prisma/client..." -ForegroundColor Yellow
    npm install @prisma/client@latest --save --legacy-peer-deps --no-audit

    Write-Host "Installing prisma (dev)..." -ForegroundColor Yellow
    npm install prisma@latest --save-dev --legacy-peer-deps --no-audit
}

# Check installation status
Write-Host "`n" -NoNewline
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Installation Status Check" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan

$nodeModulesPath = Join-Path $backendPath "node_modules"

$criticalPackages = @{
    "express" = "Web Server"
    "@prisma/client" = "Prisma Client"
    "prisma" = "Prisma CLI"
    "bcryptjs" = "Password Hashing"
    "jsonwebtoken" = "JWT Tokens"
}

$allInstalled = $true

foreach ($pkg in $criticalPackages.Keys) {
    $pkgPath = Join-Path $nodeModulesPath $pkg
    if (Test-Path $pkgPath) {
        Write-Host "✅ $pkg - $($criticalPackages[$pkg])" -ForegroundColor Green
    } else {
        Write-Host "❌ $pkg - $($criticalPackages[$pkg]) - MISSING" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""

if ($allInstalled) {
    Write-Host "🎉 All critical packages installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. npx prisma generate" -ForegroundColor White
    Write-Host "  2. npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host "  3. npm run dev" -ForegroundColor White
} else {
    Write-Host "⚠️  Some packages are missing." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative solutions:" -ForegroundColor Cyan
    Write-Host "  1. Update Node.js to v20.11 LTS" -ForegroundColor White
    Write-Host "  2. Use NVM to switch to Node.js v18" -ForegroundColor White
    Write-Host "  3. Install Yarn: npm install -g yarn; yarn install" -ForegroundColor White
    Write-Host "  4. Try on different network/WiFi" -ForegroundColor White
    Write-Host "  5. Read NPM_INSTALL_FIX.md for more solutions" -ForegroundColor White
}

# Reset environment variables
$env:NODE_TLS_REJECT_UNAUTHORIZED = ""
$env:NODE_OPTIONS = ""

Write-Host ""
