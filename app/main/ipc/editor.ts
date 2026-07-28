import { ipcMain } from "electron";

type EditorData = {
    editorId: string;
    [key: string]: any;
};

type EditorChangedCallback = (data: EditorData) => void;
type EditorClickedCallback = (data: any) => void;

let editorChangedCallback: EditorChangedCallback | null = null;
let editorClickedCallback: EditorClickedCallback | null = null;

ipcMain.on("editor-changed-event", (_: any, data: EditorData) => {
    if (editorChangedCallback) {
        editorChangedCallback(data);
    }
});

ipcMain.on("editor-clicked-event", (_: any, data: any) => {
    if (editorClickedCallback) {
        editorClickedCallback(data);
    }
});

ipcMain.on("file-opened-event", () => {
    editorChangedCallback = null;
    editorClickedCallback = null;
});

export function setEditorChangedCallback(cb: EditorChangedCallback): void {
    editorChangedCallback = cb;
}

export function setEditorClickedCallback(cb: EditorClickedCallback): void {
    editorClickedCallback = cb;
}