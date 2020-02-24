var ipcRenderer = require('electron').ipcRenderer;

let documents;
let current_device = null;

function delete_doc_confirm(el, id, rev) {
    console.log(id, rev);
    ipcRenderer.send('delete-document', {
        id,
        rev
    });
    el.style.display = "none";

}

function delete_doc(event, id, rev) {
    let el = event.srcElement.parentElement.parentElement
    el.style.opacity = 0.5;
    if (confirm("Are you sure you want to delete the document?")) {
        delete_doc_confirm(el, id, rev)
    } else {
        el.style.opacity = 1;
    }
}

function render(device, filter = false) {
    current_device = device;
    console.log("Filtering started")
    console.log(documents);
    console.log(current_device);
    let container = document.querySelector("#container");
    container.innerHTML = "";
    for (let i = 0; i < documents.total_rows; i++) {
        let {
            doc
        } = documents.rows[i];
        console.log("+");

        if (doc.text != undefined && (!filter || (doc.device == device))) {
            console.log("-");

            if (doc.title == undefined) {
                doc.title = `${doc.text.substring(0,20)}...`
            }
            container.innerHTML = container.innerHTML +
                `<li>
              <h1 id="p1">${doc.title}</h1>
              <p id="p2">${doc.text}</p></br></br>
              <p id="p3">${new Date(doc.time).toDateString()}</p>
              <span class="close">
                <h3 onclick='delete_doc( event, "${doc._id}", "${doc._rev}")'>X</h3>
                </span>
                </li>`;
        }
    }
}


ipcRenderer.on('store-data', function (event, docs) {
    console.log(docs);
    documents = docs;
    let devices = new Set();
    for (let i = 0; i < docs.total_rows; i++) {
        devices.add(docs.rows[i].doc.device)
    }
    console.log(devices)
    if (current_device == null) {
        current_device = devices.values().next().value;
    }
    let sidebar = document.querySelector("#sidebar");
    sidebar.innerHTML = "";
    devices.forEach(function (device) {
        sidebar.innerHTML += `<button onclick="render('${device}', filter=true)">${device}</button>`
    })
    console.log(current_device);
    console.log("=========");
    render(current_device, filter = true);
});

// ipcRenderer.on('store-data-change', function (event, {
//     change
// }) {
//     let docs = change.docs;
//     console.log(docs);
//     let container = document.querySelector("#container");
//     for (let i = 0; i < docs.length; i++) {
//         let doc = docs[i];
//         console.log(doc);
//         if (doc.title == undefined) {
//             doc.title = `${doc.text.substring(0,20)}...`
//         }
//         container.innerHTML = container.innerHTML +
//             `<li>
//                 <h1 id="p1">${doc.title}</h1>
//                 <p id="p2">${doc.text}</p></br></br>
//                 <p id="p3">${new Date(doc.time).toDateString()}</p>
//                 <span class="close">
//                    <h3>X</h3>
//                 </span>
//             </li>`;
//     }
// });

//this code prevents reload on pressing F5/Ctrl+F5/Ctrl+R
function checkKeycode(e) {
    var keycode;
    if (window.event)
        keycode = window.event.keyCode;
    else if (e)
        keycode = e.which;

    if (keycode == 116 || (e.ctrlKey && keycode == 82)) {
        if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

document.onkeydown = checkKeycode