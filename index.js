//
// Description: Main file for the Electron app.
// 
// This file contains the main process of the Electron app. It creates the main window and handles the communication between the main process and the renderer process using IPC (Inter-Process Communication). 
//

const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // Import fs module
const ffmpeg = require('fluent-ffmpeg');  // Import fluent-ffmpeg
const ffmpegStatic = require('ffmpeg-static');  // Import ffmpeg-static to get ffmpeg path
const datastore = require('./datastore.js'); // Import datastore module
const audiodownload = require('./audiodownload.js'); // Import audiodownload module
//
// Create the main window
//

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    title: 'SoundWork',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      // Hide the Dev tools in the window USE ONLY FOR RELEASE
      devTools: true,
      //
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: true,
    },
    // Hide the menu bar in the window USE ONLY FOR RELEASE
    autoHideMenuBar: false
    //
  });

  win.loadFile('frontend/login.html');
  // Add error handling for preload script
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load preload script:', errorDescription);
  });
};

//
// Create the main window when the app is ready
//

app.whenReady().then(() => {
  createWindow();

  //
  // Call the functions to save and get waveform path and equalizer data
  //

  datastore.saveWaveformPath();
  datastore.getWaveformPath();
  datastore.saveEqualizerData();
  datastore.getEqualizerData();
 // audiodownload.processAudio();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

//
// Handle audio file upload through dialog
//

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

//
// Handle FFmpeg path request from Renderer process
//

ipcMain.handle('getFfmpegPath', async () => {
  // Return the FFmpeg executable path
  return ffmpegStatic;
});

//
// Handle waveform generation request from Renderer process
//

ipcMain.handle('generateWaveform', async (event, filePath) => {
  const waveformImagePath = path.join(app.getPath('temp'), 'waveform.png');  
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

//
// Handle file dialog for XML files from Renderer process and read the file content
//

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

//
// Quit the app when all windows are closed, except on macOS
//

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
