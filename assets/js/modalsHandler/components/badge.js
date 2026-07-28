import { createDIV, createSpan } from "../handlers/helpers.js";

export function renderBadge(properties = {}) {
    const type = properties.type;

    const badges = {
        verified: {
            class: "modal-verified__badge",
            icon: "check",
        },
    };

    const badgeEl = createDIV();
    badgeEl.classList.add("modal-badge", badges[type].class);

    const iconEl = createSpan();
    iconEl.classList.add("material-symbols-rounded");
    iconEl.textContent = badges[type].icon;

    badgeEl.appendChild(iconEl);

    return badgeEl;
}
