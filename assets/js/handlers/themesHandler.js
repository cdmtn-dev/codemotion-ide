import { Setting } from "../settings.js";

export function optionsThemeButtonHandler(themeSelect) {
    themeSelect.on("click", (item) => {
        const id = item.id;

        Setting.themeSelect(id);
    });
}
