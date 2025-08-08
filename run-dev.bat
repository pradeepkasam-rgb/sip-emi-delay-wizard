@echo off
echo 🚀 Starting SIP EMI Calculator in development mode...
echo.

echo 📦 Starting Vite development server...
start "Vite Dev Server" cmd /c "npm run dev"

echo ⏳ Waiting for Vite server to start...
timeout /t 5 /nobreak > nul

echo ⚡ Starting Electron application...
call npx electron electron.js

echo.
echo 👋 Application closed.
pause