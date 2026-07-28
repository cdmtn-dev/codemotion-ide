import { type IpcMainInvokeEvent, ipcMain, shell } from "electron";

ipcMain.handle("open-in-browser", (_: IpcMainInvokeEvent, url: string) => {
    shell.openExternal(url);
});
