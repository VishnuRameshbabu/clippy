const {
    app,
    Tray,
    Menu,
    BrowserWindow,
    globalShortcut,
    clipboard,
    os
} = require('electron')
const PouchDB = require('pouchdb');
const activeWin = require('active-win');
var uuid1 = require('uuid1');
const Os=require('os');


const {
    ipcMain
} = require('electron');


const computerName=Os.hostname();
let tray = null
let win = null
let isQuiting = false
let db = new PouchDB('clippy');
let remoteDb = new PouchDB("https://8e0291ce-e076-4e8b-a48b-15e4dba09abd-bluemix:2a0c31d4c33f24725907bdf469d82300a541d55e357eca0ba7ea871ccc483ae4@8e0291ce-e076-4e8b-a48b-15e4dba09abd-bluemix.cloudant.com/clippy");

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createWindow() {
    win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile('index.html')
    win.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault();
            win.hide();
        }
    })

    db.allDocs({
        include_docs: true,
        attachments: true
    }).then(function (result) {
        console.log(result);
        console.log("OUT");
        if (win != null) {
            setTimeout(() => win.webContents.send('store-data', result), 1000);
        }
    }).catch(function (err) {
        console.log(err);
    });
}

app.on('ready', () => {

    //Start syncronization as soon as the app starts
    db.sync(remoteDb, {
        live: true,
        retry: true
    }).on('change', function (change) {
        console.log("CHANGE DETECTED!!!" + new Date())
        db.allDocs({
            include_docs: true,
            attachments: true
        }).then(function (result) {
            if (win != null) {
                win.webContents.send('store-data', result);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
    }).on('active', function (info) {
        // replication was resumed
    }).on('error', function (err) {
        // totally unhandled error (shouldn't happen)
    });
    // System tray Configuration
    tray = new Tray('tray_icon_logo.png')
    const contextMenu = Menu.buildFromTemplate([{
            label: 'View notes',
            click() {
                createWindow()
            }
        },
        {
            label: 'Quit',
            click() {
                isQuiting = true
                app.quit()
            }
        }
    ])
    tray.setToolTip('clippy')
    tray.setContextMenu(contextMenu)

    // Global Shortcut key registration
    globalShortcut.register('Ctrl+Shift+J', () => {
        copiedtext = clipboard.readText()
        activeWin()
            .then(result => {
                data = {
                    _id: uuid1.UUID1(),
                    title: result.title,
                    text: copiedtext,
                    time: new Date(),
                    device: computerName
                }
                db.put(data)
                    .then(() => {
                        db.sync(remoteDb).on('error', function (err) {
                            console.log(err);
                        });;
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => {
                console.log(err)
            });
    })

    ipcMain.on('delete-document', (event, args) => {
        console.log(args);
        db.remove(args.id, args.rev).then(res => console.log(res)).catch(res => console.log(res))
    });


})