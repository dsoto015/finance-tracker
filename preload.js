const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  loadExpenses: () => ipcRenderer.invoke('load-expenses'),
  saveExpenses: (data) => ipcRenderer.invoke('save-expenses', data)
});
