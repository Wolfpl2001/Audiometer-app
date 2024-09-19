//Hier wordt de module contextBridge, ipcRenderer geimporteerd van electron.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  'electron',
  {
    uploadAudioFile: () => ipcRenderer.invoke('dialog:uploadAudioFile'),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    once: (channel, callback) => ipcRenderer.once(channel, callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
);
