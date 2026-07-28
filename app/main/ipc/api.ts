import { type IpcMainInvokeEvent, ipcMain } from "electron";
import { API, LOCAL_FILE_PATH } from "../helpers/paths";
import { getUserToken, readFileContent } from "../helpers/requests";

ipcMain.handle("get-user-data-from-api", async () => {
    let localData: any = await readFileContent(LOCAL_FILE_PATH);
    localData = JSON.parse(localData);

    const api = `${API}/getMe`;

    try {
        const response = await fetch(api, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localData.token}`,
            },
        });
        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                result,
            };
        }

        return {
            success: true,
            result,
        };
    } catch (error: unknown) {
        return {
            success: false,
            result: String(error),
        };
    }
});

ipcMain.handle("get-user", async (_: IpcMainInvokeEvent, userid: number) => {
    const userToken = await getUserToken();

    try {
        const response = await fetch(`${API}/user/get?id=${userid}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        const data: any = await response.json();

        if (data.success) {
            return { success: true, msg: data.result };
        }
        return { success: false, msg: data.result };
    } catch (error) {
        return { success: false, msg: error };
    }
});
