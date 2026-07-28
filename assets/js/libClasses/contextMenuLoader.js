export class _ContextMenuLoader {
    static el = document.querySelector("#incontext-loading");

    static show() {
        _ContextMenuLoader.el.classList.remove("hidden");
    }
    static hide() {
        _ContextMenuLoader.el.classList.add("hidden");
    }
    static text(text) {
        _ContextMenuLoader.el.querySelector("#incontext-loading-text").textContent = text;
    }
}
