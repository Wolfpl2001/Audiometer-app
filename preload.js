const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {
    uploadAudioFile: () => ipcRenderer.invoke('dialog:uploadAudioFile'),
    getFfmpegPath: () => ipcRenderer.invoke('getFfmpegPath'),  // Zwraca ścieżkę do FFmpeg
    generateWaveform: (filePath) => ipcRenderer.invoke('generateWaveform', filePath),  // Dodaj funkcję generateWaveform
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    once: (channel, callback) => ipcRenderer.once(channel, callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
);
