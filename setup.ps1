# Plane Project Setup Script (Windows PowerShell)
# Prepares the local development environment
# https://github.com/makeplane/plane

$ErrorActionPreference = "Stop"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "                   Plane - Project Management Tool                    " -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Blue

# Copy .env.example to .env for each service
$services = @("", "web", "api", "space", "admin", "live")
foreach ($service in $services) {
    if ($service -eq "") {
        $source = ".env.example"
        $dest = ".env"
    } else {
        $source = "apps\$service\.env.example"
        $dest = "apps\$service\.env"
    }
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "[OK] Created $dest" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] $source not found" -ForegroundColor Yellow
    }
}

# Add SECRET_KEY to apps/api/.env if not present
$apiEnv = "apps\api\.env"
if (Test-Path $apiEnv) {
    $content = Get-Content $apiEnv -Raw
    if ($content -notmatch "SECRET_KEY=") {
        $secretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 50 | ForEach-Object { [char]$_ })
        Add-Content $apiEnv "`nSECRET_KEY=`"$secretKey`""
        Write-Host "[OK] Added SECRET_KEY to apps/api/.env" -ForegroundColor Green
    }
}

# Enable corepack and install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
corepack enable pnpm 2>$null
pnpm install

Write-Host "`n[OK] Setup complete!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start Docker services:  docker compose -f docker-compose-local.yml up -d"
Write-Host "  2. Start web apps:         pnpm dev"
Write-Host "  3. Open http://localhost:3001/god-mode/ to register as instance admin"
Write-Host "  4. Open http://localhost:3000 to use the app`n"
