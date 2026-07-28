export function createDIV() {
    return document.createElement("div");
}
export function createParagraph(text, isWrapper = false, isHtml = false) {
    const p = document.createElement("p");

    if (!isHtml) p.textContent = text;
    if (isHtml) p.innerHTML = text;

    if (isWrapper) {
        const wrapper = document.createElement("span");
        wrapper.appendChild(p);

        return wrapper;
    }
    return p;
}
export function createIcon(name) {
    const icon = document.createElement("span");
    icon.classList.add("material-symbols-rounded");
    icon.textContent = name;

    return icon;
}
export function createLink(url) {
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = `http://safety.yurba.one/?t=link&source=${url}`;

    return link;
}
export function createBadge(icon) {
    const badge = document.createElement("div");
    badge.classList.add("modal-badge");

    const iconEl = document.createElement("span");
    iconEl.classList.add("material-symbols-rounded");
    iconEl.textContent = icon;

    badge.appendChild(iconEl);

    return badge;
}
export function createSpan() {
    return document.createElement("span");
}

export function replaceVars(text, vars) {
    return text.replace(/%\((.*?)\)/g, (_, key) => (key in vars ? String(vars[key]) : _));
}
export async function svgToElement(url) {
    const parser = new DOMParser();

    const res = await fetch(url);
    const svg = parser.parseFromString(await res.text(), "image/svg+xml");

    return svg.documentElement;
}
export function wrapTags(text, className = "tag") {
    return text.replace(
        /(^|\s)(#([\p{L}\p{N}_-]+))/gu,
        (_, space, tag) => `${space}<span class="${className}">${tag}</span>`,
    );
}
