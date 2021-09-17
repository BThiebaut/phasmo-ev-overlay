import { app, BrowserWindow, globalShortcut } from 'electron'
import { overlayWindow } from 'electron-overlay-window'
import * as path from 'path';
import fs = require('fs');
const ipc = require('electron').ipcMain;

// https://github.com/electron/electron/issues/25153
app.disableHardwareAcceleration()

let window: BrowserWindow
var ignoreMouseEvent = true;
var registered = false;

function createWindow () {
  window = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    },
    ...overlayWindow.WINDOW_OPTS
  })

  window.loadFile(path.join(__dirname, '../src/views/overlay.html'));

  // NOTE: if you close Dev Tools overlay window will lose transparency 
  //window.webContents.openDevTools({ mode: 'detach', activate: false })

  window.setIgnoreMouseEvents(ignoreMouseEvent)

  registerHooks()

  overlayWindow.attachTo(window, 'Phasmophobia')

  window.webContents.once('dom-ready', () => {
    loadSvgMaps();
  })

  ipc.on('map-toggeled', (e, isVisible : boolean) => {
    window.setIgnoreMouseEvents(!isVisible);
  });
}

function reset(){
  window.webContents.send('reset-game', true);
}

function toggleMaps(){
  window.webContents.send('toggle-maps', true);
}
function exitOverlay(){
  app.quit(); 
}
function toggleEvidence(name : string){
  window.webContents.send('toggle-evidence', name);
}
function toggleExclude(name : string){
  window.webContents.send('toggle-exclude', name);
}

function registerHooks () {

  if (!registered){

    globalShortcut.register('Shift + 0', reset);

    globalShortcut.register('Shift + 1', () => { toggleEvidence('emf') });
    globalShortcut.register('Shift + 2', () => { toggleEvidence('spirit') });
    globalShortcut.register('Shift + 3', () => { toggleEvidence('finger') });
    globalShortcut.register('Shift + 4', () => { toggleEvidence('orb') });
    globalShortcut.register('Shift + 5', () => { toggleEvidence('writing') });
    globalShortcut.register('Shift + 6', () => { toggleEvidence('temp') });
    globalShortcut.register('Shift + 7', () => { toggleEvidence('dots') });

    /* TODO : Make exlude work
    globalShortcut.register('Ctrl + 1', () => { toggleExclude('emf') });
    globalShortcut.register('Ctrl + 2', () => { toggleExclude('spirit') });
    globalShortcut.register('Ctrl + 3', () => { toggleExclude('finger') });
    globalShortcut.register('Ctrl + 4', () => { toggleExclude('orb') });
    globalShortcut.register('Ctrl + 5', () => { toggleExclude('writing') });
    globalShortcut.register('Ctrl + 6', () => { toggleExclude('temp') });
    globalShortcut.register('Ctrl + 7', () => { toggleExclude('dots') });
    */

    globalShortcut.register('m', toggleMaps);
    
    globalShortcut.register('Shift + Plus', exitOverlay);

    registered = true;
  }
}

function loadSvgMaps(){
  let mapsDir = path.join(__dirname, '../src/assets/svg/maps');
  var maps : any = {};
  let nbLoaded = 0;
  fs.readdir(mapsDir, (err, files) => {
    if(err === null){
      for(let i in files){
        let fileName : string = files[i];
        fs.readFile(path.join(mapsDir, fileName), "utf8", (errf, data) => {
          maps[fileName.replace('.svg', '')] = data;
          if (++nbLoaded == files.length){
            window.webContents.send('maps-loaded', maps);
          }
        });
        
      }
    }
  });
}

app.on('ready', createWindow)

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

overlayWindow.on('detach', () => {
  app.quit();
});

overlayWindow.on('blur', () => {
  globalShortcut.unregisterAll();
  registered = false;
});

overlayWindow.on('focus', () => {
  registerHooks();
});