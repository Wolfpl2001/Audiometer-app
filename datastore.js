const { ipcMain } = require('electron');

let tempWaveformPath = null;
let tempEqualizerData = null;

// saveWaveformPath() and getWaveformPath() functions are used to save and retrieve the waveform path
function saveWaveformPath() {
  ipcMain.handle('saveWaveformPath', async (event, { waveformPath }) => {
    try {
      tempWaveformPath = waveformPath;
      console.log('Saving Waveform Path:', tempWaveformPath); 
      return { success: true, waveformPath: tempWaveformPath };
    } catch (error) {
      console.error('Error saving waveform path:', error);
      return { success: false, error: error.message };
    }
  });
}

function getWaveformPath() {
  ipcMain.handle('getWaveformPath', async () => {
    console.log('Returning Waveform Path:', tempWaveformPath);
    return tempWaveformPath;
  });
}

// saveEqualizerData() and getEqualizerData() functions are used to save and retrieve the equalizer data
function saveEqualizerData() {
  ipcMain.handle('saveEqualizerData', async (event, { equalizerData }) => {
    try {
      tempEqualizerData = equalizerData;
      console.log('Saving Equalizer Data:', tempEqualizerData);
      return { success: true, equalizerData: tempEqualizerData };
    } catch (error) {
      console.error('Error saving equalizer data:', error);
      return { success: false, error: error.message };
    }
  });
}

function getEqualizerData() {
  ipcMain.handle('getEqualizerData', async () => {
    console.log('Returning Equalizer Data:', tempEqualizerData); 
    return tempEqualizerData;
  });
}

//return the functions
module.exports = {
  saveWaveformPath,
  getWaveformPath,
  saveEqualizerData,
  getEqualizerData,
};
