export class _DragDrop {
    constructor(el) {
        if (!(el instanceof HTMLElement)) {
            throw new Error("DragDrop element can be only HTML Element");
        }

        this.el = el;

        if (!("draggable" in el)) {
            throw new Error("HTML Element cant support draggable");
        }

        el.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
    }

    onDrop(callback = () => {}) {
        this.el.addEventListener("drop", async (e) => {
            e.preventDefault();

            const files = e.dataTransfer.files;

            for (const file of files) {
                const text = await file.text();
                const name = file.name;

                callback({ content: text, name, extension: name.split(".").pop() });
            }
        });
    }
}
