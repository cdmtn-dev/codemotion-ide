import { ipcMain } from "electron";

const bus = require("../../../helpers/eventBus");

let mainWindow: any = null;

bus.on("main-ready", (sender: any) => {
    mainWindow = sender;
});

ipcMain.on("code-suggest-request", (_event: any, data: any) => {
    console.log("[code-suggest] request received, cursor:", data.cursor);
    bus.emit("code-suggest-request", data);
});
