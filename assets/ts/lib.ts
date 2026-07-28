import { _GetOrgAvatar } from "./libClasses/avatar.js";
import { _CodeTemplates } from "./libClasses/codeTemplates.js";
import { _ContextMenuLoader } from "./libClasses/contextMenuLoader.js";
import { _Dirs } from "./libClasses/dirs.js";
import { _DragDrop } from "./libClasses/dragndrop.js";
import { _EditorAdapter } from "./libClasses/EditorAdapter.js";
import { _Filenames } from "./libClasses/fillenames.js";
import { _GLS } from "./libClasses/gls.js";
import { _Languages } from "./libClasses/languages.js";
import { _Loader } from "./libClasses/loader.js";
import { _Notificator } from "./libClasses/notificator.js";
import { _Options } from "./libClasses/options.js";
import { _SideBarIconManager } from "./libClasses/sidebarIconManager.js";
import { _Task } from "./libClasses/task.js";
import { _TopBarElement } from "./libClasses/topbarElement.js";
import { animate, initializeInputFocusState, showIndicator } from "./lib/dom.js";
import { addToBug, addToHistory } from "./lib/history.js";

/** Shared mutable renderer state retained for extension compatibility. */
export const GLOBAL: Record<string, unknown> = {};

export const Languages = _Languages;
export const Filenames = _Filenames;
export const Dirs = _Dirs;
export const DragDrop = _DragDrop;
export const Notificator = _Notificator;
export const TopBarElement = _TopBarElement;
export const SideBarIconManager = _SideBarIconManager;
export const Options = _Options;
export const ContextMenuLoader = _ContextMenuLoader;
export const Loader = _Loader;
export const GLS = _GLS;
export const CodeTemplates = _CodeTemplates;
export const EditorAdapter = _EditorAdapter;
export const Task = _Task;
export const GetOrgAvatar = _GetOrgAvatar;

export { idify, toBase64 } from "./lib/encoding.js";
export {
    SmoothScroll,
    animate,
    changeTagName,
    fitAceHeight,
    generateAvatar,
    getAllCSSVariables,
    handleOnWheelScrollX,
    handlePopups,
    hideCodeWindowVisuals,
    scrollToBottomSmooth,
    setTabName,
    setTabNameCounter,
    showCodeWindowVisuals,
    showIndicator,
    tabName,
} from "./lib/dom.js";
export {
    formatUnix,
    getCodeByName,
    normalizePath,
    secondsToMinutes,
    transparentColor,
} from "./lib/format.js";
export { addToBug, addToHistory } from "./lib/history.js";
export {
    copyText,
    createNotify,
    getGithubToken,
    getTheme,
    parseTwemojiElement,
    parseTwemojiString,
    setAppTitle,
} from "./lib/platform.js";
export { addRuntimeError, clearRuntimeErrors } from "./lib/runtimeErrors.js";
export { runCode, runSandbox } from "./lib/sandbox.js";
export {
    capitilize,
    dedent,
    escapeHtml,
    getInitials,
    linkify,
    splitCamelCase,
    truncateString,
} from "./lib/text.js";
export { showNeedReloadTopBar } from "./lib/ui.js";
export { eventLog, isArray, isFloat, isObject, isStringifiedObject, type } from "./lib/values.js";

const imageIcons = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "bmp",
    "svg",
    "ico",
    "avif",
    "tif",
    "tiff",
    "heic",
    "heif",
];
const fontIcons = ["ttf", "otf", "woff", "woff2", "eot"];

imageIcons.forEach((id) =>
    Languages.add({ id, name: "Image", icon: "image", iconExt: "svg", mode: "text" }),
);
fontIcons.forEach((id) =>
    Languages.add({ id, name: "Font", icon: "font", iconExt: "svg", mode: "text" }),
);
initializeInputFocusState();

window.Notificator = Notificator;
window.addToBug = addToBug;
window.addToHistory = addToHistory;
window.showIndicator = showIndicator;
window.animate = animate;
