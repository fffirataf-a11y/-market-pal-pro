const { app, BrowserWindow } = require('electron');
const path = require('path');
const os = require('os');

// Network IP'yi al
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const PORT = 8080;

function createWindow() {
  const win = new BrowserWindow({
    width: 393,
    height: 852,
    resizable: true, // Test için resizable yap
    frame: true,
    title: 'SmartMarket - Mobile Preview',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      // Mobil özelliklerini etkinleştir
      enableBlinkFeatures: 'CSSColorSchemeUARendering',
    }
  });

  // iPhone user agent
  const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  win.webContents.setUserAgent(mobileUserAgent);

  // Mobil viewport meta tag'ini simüle et
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);
    `);
  });

  win.loadURL(`http://localhost:${PORT}`);
  
  // DevTools'u aç (mobil görünüm için)
  win.webContents.openDevTools({ mode: 'detach' });
  
  // Network IP'yi konsola yazdır
  console.log('\n📱 Mobil Test Bilgileri:');
  console.log('========================');
  console.log(`🌐 Yerel IP: http://${localIP}:${PORT}`);
  console.log(`📱 Telefonunuzdan bu adresi açın: http://${localIP}:${PORT}`);
  console.log(`💻 Electron Preview: Açıldı\n`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});