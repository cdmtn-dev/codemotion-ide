import { getInitials } from "./text.js";
/** The tab title element captured when the compatibility module is evaluated. */
export const tabName = document.querySelector("#tab-name");
/** Updates or removes the counter displayed beside the tab title. */
export function setTabNameCounter(count) {
    if (!tabName)
        return;
    tabName.querySelector(".counter")?.remove();
    if (count !== false) {
        tabName.insertAdjacentHTML("beforeend", `<span class="counter">${count}</span>`);
    }
}
/** Replaces the current tab title markup. */
export function setTabName(text) {
    if (tabName)
        tabName.innerHTML = text;
}
/** Shows the status indicator and schedules it to hide after its transition. */
export function showIndicator(time = 1500, callback) {
    const indicator = document.querySelector(".status-indicator");
    if (!indicator)
        return;
    indicator.classList.remove("hidden");
    callback?.(indicator);
    indicator.addEventListener("transitionend", () => setTimeout(() => indicator.classList.add("hidden"), time), { once: true });
}
/** Transition helpers shared by legacy UI components. */
export const animate = {
    /** Replaces one element with another using the existing blur transition. */
    blurReplace({ add, remove }) {
        if (!(add && remove))
            return;
        add.classList.remove("hidden", "blur-hidden");
        remove.classList.remove("hidden", "blur-hidden");
        remove.classList.add("blur-hidden");
        const onTransitionEnd = () => {
            remove.classList.add("hidden");
            remove.removeEventListener("transitionend", onTransitionEnd);
            add.classList.remove("hidden");
            add.classList.add("blur-hidden");
            requestAnimationFrame(() => add.classList.remove("blur-hidden"));
        };
        remove.addEventListener("transitionend", onTransitionEnd);
    },
};
/** Installs the document-level popup interaction handler. */
export function handlePopups() {
    const popups = document.querySelectorAll("[popup]");
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element))
            return;
        let clickedInsidePopup = false;
        popups.forEach((popup) => {
            const content = popup.querySelector(".popup-content");
            const title = popup.querySelector(".popup-title");
            if (!(content && title))
                return;
            if (title.contains(target)) {
                event.stopPropagation();
                const isOpen = !content.classList.contains("hidden");
                popups.forEach((item) => {
                    item.querySelector(".popup-content")?.classList.add("hidden");
                    item.querySelector(".popup-title")?.classList.remove("active");
                });
                if (!isOpen) {
                    content.classList.remove("hidden");
                    title.classList.add("active");
                }
                clickedInsidePopup = true;
            }
            if (target.closest(".popup-content__item") && popup.contains(target)) {
                content.classList.add("hidden");
                title.classList.remove("active");
                clickedInsidePopup = true;
            }
            if (popup.contains(target))
                clickedInsidePopup = true;
        });
        if (!clickedInsidePopup) {
            popups.forEach((popup) => {
                popup.querySelector(".popup-content")?.classList.add("hidden");
                popup.querySelector(".popup-title")?.classList.remove("active");
            });
        }
    });
}
/** Adds animated wheel scrolling to an element or the document. */
export function SmoothScroll(target, speed, smooth) {
    let scrollTarget;
    if (target === document) {
        scrollTarget = (document.scrollingElement ||
            document.documentElement ||
            document.body);
    }
    else {
        scrollTarget = target;
    }
    let moving = false;
    let position = scrollTarget.scrollTop;
    const frame = scrollTarget === document.body && document.documentElement
        ? document.documentElement
        : scrollTarget;
    const update = () => {
        moving = true;
        const delta = (position - scrollTarget.scrollTop) / smooth;
        scrollTarget.scrollTop += delta;
        if (Math.abs(delta) > 0.5)
            requestFrame(update);
        else
            moving = false;
    };
    const scrolled = (event) => {
        event.preventDefault();
        const wheel = event;
        const delta = wheel.detail
            ? wheel.wheelDelta
                ? (wheel.wheelDelta / wheel.detail / 40) * (wheel.detail > 0 ? 1 : -1)
                : -wheel.detail / 3
            : (wheel.wheelDelta ?? -wheel.deltaY) / 120;
        position += -delta * speed;
        position = Math.max(0, Math.min(position, scrollTarget.scrollHeight - frame.clientHeight));
        if (!moving)
            update();
    };
    const requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        ((callback) => window.setTimeout(callback, 1000 / 50));
    scrollTarget.addEventListener("mousewheel", scrolled, { passive: false });
    scrollTarget.addEventListener("DOMMouseScroll", scrolled, { passive: false });
}
/** Generates the HTML for a deterministic initials avatar. */
export function generateAvatar(name) {
    let hash = 0;
    for (let index = 0; index < name.length; index++) {
        hash = name.charCodeAt(index) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    const hslToHex = (lightness) => {
        const saturation = 0.6;
        const normalizedLightness = lightness / 100;
        const k = (part) => (part + hue / 30) % 12;
        const a = saturation * Math.min(normalizedLightness, 1 - normalizedLightness);
        const channel = (part) => Math.round(255 *
            (normalizedLightness -
                a * Math.max(-1, Math.min(k(part) - 3, Math.min(9 - k(part), 1)))))
            .toString(16)
            .padStart(2, "0");
        return `#${channel(0)}${channel(8)}${channel(4)}`;
    };
    const generated = document.createElement("div");
    generated.classList.add("generated-avatar");
    generated.style.cssText = `--background: ${hslToHex(90)};--background-second: ${hslToHex(80)};--foreground: ${hslToHex(30)};`;
    generated.textContent = getInitials(name);
    return generated.outerHTML;
}
/** Enables horizontal wheel scrolling for tab and command rows. */
export function handleOnWheelScrollX() {
    document
        .querySelectorAll(".code-tabs, .commands .commands-suggest")
        .forEach((el) => {
        el.addEventListener("wheel", (event) => {
            event.preventDefault();
            el.scrollBy({ left: event.deltaY / 5 });
        }, { passive: false });
    });
}
/** Smoothly scrolls an element to its bottom edge. */
export function scrollToBottomSmooth(element) {
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
}
/** Lists custom property names declared by accessible `:root` rules. */
export function getAllCSSVariables() {
    return Array.from(document.styleSheets)
        .filter((sheet) => sheet.href === null || sheet.href.startsWith(window.location.origin))
        .flatMap((sheet) => Array.from(sheet.cssRules))
        .filter((rule) => "selectorText" in rule && rule.selectorText === ":root")
        .flatMap((rule) => Array.from(rule.style).filter((name) => name.startsWith("--")));
}
const codeTabs = document.querySelector(".code-tabs");
const codeFooter = document.querySelector(".code-footer");
/** Displays the code tabs and footer. */
export function showCodeWindowVisuals() {
    codeTabs?.classList.remove("hidden");
    codeFooter?.classList.remove("hidden");
}
/** Hides the code tabs and footer. */
export function hideCodeWindowVisuals() {
    codeTabs?.classList.add("hidden");
    codeFooter?.classList.add("hidden");
}
/** Replaces an element while retaining its attributes and child nodes. */
export function changeTagName(oldElement, newTagName) {
    const newElement = document.createElement(newTagName);
    for (const attribute of oldElement.attributes) {
        newElement.setAttribute(attribute.name, attribute.value);
    }
    while (oldElement.firstChild)
        newElement.appendChild(oldElement.firstChild);
    oldElement.replaceWith(newElement);
    return newElement;
}
/** Fits an Ace editor to its current line count within the given bounds. */
export function fitAceHeight(editor, minHeight = 50, maxHeight = 800) {
    const height = Math.min(maxHeight, Math.max(minHeight, editor.session.getLength() * editor.renderer.lineHeight));
    editor.container.style.height = height + "px";
    editor.resize();
}
/** Adds focused styling to inputs present when the module loads. */
export function initializeInputFocusState() {
    document.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.toggle("focused", Number(input.value) > 0);
        });
    });
}
