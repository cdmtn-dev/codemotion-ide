import { valid } from "./validation.js";
/** Creates a native notification through the Electron preload API. */
export function createNotify(properties = {}) {
    const type = valid(properties.type) ?? "info_i";
    const icon = valid(properties.icon) ?? "info_i";
    const title = valid(properties.title) ?? "Untitled";
    const content = valid(properties.content) ?? "No description provided";
    let time = Number(valid(properties.time) ?? 3000);
    const image = valid(properties.image) ?? false;
    if (time < 3000 || time > 10_000)
        time = 3000;
    const notification = {
        title,
        description: content,
        timeout: time,
    };
    if (icon)
        notification.icon = icon;
    if (type)
        notification.type = type;
    if (image)
        notification.image = image;
    window.electron.createNotification(notification);
}
/** Returns the current body theme or the default theme name. */
export function getTheme() {
    return document.body.getAttribute("theme") ?? "default";
}
/** Copies text to the system clipboard and reports failures to the console. */
export function copyText(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => console.log("Text copied to clipboard successfully!"))
        .catch((error) => console.error("Failed to copy text: ", error));
}
/** Converts emoji in a string to Twemoji SVG markup. */
export function parseTwemojiString(text) {
    return twemoji.parse(text, { folder: "svg", ext: ".svg" });
}
/** Converts emoji contained by an element to Twemoji SVG markup. */
export function parseTwemojiElement(element) {
    if (element)
        twemoji.parse(element, { folder: "svg", ext: ".svg" });
}
/** Updates the native application title. */
export function setAppTitle(title) {
    window.electron.setAppTitle(title);
}
/** Returns the persisted GitHub token or the historical `false` sentinel. */
export async function getGithubToken() {
    const localData = await window.electron.getLocal();
    if (localData &&
        typeof localData === "object" &&
        "githubToken" in localData &&
        typeof localData.githubToken === "string" &&
        localData.githubToken.length > 0) {
        return localData.githubToken;
    }
    return false;
}
