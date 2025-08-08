@echo off
echo 🚀 Building SIP EMI Calculator for Windows...
echo.

echo 📦 Building React application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ React build failed!
    pause
    exit /b 1
)

echo.
echo ⚡ Building Electron application...
call npx electron-builder --config electron-builder.config.js
if %errorlevel% neq 0 (
    echo ❌ Electron build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo 📁 Check the dist-electron folder for your executable files:
echo    - SIP-EMI-Calculator-Setup.exe (Installer)
echo    - SIP-EMI-Calculator-Portable.exe (Portable executable)
echo.
pause