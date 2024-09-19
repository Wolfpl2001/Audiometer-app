const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // Import fs module

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    }
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('dialog:uploadAudioFile', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav'] }]
  });
  return result;
});

ipcMain.on('open-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'XML Files', extensions: ['xps'] }]  // Fixed extension typo here if you meant 'xps'
  });

  if (result.canceled) return;

  const filePath = result.filePaths[0];
  const fileContent = fs.readFileSync(filePath, 'utf-8');  // Read the file

  event.reply('file-data', { filePath, content: fileContent });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
