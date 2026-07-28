export function onLoadCSSCallback({ id, content }) {
    const style = document.createElement("style");
    style.id = `css-${id}-${Math.floor(Math.random() * 99_999)}`;
    style.textContent = content;

    document.head.appendChild(style);
}
