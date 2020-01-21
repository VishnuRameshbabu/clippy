const {app, Tray,Menu,BrowserWindow} = require('electron')
const { globalShortcut,clipboard } = require('electron')
var PouchDB = require('pouchdb');

const activeWin = require('active-win');
const storage = require('electron-json-storage');
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
let tray = null
let win = null
let db = new PouchDB('test');

function createWindow(){
    win=new BrowserWindow({
        width:900,
        height:700,
        webPreferences:{
            nodeIntegration:true
        }})
    win.loadFile('index.html')
    // win.webContents.openDevTools()
    win.on('close',(event)=>{
        event.preventDefault();
        win.hide();
    })

    db.allDocs({
        include_docs: true,
        attachments: true
        }).then(function (result) {
            console.log(result);
            console.log("OUT");
            if(win!=null){

                setTimeout(()=>{win.webContents.send('store-data', result);                console.log("IN");
            }, 500);
            }
        }).catch(function (err) {
        console.log(err);
        });
}

    app.on('ready', () => {
    // db.info().then(function (info) {
    //     console.log(info);
    // })
      
    tray = new Tray('inbox.png')
    const contextMenu = Menu.buildFromTemplate([
        {label: 'show stuff',
        click() { createWindow() }
        },
        {label: 'quit',
        click() { app.quit() }
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
                        _id: uuidv4(),
                        title: result.title, 
                        text: copiedtext,
                        time: new Date()
                    }
            // storage.set(uuidv4(), data, function(error) {
            //     if (error) throw error;
            //   });
            db.put(data)
            .then(res=>console.log(res))
            .catch(err=>console.log(err));
            db.allDocs({
            include_docs: true,
            attachments: true
            }).then(function (result) {
            console.log(result);
            if(win!=null){
                win.webContents.send('store-data', result);
            }
            }).catch(function (err) {
            console.log(err);
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