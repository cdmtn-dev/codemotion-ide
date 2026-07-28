export function sendDebugMsg(text) {
    window.electron.sendDebuggerData({ type: "msg", content: text });
}
export function sendDebugError(text) {
    window.electron.sendDebuggerData({ type: "error", content: text });
}
export function sendDebugWarn(text) {
    window.electron.sendDebuggerData({ type: "warn", content: text });
}
export function sendDebugMarking() {
    window.electron.sendDebuggerData({ type: "marking" });
}
export function sendDebugModuleInfo({ name, version, description, permissions }) {
    window.electron.sendDebuggerData({
        type: "moduleInfo",
        info: { name, version, description, permissions },
    });
}
