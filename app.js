const { app, BrowserWindow, ipcMain } = require('electron');
const url = require("url");
const path = require("path");
const fs = require('fs');

let mainWindow;

// Get a safe path to store the file

//expenses
const expensesPath = path.join(app.getPath('userData'), 'expenses.json');
const defaultsPath = path.join(app.getPath('userData'), 'default-categories.json');
const fallbackDefaultsPath = path.join(__dirname, `public/mock-data/mock-default-categories.json`);

//income
const incomePath = path.join(app.getPath('userData'), 'income.json');
const incomeSourcesPath = path.join(app.getPath('userData'), 'income-sources.json');
const fallbackDefaultIncomePath = path.join(__dirname, `public/mock-data/mock-income-sources.json`);

//savings
const savingsPath = path.join(app.getPath('userData'), 'savings.json');
const savingsSourcesPath = path.join(app.getPath('userData'), 'savings-sources.json');
const fallbackDefaultSavingsPath = path.join(__dirname, `public/mock-data/mock-savings-sources.json`);

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false, // don't show until maximized
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.maximize();  // Maximize before showing
  mainWindow.show();      // Show after maximize


  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/finance-tracker/browser/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // mainWindow.webContents.openDevTools();

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

ipcMain.handle('load-income-default-sources', async () => {
  try {
    if (!fs.existsSync(incomeSourcesPath)) {
      console.log('income source didnt exist, reading from ', fallbackDefaultIncomePath);
      const data = fs.readFileSync(fallbackDefaultIncomePath, 'utf-8');
      fs.writeFileSync(incomeSourcesPath, data);
      console.log('wrote to ', incomeSourcesPath);
    }

    const data = fs.readFileSync(incomeSourcesPath, 'utf-8');
    console.log('loading income sources from:', incomeSourcesPath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading income:', error);
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

ipcMain.handle('load-income', async () => {
  try {
    if (!fs.existsSync(incomePath)) {
      fs.writeFileSync(incomePath, '[]');
    }
    const data = fs.readFileSync(incomePath, 'utf-8');
    console.log('loading income from:', incomePath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading income:', error);
    return [];
  }
});

ipcMain.handle('save-income', async (_, data) => {
  try {
    fs.writeFileSync(incomePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving income:', error);
    return { success: false, error };
  }
});

ipcMain.handle('load-savings-default-sources', async () => {
  try {
    if (!fs.existsSync(savingsSourcesPath)) {
      console.log('savings source didnt exist, reading from ', fallbackDefaultSavingsPath);
      const data = fs.readFileSync(fallbackDefaultSavingsPath, 'utf-8');
      fs.writeFileSync(savingsSourcesPath, data);
      console.log('wrote to ', savingsSourcesPath);
    }

    const data = fs.readFileSync(savingsSourcesPath, 'utf-8');
    console.log('loading saving sources from:', savingsSourcesPath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading savings:', error);
    return [];
  }
});

ipcMain.handle('load-savings', async () => {
  try {
    if (!fs.existsSync(savingsPath)) {
      fs.writeFileSync(savingsPath, '[]');
    }
    const data = fs.readFileSync(savingsPath, 'utf-8');
    console.log('loading savings from:', savingsPath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading savings:', error);
    return [];
  }
});

ipcMain.handle('save-savings', async (_, data) => {
  try {
    fs.writeFileSync(savingsPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving savings:', error);
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
