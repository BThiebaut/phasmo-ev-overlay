import { app, BrowserWindow, globalShortcut } from 'electron'
import { overlayWindow } from 'electron-overlay-window'
import * as path from 'path';

// https://github.com/electron/electron/issues/25153
app.disableHardwareAcceleration()

let window: BrowserWindow

function createWindow () {
  window = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    },
    ...overlayWindow.WINDOW_OPTS
  })

  window.loadFile(path.join(__dirname, '../src/phasmo.html'));

  // NOTE: if you close Dev Tools overlay window will lose transparency 
  //window.webContents.openDevTools({ mode: 'detach', activate: false })

  window.setIgnoreMouseEvents(true)

  registerHooks()

  overlayWindow.attachTo(window, 'Phasmophobia')
}

function registerHooks () {

  function reset(){
    window.webContents.send('reset-game', true);
  }

  function toggleEmf(){
    window.webContents.send('toggle-evidence', 'emf');
  }
  function toggleSpirit(){
    window.webContents.send('toggle-evidence', 'spirit');
  }
  function toggleWriting(){
    window.webContents.send('toggle-evidence', 'writing');
  }
  function toggleOrb(){
    window.webContents.send('toggle-evidence', 'orb');
  }
  function toggleFinger(){
    window.webContents.send('toggle-evidence', 'finger');
  }
  function toggleTemp(){
    window.webContents.send('toggle-evidence', 'temp');
  }
  function toggleDots(){
    window.webContents.send('toggle-evidence', 'dots');
  }
  function toggleBone(){
    window.webContents.send('toggle-bone', true);
  }
  function toggleOuija(){
    window.webContents.send('toggle-ouija', true);
  }

  globalShortcut.register('Shift + 0', reset);
  globalShortcut.register('Shift + 1', toggleEmf);
  globalShortcut.register('Shift + 2', toggleSpirit);
  globalShortcut.register('Shift + 3', toggleFinger);
  globalShortcut.register('Shift + 4', toggleOrb);
  globalShortcut.register('Shift + 5', toggleWriting);
  globalShortcut.register('Shift + 6', toggleTemp);
  globalShortcut.register('Shift + 7', toggleDots);
  //globalShortcut.register('Shift + 8', toggleBone);
  //globalShortcut.register('Shift + 9', toggleOuija);

  globalShortcut.register('Shift + Plus', () => { app.quit(); });
}

app.on('ready', createWindow)

app.on('will-quit', () => {
  // Supprime tous les raccourcis.
  globalShortcut.unregisterAll()
})

overlayWindow.on('detach', () => {
  app.quit();
});