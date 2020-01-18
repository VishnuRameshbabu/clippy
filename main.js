const {app, BrowserWindow} = require('electron')
const { globalShortcut,clipboard } = require('electron')
const activeWin = require('active-win');
const storage = require('electron-json-storage');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

app.on('ready',()=>{
    globalShortcut.register('Ctrl+Shift+J',()=>{  
        copiedtext=clipboard.readText()
        console.log(copiedtext)
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
