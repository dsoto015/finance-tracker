const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  loadExpenses: () => ipcRenderer.invoke('load-expenses'),
  saveExpenses: (data) => ipcRenderer.invoke('save-expenses', data),
  loadDefaults: () => ipcRenderer.invoke('load-defaults'),
  saveDefaults: (data) => ipcRenderer.invoke('save-defaults', data),
  loadIncome: () => ipcRenderer.invoke('load-income'),
});
