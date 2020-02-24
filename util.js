const PouchDB = require('pouchdb');

let pouch = new PouchDB('clippy');

pouch.get('_design/pouch_ddoc').then(function (doc) {
    return pouch.remove(doc).catch(err => console.log(err));
}).catch(err => console.log(err));

// var ddoc = {
//     _id: '_design/pouch_ddoc',
//     views: {
//         by_device: {
//             map: function (doc) {
//                 let {
//                     title,
//                     text,
//                     time
//                 } = doc;
//                 emit(doc.device, {
//                     title,
//                     text,
//                     time
//                 });
//             }.toString()
//         }
//     }
// };
// // save it
// pouch.put(ddoc).then(function () {
//     // success!
//     console.log("Created");
// }).catch(function (err) {
//     console.log(err);
//     // some error (maybe a 409, because it already exists?)
// });

// pouch.query('pouch_ddoc/by_device').then(function (res) {
//     console.log(res.rows);
// }).catch(function (err) {
//     // some error
// });