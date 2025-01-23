const { ipcMain } = require('electron');

//
// global variables to store the waveform path and equalizer data
//

let tempWaveformPath = null;
let tempEqualizerData = null;

//
// function saveWaveformPath to save the waveform path from the selected audio file
//
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

//
// function getWaveformPath to get the waveform path from global variable
//

function getWaveformPath() {
  //ipcMain.handle('getWaveformPath', (event) => {
    return tempWaveformPath;
  //});
}

//
// function saveEqualizerData to save the equalizer data from the selected audio diagram file
//

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

//
// function getEqualizerData to get the equalizer data from global variable
//

function getEqualizerData() {
  // ipcMain.handle('getEqualizerData', async (event) => {
    console.log('Returning Equalizer Data:', tempEqualizerData);
    return tempEqualizerData;
  // });
}

//
// Export the functions to be used in other modules
//

module.exports = {
  saveWaveformPath,
  getWaveformPath,
  saveEqualizerData,
  getEqualizerData,
};

