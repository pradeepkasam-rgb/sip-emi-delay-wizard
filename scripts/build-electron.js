const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building SIP EMI Calculator for Windows...');

try {
  // Step 1: Build the React app
  console.log('📦 Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Update package.json main field temporarily
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const originalMain = packageJson.main;
  packageJson.main = 'electron.js';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  // Step 3: Build Electron app
  console.log('⚡ Building Electron application...');
  execSync('npx electron-builder --config electron-builder.config.js', { stdio: 'inherit' });

  // Step 4: Restore original package.json
  packageJson.main = originalMain;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  console.log('✅ Build completed! Check the dist-electron folder for your executable.');
  console.log('📁 You will find:');
  console.log('   - SIP-EMI-Calculator-Setup.exe (Installer)');
  console.log('   - SIP-EMI-Calculator-Portable.exe (Portable executable)');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore package.json if build failed
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (originalMain) {
      packageJson.main = originalMain;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    }
  } catch (restoreError) {
    console.error('Failed to restore package.json:', restoreError.message);
  }
  
  process.exit(1);
}