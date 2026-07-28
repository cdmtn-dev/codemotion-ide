import { sendEvent } from "../../../bus.js";
import { themeEditors } from "../../../explorerTree/tabHandler.js";
import { optionsThemeButtonHandler } from "../../../handlers/themesHandler.js";
import { Options } from "../../../lib.js";

export function themeRegisterCallback({ name, data }) {
    const themeSelectOptions = Options.edit("themeSelect");
    themeSelectOptions.add(data.id, name);

    const style = document.createElement("style");
    style.id = `theme-${data.id}`;
    style.textContent = `body[theme="${data.id}"] { ${data.variables} }`;

    document.head.appendChild(style);

    optionsThemeButtonHandler(themeSelectOptions);

    themeEditors.add(data.id, data.editorTheme);

    sendEvent("new-theme-register", { id: data.id, name });
}
