const { shell, ipcRenderer } = require('electron');

document.getElementById('customCloseButton').addEventListener('click', () => {
    ipcRenderer.send('close-app');
});

document.getElementById('customMinimizeButton').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});


let aHref = document.querySelector("#aHref");
aHref.onclick = (e) => {
    e.preventDefault();
    let href = aHref.getAttribute("href");
    shell.openExternal(href);
}