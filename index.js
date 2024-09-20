const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // Import fs module
const ffmpeg = require('fluent-ffmpeg');  // Make sure ffmpeg is installed
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const ffmpegPath = path.join(__dirname, 'resources', 'ffmpeg', 'bin', 'ffmpeg.exe'); // Adjust the path as necessary

// Ensure the directory exists
const ensureDirectoryExists = async (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

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

// Handle audio file upload dialog
ipcMain.handle('dialog:uploadAudioFile', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav'] }]
  });
  return result;
});

// Handle audio waveform generation
ipcMain.on('get-audio-waveform', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'flac'] }] // Adjust filters as needed
  });

  if (result.canceled) return;

  const filePath = result.filePaths[0];

  try {
    const waveformImagePath = path.join(__dirname, 'waveform.png');
    const dir = path.dirname(waveformImagePath);

    await ensureDirectoryExists(dir);

    const waveform = await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .setFfmpegPath(ffmpegPath) // Ensure this is set correctly
        .outputOptions([
          '-y', // Overwrite output files without asking
          '-filter_complex', 'showwavespic=s=640x240:colors=black',
          '-frames:v', '1'
        ])
        .on('end', () => {
          console.log('Waveform generated successfully');
          resolve({ imagePath: waveformImagePath });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(waveformImagePath);
    });

    event.reply('waveform-generated', waveform);
  } catch (error) {
    console.error('Error handling waveform generation:', error);
    event.reply('waveform-error', error.message);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
