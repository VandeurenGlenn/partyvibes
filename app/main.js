'use strict';

var electron = require('electron');

electron.app.on('ready', () => {
  const mainWindow = new electron.BrowserWindow({width: 1440, height: 900, webPreferences: { nodeIntegrationInWorker: true }});
  // mainWindow.webContents.openDevTools()

  const hasInstance = (() => {
    electron.app.makeSingleInstance((command, cwd) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  })();

  // quit app when running already
  if (hasInstance) electron.app.quit();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  electron.app.on("window-all-closed", () => {
    // restore default set of windows
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform == 'darwin') {
      // reopen initial window
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
    else electron.app.quit();
  });

});
