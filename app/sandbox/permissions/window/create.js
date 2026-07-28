const { createNativeImageFromUrl } = require("../../tools.js");
const { BrowserWindow } = require("electron");

function callback(data) {
    return (id, properties = {}) => {
        if (id == undefined) {
            id = Math.floor(Math.random() * 9999) + 1;
        }

        const title =
            properties.title == undefined ? `${data.extensionName} Window` : properties.title;
        const url = properties.url == undefined ? "google.com" : properties.url;

        const win = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
        });
        win.setMenu(null);

        win.setTitle(title);
        win.loadURL(`https://${url}`);

        return {
            id,
            open: () => {
                win.show();
            },
            close: () => {
                win.close();
            },
        };
    };
}

module.exports = { callback };
