module.exports = {
  appId: "com.sipemicalculator.app",
  productName: "SIP EMI Calculator",
  directories: {
    output: "dist-electron"
  },
  files: [
    "dist/**/*",
    "electron.js",
    "package.json"
  ],
  extraMetadata: {
    main: "electron.js"
  },
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      },
      {
        target: "portable",
        arch: ["x64"]
      }
    ],
    icon: "public/favicon.ico",
    requestedExecutionLevel: "asInvoker"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "SIP EMI Calculator"
  },
  portable: {
    artifactName: "SIP-EMI-Calculator-Portable.exe"
  },
  publish: null
};