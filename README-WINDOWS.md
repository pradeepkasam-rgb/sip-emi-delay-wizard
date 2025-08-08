# SIP EMI Calculator - Windows Standalone Application

## Building for Windows 11

This guide explains how to create a standalone executable for Windows 11.

### Prerequisites

1. **Node.js** (v18 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **Git** - Download from [git-scm.com](https://git-scm.com/)
3. **Windows 11** (or Windows 10)

### Quick Start

1. **Export and Clone the Project**
   ```bash
   # Export this project to GitHub using the "Export to GitHub" button
   # Then clone it to your local machine
   git clone <your-github-repo-url>
   cd <project-folder>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Windows Executable**
   ```bash
   npm run build:electron
   ```

4. **Find Your Executable**
   - Check the `dist-electron` folder
   - You'll find two files:
     - `SIP-EMI-Calculator-Setup.exe` - Installer version
     - `SIP-EMI-Calculator-Portable.exe` - Portable version (no installation required)

### Running the Portable Version

Simply double-click `SIP-EMI-Calculator-Portable.exe` to run the application without installation.

### Installing the Application

Double-click `SIP-EMI-Calculator-Setup.exe` to install the application on your Windows system. It will:
- Create a desktop shortcut
- Add to Start Menu
- Allow easy uninstallation through Windows Settings

### Development Mode

To run in development mode with hot reload:

```bash
npm run dev
npm run electron:dev
```

### Features of the Windows App

- ✅ Native Windows application
- ✅ Offline functionality
- ✅ Desktop shortcut and Start Menu integration
- ✅ Professional Windows installer
- ✅ Portable executable option
- ✅ Full calculator functionality
- ✅ Responsive design
- ✅ Modern UI with Windows styling

### Troubleshooting

**Build Issues:**
- Ensure you have the latest Node.js version
- Run `npm cache clean --force` if you encounter dependency issues
- Make sure Windows Defender isn't blocking the build process

**App Won't Start:**
- Check if Windows SmartScreen is blocking the app
- Right-click the executable and select "Run anyway" if prompted

**File Locations:**
- Built executables: `dist-electron/`
- Source code: `src/`
- Electron main process: `electron.js`

### Project Structure

```
├── src/                     # React application source
├── public/                  # Static assets
├── dist/                    # Built React app
├── dist-electron/           # Built Windows executables
├── electron.js              # Electron main process
├── electron-builder.config.js # Build configuration
└── scripts/build-electron.js  # Build script
```

### About

**SIP + SWP EMI Calculator V2.0**
- Calculate SIP investments with SWP-based EMI payments
- Support for loan installments with simple interest
- Interactive sliders and comprehensive breakdowns
- Built with React, TypeScript, and Electron