const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {
    uploadAudioFile: () => ipcRenderer.invoke('dialog:uploadAudioFile'),
    getFfmpegPath: () => ipcRenderer.invoke('getFfmpegPath'),  // get the FFmpeg path
    generateWaveform: (filePath) => ipcRenderer.invoke('generateWaveform', filePath),  // add generateWaveform method
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    once: (channel, callback) => ipcRenderer.once(channel, callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    getEqualizerData: () => ipcRenderer.invoke('getEqualizerData', equalizerData),
    saveEqualizerData: (equalizerData) => ipcRenderer.invoke('saveEqualizerData', equalizerData),
    // saveWaveformPath: store.saveWaveformPath,
    // getWaveformPath: store.getWaveformPath,
    // saveEqualizerData: store.saveEqualizerData,
    // getEqualizerData: store.getEqualizerData
}
);
