import { Setting } from "../settings.js"

export function optionsThemeButtonHandler(themeSelect) {
    themeSelect.on("click", (item) => {
        const id = item.id;

        document.body.classList.add("theme-transition");

        requestAnimationFrame(() => {
            Setting.themeSelect(id);
        });

        setTimeout(() => {
            document.body.classList.remove("theme-transition");
        }, 400);
    });
}