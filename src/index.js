// todo 使用update-electron-app进行升级
// https://github.com/electron/update-electron-app

import { app, BrowserWindow, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import {Wallet} from './wallet';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

const createWindow = async () => {
  const windowOptions = {
    width: 1080,
    minWidth: 680,
    height: 840,
    title: app.getName(),
    // todo icon，backgroundColor需要设置
    // In Electron 5.0.0, node integration will be disabled by default.
    // To prepare for this change, set {nodeIntegration: true} in the webPreferences for this window,
    // or ensure that this window does not rely on node integration and set {nodeIntegration: false}.
    webPreferences: {
      nodeIntegration: true
    }
  };
  // Create the browser window.
  mainWindow = new BrowserWindow(windowOptions);

  // Open the DevTools.
  if (isDevMode) {
    mainWindow.loadURL(`http:localhost:8000`);
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
    require('devtron').install();
  } else {
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/react-umi-dva-content/dist/index.html`);
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
app.requestSingleInstanceLock();

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

// Require each JS file in the main-process dir
const path = require('path');
const glob = require('glob');
const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
files.forEach((file) => { require(file) });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const wallet = new Wallet(app, ipcMain);
wallet.addListeners();
