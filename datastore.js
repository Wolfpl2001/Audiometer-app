
const { ipcMain } = require('electron');

let tempWaveformPath = null;
let tempEqualizerData = null;


function saveWaveformPath(waveformPath) {
  tempWaveformPath = waveformPath;
  console.log("waveform saved to storage:", tempWaveformPath);
}

function getWaveformPath() {
  return tempWaveformPath;
}

function saveEqualizerData(equalizerData) {
  let tempEqualizerData = null;
  // Handle FFmpeg path request from Renderer process
  ipcMain.handle('saveEqualizerData', async ({equalizerData}) => {
    try {
      tempEqualizerData = equalizerData;
      console.log('Saving Equalizer Data:', equalizerData);;
      return { success: true };
  } catch (error) {
      console.error('Error saving equalizer data:', error);
      return { success: false, error: error.message };
  }
  });
}

// Funkcja do pobierania equalizerData
function getEqualizerData(equalizerData) {
  ipcMain.handle('getEqualizerData', (event) => {
    return equalizerDataStore;  // Zwraca zapisane dane
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
  saveWaveformPath,
  getWaveformPath,
  saveEqualizerData,
  getEqualizerData
};
