import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { type IpcMainInvokeEvent, ipcMain } from "electron";
import { ASSETS_PATH } from "../helpers/paths";
import {
    getAllLanguages,
    getAllLanguagesJSON,
    getAppIcon,
    getLocalAppData,
    getLocalBugsData,
    getPackageData,
    getUsedLanguagesByPath,
    getUserToken,
    readFilesInFolder,
    readSettings,
} from "../helpers/requests";

ipcMain.handle("get-package-data", async () => getPackageData());
ipcMain.handle("get-local-bugs-data", async () => getLocalBugsData());
ipcMain.handle("get-user-pc-info", async () => ({
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    hostname: os.hostname(),
    homedir: os.homedir(),
}));
ipcMain.handle("get-all-app-icons", () => {
    try {
        return readFilesInFolder("assets/media/icons/symbols/files");
    } catch (e) {
        return [];
    }
});
ipcMain.handle("get-all-filenames-app-icons", () => {
    try {
        return readFilesInFolder("assets/media/icons/symbols/files");
    } catch (e) {
        return [];
    }
});
ipcMain.handle("get-app-icons", async () => {
    try {
        const dir = path.join(ASSETS_PATH, "media", "app-icons");
        const files = await fs.promises.readdir(dir);
        const result = [];

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.promises.stat(fullPath);

            if (stat.isFile()) {
                result.push(file);
            }
        }

        return result;
    } catch (err) {
        console.error("get-app-icons error:", err);
        return [];
    }
});
ipcMain.handle("get-app-local", async () => await getLocalAppData());
ipcMain.handle("get-all-languages", async () => await getAllLanguages());
ipcMain.handle("get-all-languages-json", async () => await getAllLanguagesJSON());
ipcMain.handle("get-app-icon", async () => await getAppIcon());
ipcMain.handle("get-dirname", async () => __dirname);
ipcMain.handle("get-platform", () => process.platform);
ipcMain.handle("get-user-token", async () => await getUserToken());
ipcMain.handle(
    "get-used-languages-by-path",
    async (_: IpcMainInvokeEvent, targetPath: string) => await getUsedLanguagesByPath(targetPath),
);
ipcMain.handle("read-settings", () => readSettings());
