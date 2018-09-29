import { app, BrowserWindow, ipcMain } from 'electron';
// listen the 'app_quit' event

app.on('ready', () => {
  const mainWindow = new BrowserWindow({width: 1440, height: 900, frame: false, webPreferences: { nodeIntegrationInWorker: true }});

  ipcMain.on('quit', (event, info) => {
      app.quit()
  })
  
  // mainWindow.webContents.openDevTools()

  const hasInstance = (() => {
    app.makeSingleInstance((command, cwd) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    })
  })()

  // quit app when running already
  if (hasInstance) app.quit();

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  app.on("window-all-closed", () => {
    // restore default set of windows
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform == 'darwin') {
      // reopen initial window
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
    else app.quit()
  })

})
