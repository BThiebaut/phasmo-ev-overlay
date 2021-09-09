import { app, BrowserWindow, globalShortcut } from 'electron'
import { overlayWindow } from 'electron-overlay-window'
import * as path from 'path';
import fs = require('fs');

// https://github.com/electron/electron/issues/25153
app.disableHardwareAcceleration()

let window: BrowserWindow
let ignoreMouseEvent = true;
let registered = false;

const userConfigFile = path.join(__dirname, '../../../userConfig.json');

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
}

function createDefaultUserSc() {
  let defaultDatas = {
    'reset'        : 'Shift + 0',
    'toggleEmf'    : 'Shift + 1',
    'toggleSpirit' : 'Shift + 2',
    'toggleFinger' : 'Shift + 3',
    'toggleOrb'    : 'Shift + 4',
    'toggleWriting': 'Shift + 5',
    'toggleTemp'   : 'Shift + 6',
    'toggleDots'   : 'Shift + 7',
    'toggleMaps'   : 'm',
    'exitOverlay'  : 'Shift + Plus',
  };
  fs.writeFileSync(userConfigFile, JSON.stringify(defaultDatas, null, 2), {'encoding' : 'utf8'});
}

function getUserShortcuts(){
  if (!fs.existsSync(userConfigFile)){
    createDefaultUserSc();
  }
  let userConfigRaw = fs.readFileSync(userConfigFile, {'encoding' : 'utf8'});
  return JSON.parse(userConfigRaw);
}

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
function toggleMaps(){
  window.webContents.send('toggle-maps', true);
  ignoreMouseEvent = !ignoreMouseEvent;
  window.setIgnoreMouseEvents(ignoreMouseEvent);
}
function exitOverlay(){
  app.quit(); 
}

function registerHooks () {

  if (!registered){

    globalShortcut.register('Shift + 0', reset);
    globalShortcut.register('Shift + 1', toggleEmf);
    globalShortcut.register('Shift + 2', toggleSpirit);
    globalShortcut.register('Shift + 3', toggleFinger);
    globalShortcut.register('Shift + 4', toggleOrb);
    globalShortcut.register('Shift + 5', toggleWriting);
    globalShortcut.register('Shift + 6', toggleTemp);
    globalShortcut.register('Shift + 7', toggleDots);
    globalShortcut.register('Shift + m', toggleMaps);
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