const {ipcRenderer} = require('electron');

const addKey = document.getElementById('add-key');
const queryAllKey = document.getElementById('query-all-key');

ipcRenderer.on("add-item-result", function (event, arg) {
  console.log("add-item-result", arg);
});

ipcRenderer.on("query-all-item-result", function (event, arg) {
  console.log("query-all-item-result", arg);
});

addKey.addEventListener('click', (event) => {
  ipcRenderer.send("add-item");
});

queryAllKey.addEventListener('click', (event) => {
  ipcRenderer.send("query-all-item");
});
