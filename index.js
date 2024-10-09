const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // Import fs module
const ffmpeg = require('fluent-ffmpeg');  // Import fluent-ffmpeg
const ffmpegStatic = require('ffmpeg-static');  // Import ffmpeg-static to get ffmpeg path
const dataStore = require('./datastore'); 

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: true, // Ensure sandbox mode is enabled
    }
  });

  win.loadFile('index.html');

  // Add error handling for preload script
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load preload script:', errorDescription);
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('saveTempData', (event, { waveformPath, equalizerData }) => {
  dataStore.saveTempData({ waveformPath, equalizerData });  // Używamy dataStore
});
// Handle audio file upload through dialog
ipcMain.handle('dialog:uploadAudioFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }]  // Supported audio file types
  });
  if (result.canceled) {
    return { canceled: true };
  }
  const filePath = result.filePaths[0];
  const fileContent = fs.readFileSync(filePath);  // Read the selected audio file
  return { canceled: false, filePath, fileContent };
});

// Handle FFmpeg path request from Renderer process
ipcMain.handle('getFfmpegPath', async () => {
  // Return the FFmpeg executable path
  return ffmpegStatic;
});

// Handle waveform generation request
ipcMain.handle('generateWaveform', async (event, filePath) => {
  const waveformImagePath = path.join(app.getPath('temp'), 'waveform.png');  
  dataStore.saveWaveformPath(filePath);
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .setFfmpegPath(ffmpegStatic)
      .outputOptions([
        '-y',
          '-filter_complex', 'showwavespic=s=640x240:split_channels=1:colors=black',
          '-frames:v', '1'
      ])
      .on('end', () => {
        console.log('Waveform generated successfully');
        resolve(waveformImagePath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .save(waveformImagePath);
  });
});

// Handle file dialog for XML files
ipcMain.on('open-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'XML Files', extensions: ['xps'] }]
  });

  if (result.canceled) return;

  const filePath = result.filePaths[0];
  const fileContent = fs.readFileSync(filePath, 'utf-8');  // Read the file

  event.reply('file-data', { filePath, content: fileContent });
});

// Quit the app when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
