const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});

// hier wordt file gehandelt vai 
ipcMain.handle('dialog:uploadAudioFile', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav'] }]
  });
  return result;
});
