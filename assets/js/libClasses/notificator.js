export class _Notificator {
    constructor() {
        this.element = document.querySelector(".notificator-wrapper");
        if (!this.element) throw new Error("'.notificator-wrapper' not found");

        this._rafId = null;
        this._hideTimer = null;
        this._visible = !this.element.classList.contains("hidden");

        this.notificatorValue = document.querySelector("#notificator_value");
        this.notificatorIcon = document.querySelector("#notificator_icon");

        this.text = "Example";
        this.icon = "search";
    }

    setSize(size = "default") {
        const sizes = ["default", "small", "medium", "large", "pill"];

        if (sizes.includes(size)) {
            this.element.classList.add(size);
        }
    }

    show(duration = 3000) {
        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }

        this.notificatorValue.textContent = this.text;
        this.notificatorIcon.textContent = this.icon;

        if (!this._visible && this._rafId === null) {
            this._rafId = requestAnimationFrame(() => {
                this.element.classList.remove("hidden");
                this._visible = true;
                this._rafId = null;
            });
        }

        this._hideTimer = setTimeout(() => this._doHide(), duration);
    }

    hide() {
        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._doHide();
    }

    _doHide() {
        if (!this._visible) return;
        this.element.classList.add("hidden");
        this._visible = false;
    }
}
