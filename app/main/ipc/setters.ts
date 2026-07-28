import { type IpcMainInvokeEvent, ipcMain } from "electron";
import { getLocalAppData, readSettings, writeLocal, writeSettings } from "../helpers/requests";

ipcMain.handle("set-settings", (_: IpcMainInvokeEvent, data: unknown) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return readSettings();
    }

    return writeSettings(data as object);
});
ipcMain.handle("set-local", (_: IpcMainInvokeEvent, data: unknown) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return getLocalAppData();
    }

    return writeLocal(data as object);
});
