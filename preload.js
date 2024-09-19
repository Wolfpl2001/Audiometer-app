//Hier wordt de module contextBridge, ipcRenderer geimporteerd van electron.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  'electron',
  {
    uploadAudioFile: () => ipcRenderer.invoke('dialog:uploadAudioFile')
  }
);
