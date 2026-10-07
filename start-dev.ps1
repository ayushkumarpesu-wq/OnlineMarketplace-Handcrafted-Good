# ============================================
# Online Marketplace - Development Startup
# ============================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 Online Marketplace for Handcrafted Goods          ║" -ForegroundColor Cyan
Write-Host "║     Development Environment Startup                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check and install root dependencies
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

# Check and install backend dependencies
if (-Not (Test-Path "src\backend\node_modules")) {
    Write-Host "⚠️  Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location "src\backend"
    npm install
    Pop-Location
}

# Check and install frontend dependencies
if (-Not (Test-Path "src\frontend\node_modules")) {
    Write-Host "⚠️  Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location "src\frontend"
    npm install
    Pop-Location
}

Write-Host ""
Write-Host "✅ All dependencies ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Choose startup option:" -ForegroundColor Cyan
Write-Host "   1. Run BOTH Backend and Frontend (Recommended)" -ForegroundColor White
Write-Host "   2. Run Backend only" -ForegroundColor White
Write-Host "   3. Run Frontend only" -ForegroundColor White
Write-Host "   4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🎯 Starting both Backend and Frontend..." -ForegroundColor Green
        Write-Host "✨ Backend will run on http://localhost:5000" -ForegroundColor Yellow
        Write-Host "✨ Frontend will run on http://localhost:3000" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "2" {
        Write-Host ""
        Write-Host "🎯 Starting Backend only..." -ForegroundColor Green
        Write-Host "✨ Backend will run on http://localhost:5000" -ForegroundColor Yellow
        Write-Host ""
        npm run dev:backend
    }
    "3" {
        Write-Host ""
        Write-Host "🎯 Starting Frontend only..." -ForegroundColor Green
        Write-Host "✨ Frontend will run on http://localhost:3000" -ForegroundColor Yellow
        Write-Host ""
        npm run dev:frontend
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "❌ Invalid choice. Please select 1-4." -ForegroundColor Red
    }
}
