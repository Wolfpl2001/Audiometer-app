const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // Import fs module
const ffmpeg = require('fluent-ffmpeg');  // Make sure ffmpeg is installed
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

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

// Handle file reading
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

// Handle audio waveform generation
ipcMain.handle('get-audio-waveform', async (event, filePath) => {
  const waveformImagePath = path.join(__dirname, 'waveform.png');  // Save image in current directory
  const dir = path.dirname(waveformImagePath);

  try {
    await ensureDirectoryExists(dir);  // Ensure the directory exists

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions([
          '-filter_complex', 'showwavespic=s=640x240:split_channels=1:colors=black',
          '-frames:v', '1'
        ])
        .on('end', () => {
          resolve({ imagePath: waveformImagePath });  // Resolve with path to the image
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(waveformImagePath);  // Save waveform image to file
    });
  } catch (error) {
    console.error('Error handling waveform generation:', error);
    throw error;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
