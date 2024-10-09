
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

let tempWaveformPath = null;
let tempEqualizerData = null;

// Funkcja do zapisywania waveformPath
function saveWaveformPath(waveformPath) {
  tempWaveformPath = waveformPath;
  console.log("waveform saved to storage:", tempWaveformPath);
}

// Funkcja do pobierania waveformPath
function getWaveformPath() {
  return tempWaveformPath;
}

// Funkcja do zapisywania equalizerData
function saveEqualizerData(equalizerData) {
  tempEqualizerData = equalizerData;
  console.log("equalizerData is seved in storage:", tempEqualizerData);
}

// Funkcja do pobierania equalizerData
function getEqualizerData(filePath) {

  // Handle FFmpeg path request from Renderer process
  ipcMain.handle('getEqualizerData', async (filePath) => {
    // Return the FFmpeg executable path
    console.log('Filepath:', "From backend electron");
    return "HALLO";
  });
}

function test(app) {
  console.log("TEST function called");
  // Quit the app when all windows are closed, except on macOS
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      console.log('QUIT');
      app.quit();
    }
  });
}

module.exports = {
  test,
  saveWaveformPath,
  getWaveformPath,
  saveEqualizerData,
  getEqualizerData
};
