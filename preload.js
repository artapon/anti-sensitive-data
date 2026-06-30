const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Custom words
  loadCustomWords: ()        => ipcRenderer.invoke('load-custom-words'),
  saveCustomWords: (words)   => ipcRenderer.invoke('save-custom-words', words),

  // App settings (mask style + toggle states)
  loadSettings:   ()         => ipcRenderer.invoke('load-settings'),
  saveSettings:   (settings) => ipcRenderer.invoke('save-settings', settings),

  // Native clipboard (reliable in Electron — no browser permission issues)
  clipboardRead:  ()    => ipcRenderer.invoke('clipboard-read'),
  clipboardWrite: (txt) => ipcRenderer.invoke('clipboard-write', txt),
});
