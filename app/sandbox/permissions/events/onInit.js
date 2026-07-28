const { ipcMain } = require("electron");

function callback(data) {
    const cb = data.selfArgs[0];

    cb(data);
}

module.exports = { callback };
