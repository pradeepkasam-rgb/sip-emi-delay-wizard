const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building SIP EMI Calculator for Windows...');

try {
  // Step 1: Build the React app
  console.log('📦 Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Update package.json temporarily
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const originalMain = packageJson.main;
  const originalDependencies = { ...packageJson.dependencies };
  const originalDevDependencies = { ...packageJson.devDependencies };
  
  // Add missing fields and move electron packages to devDependencies
  packageJson.main = 'electron.js';
  packageJson.description = 'SIP EMI Calculator - A comprehensive tool for calculating SIP returns and EMI amounts';
  packageJson.author = 'SIP EMI Calculator Team';
  
  // Move electron packages from dependencies to devDependencies
  if (packageJson.dependencies.electron) {
    packageJson.devDependencies.electron = packageJson.dependencies.electron;
    delete packageJson.dependencies.electron;
  }
  if (packageJson.dependencies['electron-builder']) {
    packageJson.devDependencies['electron-builder'] = packageJson.dependencies['electron-builder'];
    delete packageJson.dependencies['electron-builder'];
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  // Step 3: Build Electron app
  console.log('⚡ Building Electron application...');
  execSync('npx electron-builder --config electron-builder.config.cjs', { stdio: 'inherit' });

  // Step 4: Restore original package.json
  packageJson.main = originalMain;
  packageJson.dependencies = originalDependencies;
  packageJson.devDependencies = originalDevDependencies;
  delete packageJson.description;
  delete packageJson.author;
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
      packageJson.dependencies = originalDependencies;
      packageJson.devDependencies = originalDevDependencies;
      delete packageJson.description;
      delete packageJson.author;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    }
  } catch (restoreError) {
    console.error('Failed to restore package.json:', restoreError.message);
  }
  
  process.exit(1);
}