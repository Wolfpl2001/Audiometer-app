
const { ipcMain } = require('electron');

let tempWaveformPath = null;
let tempEqualizerData = null;


function saveWaveformPath(waveformPath) {
 ipcMain.handle('saveWaveformPath', async (event, {waveformPath}) => {
  try{
    tempwaveformPath = waveformPath;
    console.log('Saving Waveform Path:', waveformPath);
    return { success: true, waveformPath: tempWaveformPath };
  }catch (error) {
    console.error('Error saving waveform path:', error);
    return { success: false, error: error.message };
  }
});
}

function getWaveformPath() {
  return tempWaveformPath;
}
function saveEqualizerData(equalizerData) {
  tempEqualizerData = [];
  ipcMain.handle('saveEqualizerData', async (event, {equalizerData}) => {
    try {
      tempEqualizerData = equalizerData;
      console.log('Saving Equalizer Data:', equalizerData);;
      return { success: true, equalizerData: tempEqualizerData };
  } catch (error) {
      console.error('Error saving equalizer data:', error);
      return { success: false, error: error.message };
  }
  });
}

// Funkcja do pobierania equalizerData
function getEqualizerData() {
  ipcMain.handle('getEqualizerData', (event) => {
    return equalizerDataStore; 
  });
}

module.exports = {
  saveWaveformPath,
  getWaveformPath,
  saveEqualizerData,
  getEqualizerData
};
