const { app, BrowserWindow, ipcMain } = require('electron');
const url = require("url");
const path = require("path");
const fs = require('fs');

let mainWindow;

// Get a safe path to store the file
const expensesPath = path.join(app.getPath('userData'), 'expenses.json');
const defaultsPath = path.join(app.getPath('userData'), 'default-categories.json');
const fallbackDefaultsPath = path.join(__dirname, `public/mock-data/mock-default-categories.json`);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/finance-tracker/browser/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// ----------------------
// IPC Handlers for Angular <-> Electron
// ----------------------
ipcMain.handle('load-expenses', async () => {
  try {
    if (!fs.existsSync(expensesPath)) {
      fs.writeFileSync(expensesPath, '[]');
    }
    const data = fs.readFileSync(expensesPath, 'utf-8');
    console.log('Saving expenses to:', expensesPath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
});

ipcMain.handle('save-expenses', async (_, data) => {
  try {
    fs.writeFileSync(expensesPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving expenses:', error);
    return { success: false, error };
  }
});

ipcMain.handle('load-defaults', async () => {
  try {
    if (!fs.existsSync(defaultsPath)) {
      const data = fs.readFileSync(fallbackDefaultsPath, 'utf-8');
      fs.writeFileSync(defaultsPath, data);
    }
    const data = fs.readFileSync(defaultsPath, 'utf-8');
    console.log('Saving expenses to:', defaultsPath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
});

ipcMain.handle('save-defaults', async (_, data) => {
  try {
    fs.writeFileSync(defaultsPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving expenses:', error);
    return { success: false, error };
  }
});


app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
