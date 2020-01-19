const {app, Tray,Menu,BrowserWindow} = require('electron')
const { globalShortcut,clipboard } = require('electron')
const activeWin = require('active-win');
const storage = require('electron-json-storage');
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
let tray = null
function createWindow(){
    win=new BrowserWindow({
        width:900,
        height:700,
        webPreferences:{
            nodeIntegration:true
        }})
    win.loadFile('index.html')
    win.webContents.openDevTools()
    win.on('closed',()=>{
        win=null;
    })}
app.on('ready', () => {
  tray = new Tray('inbox.png')
  const contextMenu = Menu.buildFromTemplate([
      {label: 'show stuff',
      click() { createWindow() }
    }
  ])
  tray.setToolTip('clippy')
  tray.setContextMenu(contextMenu)
    globalShortcut.register('Ctrl+Shift+J',()=>{  
        copiedtext=clipboard.readText()
        activeWin()
        .then(result=>{
            console.log(result.title)
            data = { 
                        title: result.title, 
                        text: copiedtext,
                        time: new Date()
                    }
            storage.set(uuidv4(), data, function(error) {
                if (error) throw error;
              });
        })
        .catch(err=>{
            console.log(err)
        });   
        })
      })
/* to clear the stuff if needed  */
// storage.clear(function(error) {
//     if (error) throw error;
//   });