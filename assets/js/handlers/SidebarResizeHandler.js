const SIDEBAR_WIDTH_STORAGE_KEY = "codemotion.explorerWidth";
const DEFAULT_WIDTH = 300;
const MIN_WIDTH = 220;
const MAX_WIDTH = 520;

export class SidebarResizeHandler {
    constructor({ explorer, mainWrapper, settings = {}, onResizeEnd = () => {} } = {}) {
        this.explorer = explorer;
        this.mainWrapper = mainWrapper;
        this.settings = settings;
        this.onResizeEnd = onResizeEnd;
        this.resizeState = null;
        this.resizeFrame = null;
        this.nextWidth = null;
        this.resizePreview = null;
        this.handleResizeMove = this.#handleResizeMove.bind(this);
        this.handleResizeEnd = this.#handleResizeEnd.bind(this);
        this.handleReduceMotionChange = (event) => {
            this.settings = {
                ...this.settings,
                app: {
                    ...this.settings?.app,
                    reduceMotion: event.detail?.reduceMotion === true,
                },
            };
        };

        if (!(this.explorer && this.mainWrapper)) return;

        this.#init();
    }

    #init() {
        this.handle = document.createElement("div");
        this.handle.className = "explorer__resize-handle";
        this.handle.setAttribute("role", "separator");
        this.handle.setAttribute("aria-orientation", "vertical");
        this.handle.setAttribute("aria-label", "Resize sidebar");
        this.explorer.appendChild(this.handle);

        this.#setWidth(this.#getSavedWidth());
        this.handle.addEventListener("pointerdown", (event) => this.#handleResizeStart(event));
        window.addEventListener("codemotion-reduce-motion-change", this.handleReduceMotionChange);
    }

    #handleResizeStart(event) {
        const explorerRect = this.explorer.getBoundingClientRect();
        const wrapperRect = this.mainWrapper.getBoundingClientRect();
        const reduceMotion = this.settings?.app?.reduceMotion === true;

        this.resizeState = {
            left: explorerRect.left,
            minWidth: MIN_WIDTH,
            maxWidth: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, wrapperRect.width - 280)),
            reduceMotion,
        };

        this.nextWidth = explorerRect.width;
        document.body.classList.add("explorer-resizing");
        this.explorer.classList.add("resizing");
        this.explorer.style.transition = "none";

        this.explorer.dispatchEvent(new CustomEvent("explorer-resize-start"));

        if (reduceMotion) {
            this.#showResizePreview(explorerRect);
        }

        document.addEventListener("pointermove", this.handleResizeMove);
        document.addEventListener("pointerup", this.handleResizeEnd, { once: true });
        document.addEventListener("pointercancel", this.handleResizeEnd, { once: true });

        event.preventDefault();
    }

    #handleResizeMove(event) {
        if (!this.resizeState) return;

        const nextWidth = event.clientX - this.resizeState.left;
        const width = Math.min(
            Math.max(nextWidth, this.resizeState.minWidth),
            this.resizeState.maxWidth,
        );

        this.nextWidth = width;

        if (this.resizeFrame) return;

        this.resizeFrame = requestAnimationFrame(() => {
            this.resizeFrame = null;
            if (this.nextWidth == null) return;

            if (this.resizeState?.reduceMotion) {
                this.#moveResizePreview(this.resizeState.left + this.nextWidth);
                return;
            }

            this.#setWidth(this.nextWidth);
            this.#notifyResize();
        });
    }

    #handleResizeEnd() {
        const wasResizing = Boolean(this.resizeState);
        const applyWidth = this.nextWidth;

        if (this.resizeFrame) {
            cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = null;
        }

        if (applyWidth != null) {
            this.#setWidth(applyWidth);
            this.#saveWidth(applyWidth);
            this.#notifyResize();
        }

        this.#hideResizePreview();
        this.resizeState = null;
        this.nextWidth = null;
        document.body.classList.remove("explorer-resizing");
        this.explorer?.classList.remove("resizing");
        if (this.explorer) this.explorer.style.transition = "";

        document.removeEventListener("pointermove", this.handleResizeMove);
        document.removeEventListener("pointerup", this.handleResizeEnd);
        document.removeEventListener("pointercancel", this.handleResizeEnd);

        if (wasResizing) {
            this.explorer?.dispatchEvent(new CustomEvent("explorer-resize-end"));
            this.onResizeEnd();
        }
    }

    #getSavedWidth() {
        const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
        if (!Number.isFinite(savedWidth)) return DEFAULT_WIDTH;

        return Math.min(Math.max(savedWidth, MIN_WIDTH), MAX_WIDTH);
    }

    #saveWidth(width) {
        localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(Math.round(width)));
    }

    #setWidth(width) {
        this.explorer.style.setProperty("--explorer-width", `${Math.round(width)}px`);
    }

    #notifyResize() {
        window.dispatchEvent(new Event("resize"));
    }

    #showResizePreview(explorerRect) {
        this.#hideResizePreview();

        const preview = document.createElement("div");
        preview.className = "explorer__resize-preview";
        preview.style.left = `${explorerRect.right}px`;
        preview.style.top = `${explorerRect.top}px`;
        preview.style.height = `${explorerRect.height}px`;

        document.body.appendChild(preview);
        this.resizePreview = preview;
    }

    #moveResizePreview(left) {
        if (!this.resizePreview) return;

        this.resizePreview.style.left = `${left}px`;
    }

    #hideResizePreview() {
        this.resizePreview?.remove();
        this.resizePreview = null;
    }
}
