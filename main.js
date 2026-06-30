const { app, BrowserWindow, ipcMain, clipboard, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// ── Paths ──────────────────────────────────────────────────────────────────
function userDataFile(name) {
  return path.join(app.getPath('userData'), name);
}

const CUSTOM_WORDS_FILE = userDataFile('custom-words.json');
const SETTINGS_FILE     = userDataFile('settings.json');

let tray = null;
let mainWindow = null;
let isQuitting = false;

// ── JSON helpers ───────────────────────────────────────────────────────────
function readJSON(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ── IPC handlers ───────────────────────────────────────────────────────────
ipcMain.handle('load-custom-words', () => {
  return readJSON(CUSTOM_WORDS_FILE, { words: [] });
});

ipcMain.handle('save-custom-words', (_event, words) => {
  writeJSON(CUSTOM_WORDS_FILE, { words });
  return { ok: true };
});

ipcMain.handle('load-settings', () => {
  return readJSON(SETTINGS_FILE, { maskStyle: 'full', toggles: {} });
});

ipcMain.handle('save-settings', (_event, settings) => {
  writeJSON(SETTINGS_FILE, settings);
  return { ok: true };
});

// Native clipboard (avoids navigator.clipboard permission issues in renderer)
ipcMain.handle('clipboard-read',  ()           => clipboard.readText());
ipcMain.handle('clipboard-write', (_event, txt) => { clipboard.writeText(txt); return { ok: true }; });

// ── Window ─────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    minWidth: 720,
    minHeight: 560,
    title: 'Sensitive Data Censor',
    backgroundColor: '#0f1115',
    icon: path.join(__dirname, 'assets', 'tray-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Remove default menu bar in production
  if (app.isPackaged) {
    mainWindow.setMenuBarVisibility(false);
  }

  // Intercept close event to hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Use our generated icon or fallback
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Censor Tool',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sensitive Data Censor');
  tray.setContextMenu(contextMenu);

  // Restore window on double-click
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

