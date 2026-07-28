import { bus, sendEvent } from "../../js/bus.js";
import { themeEditors } from "../explorerTree/tabHandler.js";
import { disableErrors, enableErrors } from "../handlers/bottomTabHandler.js";
import { optionsThemeButtonHandler } from "../handlers/themesHandler.js";
import {
    createNotify,
    Dirs,
    escapeHtml,
    idify,
    Languages,
    Options,
    TopBarElement,
} from "../lib.js";
import { onLocalizationRegister } from "./events/app/onLocalizationRegister.js";
import { onNotificationCallback } from "./events/app/onNotification.js";
import { onEditorChangeNewHLRulesCallback } from "./events/editor/onEditorChangeNewHLRules.js";
import { onFilenamesRegister } from "./events/editor/onFilenamesRegister.js";
import { onLanguageRegisterCallback } from "./events/editor/onLanguageRegister.js";
import { onNewDirIconRegisterCallback } from "./events/editor/onNewDirIconRegister.js";
import { onNewDocumentationRegisterCallback } from "./events/editor/onNewDocumentationRegister.js";
import { onNewFileExtensionsRegister } from "./events/editor/onNewFileExtensionsRegister.js";
import { onTemplatesRegister } from "./events/editor/onTemplatesRegister.js";
import { onElementCreate } from "./events/ui/onElementCreate.js";
import { onElementMod } from "./events/ui/onElementMod.js";
import { onLoadCSSCallback } from "./events/ui/onLoadCSS.js";
import { themeRegisterCallback } from "./events/ui/onThemeRegister.js";

const preloadapi = window.electron;
const extapi = preloadapi.ext;

const contexts = {};
const currentEditor = null;

export function handleExtensionEvents() {
    const audioProvider = new Audio();
    audioProvider.preload = "auto";

    extapi.app.onLog((name, text) => {
        console.log(`[LOG FROM "${name}"] ${text}`);
    });

    extapi.ui.theme.onRegister((name, data) => {
        themeRegisterCallback({ name, data });
    });
    extapi.ui.css.onLoad((id, content) => {
        onLoadCSSCallback({ id, content });
    });
    extapi.ui.element.onCreate((data) => {
        onElementCreate(data);
    });
    extapi.ui.element.onMod((data) => {
        onElementMod(data, { TopBarElement, idify });
    });

    extapi.editor.docs.onRegister((data) => {
        onNewDocumentationRegisterCallback({ data });
    });
    extapi.editor.language.onRegister(async (data) => {
        onLanguageRegisterCallback({ data });
    });
    extapi.editor.dir.onIconsRegister((data) => {
        onNewDirIconRegisterCallback({ data });
    });
    extapi.editor.language.onChangeHLRules((data) => {
        onEditorChangeNewHLRulesCallback({
            data,
            contexts,
            refreshEditorHighlight,
        });
    });
    extapi.editor.filenames.onRegister((data) => {
        onFilenamesRegister(data);
    });
    extapi.editor.fileExtensions.onRegister((data) => {
        onNewFileExtensionsRegister(data);
    });
    extapi.editor.templates.onRegister((data) => {
        onTemplatesRegister(data);
    });

    extapi.app.onNotification((name, data) => {
        onNotificationCallback({ data, name });
    });
    extapi.app.onLocalizationRegister((data) => {
        onLocalizationRegister(data);
    });

    extapi.app.onAudioPlay((data) => {
        const path = data.path;
        const volume = data.volume;
        const speed = data.speed;

        audioProvider.src = path;
        audioProvider.load();

        audioProvider.volume = volume;
        audioProvider.playbackRate = speed;

        audioProvider.addEventListener("loadedmetadata", () => {
            if (audioProvider.duration < 31) {
                audioProvider.play();
            }
        });
    });
}
