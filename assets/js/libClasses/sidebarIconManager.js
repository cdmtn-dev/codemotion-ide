export class _SideBarIconManager {
    constructor(selector) {
        const element = document.querySelector(`.sidebar-item#${selector}`);
        this.element = element;
    }

    set(icon) {
        const iconPath = `../assets/media/icons/external/${icon}.svg`;

        if (this.icon) {
            this.icon.src = iconPath;
            return;
        }

        const img = document.createElement("img");
        img.classList.add("sidebar-icon");
        img.src = iconPath;

        this.element.appendChild(img);
        this.icon = img;
    }

    size(size) {
        this.icon.style.cssText += `--size: ${size}px;`;
    }

    blink(state = true) {
        if (this.icon) {
            this.icon.classList.toggle("blink", state);
        }
    }

    remove() {
        if (this.icon) {
            this.icon.remove();
        }
    }
}
