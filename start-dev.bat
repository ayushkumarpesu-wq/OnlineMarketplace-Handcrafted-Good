@echo off
REM ============================================
REM Online Marketplace - Development Startup
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 Online Marketplace for Handcrafted Goods          ║
echo ║     Development Environment Startup                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo ⚠️  Installing root dependencies...
    call npm install
)

if not exist src\backend\node_modules (
    echo ⚠️  Installing backend dependencies...
    cd src\backend
    call npm install
    cd ..\..
)

if not exist src\frontend\node_modules (
    echo ⚠️  Installing frontend dependencies...
    cd src\frontend
    call npm install
    cd ..\..
)

echo.
echo ✅ All dependencies ready!
echo.
echo 📋 Choose startup option:
echo   1. Run BOTH Backend and Frontend (Recommended)
echo   2. Run Backend only
echo   3. Run Frontend only
echo   4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🎯 Starting both Backend and Frontend...
    echo ✨ Backend will run on http://localhost:5000
    echo ✨ Frontend will run on http://localhost:3000
    echo.
    call npm run dev
) else if "%choice%"=="2" (
    echo.
    echo 🎯 Starting Backend only...
    echo ✨ Backend will run on http://localhost:5000
    echo.
    call npm run dev:backend
) else if "%choice%"=="3" (
    echo.
    echo 🎯 Starting Frontend only...
    echo ✨ Frontend will run on http://localhost:3000
    echo.
    call npm run dev:frontend
) else if "%choice%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo ❌ Invalid choice. Please select 1-4.
    pause
    goto :eof
)

pause
