export const bus = new EventTarget();

export function sendEvent(name, data) {
    bus.dispatchEvent(
        new CustomEvent(name, {
            detail: data,
        }),
    );
}

bus["onEditorChange"] = (cb) => {
    bus.addEventListener("editor-language-changed", (e) => {
        cb(e);
    });
};
bus["onEditorClicked"] = (cb) => {
    bus.addEventListener("editor-clicked", (e) => {
        cb(e);
    });
};
