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
function getEqualizerData() {
  return tempEqualizerData;
}

module.exports = {
  saveWaveformPath,
  getWaveformPath,
  saveEqualizerData,
  getEqualizerData
};
