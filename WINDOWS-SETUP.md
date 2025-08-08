# 🪟 Windows 11 Standalone Executable Setup

## Quick Setup Guide

### 1. Export & Download Project
1. Click **"Export to GitHub"** button in Lovable
2. Clone your repository to Windows 11:
   ```bash
   git clone <your-github-repo-url>
   cd <project-folder>
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Windows Executable

**Option A: Using Batch File (Easiest)**
```bash
# Double-click this file in Windows Explorer
build-windows.bat
```

**Option B: Manual Commands**
```bash
# Build React app first
npm run build

# Build Windows executable
npx electron-builder --config electron-builder.config.js
```

### 4. Your Executable Files

After building, check the `dist-electron` folder:

- **📦 SIP-EMI-Calculator-Setup.exe** - Full installer (recommended)
  - Creates desktop shortcut
  - Adds to Start Menu  
  - Professional installation experience

- **🚀 SIP-EMI-Calculator-Portable.exe** - Portable version
  - No installation required
  - Run from any location
  - Perfect for USB drives

### 5. Distribution

**For End Users:**
- Share the `SIP-EMI-Calculator-Setup.exe` for easy installation
- Or share `SIP-EMI-Calculator-Portable.exe` for no-install usage

**File Sizes:**
- Installer: ~150-200 MB
- Portable: ~150-200 MB

### 6. Development Mode

To test changes locally:
```bash
# Double-click this file for development
run-dev.bat
```

## ✨ Features

- ✅ **Native Windows App** - Runs like any Windows software
- ✅ **Offline** - No internet required after installation  
- ✅ **Professional UI** - Windows-native look and feel
- ✅ **Desktop Integration** - Start Menu, taskbar, etc.
- ✅ **Secure** - Sandboxed Electron environment
- ✅ **Auto-Updates Ready** - Can be extended for updates

## 🔧 Troubleshooting

**Build Errors:**
- Ensure Node.js v18+ is installed
- Run `npm cache clean --force`
- Check Windows Defender isn't blocking

**App Won't Start:**
- Windows may show security warning for unsigned app
- Click "More info" → "Run anyway"
- Or right-click executable → Properties → Unblock

**Slow First Launch:**
- First run may be slower as Windows scans the app
- Subsequent launches will be faster

## 📋 Requirements

- **Windows 11** (or Windows 10)
- **Node.js 18+** 
- **150-200 MB** free space for executable
- **No additional software** needed for end users

---

🎉 **You now have a professional Windows application for your SIP EMI Calculator!**