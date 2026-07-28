import { type IpcMainInvokeEvent, ipcMain } from "electron";
import { requestAddBug, requestMakeVerifyBug } from "../helpers/requests";

ipcMain.handle(
    "request-add-bug",
    async (_: IpcMainInvokeEvent, params: object) => await requestAddBug(params),
);
ipcMain.handle(
    "request-make-verify-bug",
    async (_: IpcMainInvokeEvent, params = {}) => await requestMakeVerifyBug(params),
);
