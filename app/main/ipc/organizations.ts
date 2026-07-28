import fs from "node:fs";
import path from "node:path";
import { dialog, type IpcMainInvokeEvent, ipcMain } from "electron";
import { readFile } from "fs/promises";
import { API } from "../helpers/paths";
import {
    getUserToken,
    requestCreateOrganization,
    requestExploreOrganizations,
    requestGetYourOrgColleagues,
} from "../helpers/requests";

ipcMain.handle(
    "create-organization",
    async (_: IpcMainInvokeEvent, params: any) => await requestCreateOrganization(params),
);
ipcMain.handle(
    "request-get-your-org-colleagues",
    async (_: IpcMainInvokeEvent) => await requestGetYourOrgColleagues(),
);
ipcMain.handle("get-explore-organizations", async () => await requestExploreOrganizations());
ipcMain.handle("get-org-data-from-api", async (_: IpcMainInvokeEvent, orgId: number) => {
    const userToken = await getUserToken();

    try {
        const response = await fetch(`${API}/org/get?id=${orgId}`, {
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
ipcMain.handle("remove-org", async (_: IpcMainInvokeEvent, orgId: number) => {
    const userToken = await getUserToken();
    const formData = new FormData();
    formData.append("id", orgId);

    try {
        const response = await fetch(`${API}/org/remove`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            body: formData,
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
ipcMain.handle("join-org", async (_: IpcMainInvokeEvent, inviteCode: string) => {
    const userToken = await getUserToken();
    const formData = new FormData();
    formData.append("invite_code", inviteCode);

    try {
        const response = await fetch(`${API}/org/join`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                invite_code: inviteCode,
            }),
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
ipcMain.handle("reset-org-invite-code", async (_: IpcMainInvokeEvent, orgid: number) => {
    const userToken = await getUserToken();
    const formData = new FormData();
    formData.append("org_id", orgid);

    try {
        const response = await fetch(`${API}/org/resetInviteCode`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            body: formData,
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
ipcMain.handle("upload-org-avatar", async (_: IpcMainInvokeEvent, orgid: number) => {
    const userToken = await getUserToken();

    const result = await dialog.showOpenDialog({
        title: "Select organization avatar",
        properties: ["openFile"],
        filters: [
            {
                name: "Images",
                extensions: ["png", "jpg", "jpeg", "webp"],
            },
        ],
    });

    const canceled = (result as any).canceled ?? false;
    const filePaths: string[] = Array.isArray(result) ? result : ((result as any).filePaths ?? []);

    if (canceled || filePaths.length === 0) {
        return {
            success: false,
            msg: "Selection cancelled",
        };
    }

    const filePath = filePaths[0];
    const ext = filePath.split(".").pop()?.toLowerCase() || "jpeg";

    const buffer = await readFile(filePath);
    const image = `data:image/${ext};base64,${buffer.toString("base64")}`;

    const body = JSON.stringify({
        orgid,
        image,
    });

    try {
        const response = await fetch(`${API}/upload/org-avatar`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json",
            },
            body,
        });

        const data: any = await response.json();

        return {
            success: data.success,
            msg: data.result,
        };
    } catch (error: any) {
        return {
            success: false,
            msg: error.message,
        };
    }
});
ipcMain.handle("set-github-repos", async (_: IpcMainInvokeEvent, orgid: number, repos: object) => {
    const userToken = await getUserToken();

    try {
        const response = await fetch(`${API}/org/setGithubRepos`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                orgid,
                repos,
            }),
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
ipcMain.handle("search-orgs", async (_: IpcMainInvokeEvent, query: string) => {
    const userToken = await getUserToken();

    try {
        const response = await fetch(`${API}/org/search?q=${encodeURIComponent(query)}`, {
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
