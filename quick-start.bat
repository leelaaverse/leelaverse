@echo off
REM Quick Start Script for Leelaverse Dynamic Feed (Windows)
REM This script helps you start both frontend and backend servers

echo.
echo ============================================================
echo   🚀 Leelaverse Development Environment - Quick Start
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version
echo ✓ npm is installed
npm --version
echo.

REM Backend Setup
echo 📦 Checking Backend...
cd backend

if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
)

echo ✓ Backend ready
echo.

REM Frontend Setup
echo 📦 Checking Frontend...
cd ..\Leelaah-frontend

if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
)

echo ✓ Frontend ready
echo.

REM Check for .env file
if not exist ".env" (
    echo ⚠ No .env file found. Creating from .env.example...
    copy .env.example .env
    echo ✓ .env file created
)

echo.
echo ============================================================
echo   🎯 READY TO START
echo ============================================================
echo.
echo To start the application, you need TWO terminals:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm start
echo.
echo Terminal 2 - Frontend:
echo   cd Leelaah-frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo ============================================================
echo.
echo Press any key to exit...
pause >nul
