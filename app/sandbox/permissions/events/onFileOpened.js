const { ipcMain } = require("electron");

function callback(data) {
    const cb = data.selfArgs[0];

    ipcMain.on("file-opened-event", (_, data) => {
        cb(data);
    });
}

module.exports = { callback };
