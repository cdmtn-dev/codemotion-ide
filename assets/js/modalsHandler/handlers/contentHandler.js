import { renderButton } from "../components/button.js";
import { renderCentered } from "../components/centered.js";
import { renderContainer } from "../components/container.js";
import { renderDivider } from "../components/divider.js";
import { renderDropdown } from "../components/dropdown.js";
import { renderExtensionItem } from "../components/extensionItem.js";
import { renderGithubRepos } from "../components/githubRepos.js";
import { renderImage } from "../components/image.js";
import { renderInfoBlocks } from "../components/infoBlocks.js";
import { renderInput } from "../components/input.js";
import { renderList } from "../components/list.js";
import { renderOrganization } from "../components/organization.js";
import { renderPlaceholder } from "../components/placeholder.js";
import { renderRange } from "../components/range.js";
import { renderSwitch } from "../components/switch.js";
import { valid, validArray, validBool, validHTTPS, validObject } from "../engine.js";

const types = {
    columns: (wrapper, data) => {
        const cols = valid(data.cols) ?? 0;
        const gap = valid(data.gap) ?? 0;

        wrapper.classList.add("modal-columns");

        if (cols != 0) {
            wrapper.style.cssText += `display: grid;grid-template-columns: repeat(${cols}, 1fr)`;
        }
        if (gap != 0) {
            wrapper.style.cssText += `gap: ${gap}px`;
        }

        return wrapper;
    },
    row: (wrapper, data) => {
        const classList = validArray(data.classList) ?? [];
        const gap = valid(data.gap) ?? 0;

        wrapper.classList.add("modal-row");

        if (classList != 0) {
            wrapper.classList.add(...classList);
        }
        if (gap != 0) {
            wrapper.style.cssText += `gap: ${gap}px`;
        }

        return wrapper;
    },
    "row-clear": (wrapper, data) => {
        const classList = validArray(data.classList) ?? [];
        const gap = valid(data.gap) ?? 0;

        wrapper.classList.add("modal-row", "modal-row__clear");

        if (classList != 0) {
            wrapper.classList.add(...classList);
        }
        if (gap != 0) {
            wrapper.style.cssText += `gap: ${gap}px`;
        }

        return wrapper;
    },
    category: (wrapper, data) => {
        const label = valid(data.label) ?? "";

        wrapper.classList.add("modal-section-category");

        const labelEl = document.createElement("div");
        labelEl.classList.add("modal-section-category__label");
        labelEl.textContent = label.toUpperCase();

        wrapper.appendChild(labelEl);

        return wrapper;
    },
};

export function sideBarContentHandler(element, contentData, id) {
    const contentWrapper = document.createElement("div");
    contentWrapper.id = `${id}_content`;
    contentWrapper.classList.add("modal-body__sidebar-content", "hidden");

    if (!Array.isArray(contentData)) return;

    contentData.forEach((contentElement) => {
        const type = valid(contentElement.type) ?? false;

        if (type != false && type in types) {
            const wrapper = types[type](contentWrapper, contentElement);
            const items = valid(contentElement.items) ?? {};

            element.appendChild(wrapper);

            contentItemsHandler(wrapper, items);
        }
    });

    element.appendChild(contentWrapper);
}

export function defaultContentHandler(element, contentData) {
    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("modal-body__content");

    if (!Array.isArray(contentData)) return;

    contentData.forEach((contentElement) => {
        const type = valid(contentElement.type) ?? false;

        if (type != false && type in types) {
            const wrapper = types[type](contentWrapper, contentElement);
            const items = valid(contentElement.items) ?? {};

            element.appendChild(wrapper);

            contentItemsHandler(wrapper, items);
        }
    });
}

function contentItemsHandler(element, itemsData) {
    if (!Array.isArray(itemsData)) return;

    itemsData.forEach((item) => {
        const type = valid(item.type) ?? false;

        if (type == "switch") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? "Unnamed";
            const desc = valid(item.description) ?? "No description provided";
            const checked = validBool(item.checked) ?? false;

            const switchElement = renderSwitch({
                id,
                title,
                description: desc,
                checked,
            });

            element.appendChild(switchElement);

            appendGlobalProperties(item, switchElement);
        }
        if (type == "range") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? "Unnamed";
            const desc = valid(item.description) ?? "No description provided";
            const min = valid(item.min) ?? 0;
            const max = valid(item.max) ?? 100;
            const value = valid(item.value) ?? 0;
            const step = valid(item.step) ?? 1;
            const prefix = valid(item.prefix) ?? "";

            const rangeElement = renderRange({
                id,
                title,
                description: desc,
                min,
                max,
                value,
                step,
                prefix,
            });

            element.appendChild(rangeElement);

            appendGlobalProperties(item, rangeElement);
        }
        if (type == "placeholder") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? false;
            const description = valid(item.description) ?? false;
            const titleBadge = valid(item.titleBadge) ?? false;
            const link = valid(item.link) ?? false;

            const placeholderElement = renderPlaceholder({
                id,
                title,
                description,
                titleBadge,
                link,
            });

            element.appendChild(placeholderElement);

            appendGlobalProperties(item, placeholderElement);
        }
        if (type == "divider") {
            const dividerElement = renderDivider();

            element.appendChild(dividerElement);

            appendGlobalProperties(item, dividerElement);
        }
        if (type == "extensionItem") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? false;
            const subtitle = valid(item.subtitle) ?? false;
            const description = valid(item.description) ?? false;
            const image = valid(item.image) ?? false;
            const tags = validArray(item.tags) ?? [];
            const buttons = validArray(item.buttons) ?? [];
            const toggle = valid(item.toggle) ?? null;

            const extensionItemElement = renderExtensionItem({
                title,
                subtitle,
                description,
                image,
                tags,
                buttons,
                id,
                toggle,
            });

            element.appendChild(extensionItemElement);

            appendGlobalProperties(item, extensionItemElement);
        }
        if (type == "organization") {
            const id = valid(item.id) ?? false;
            const name = valid(item.name) ?? "Unnamed";
            const description = valid(item.description) ?? "No description provided";
            const website = valid(item.website) ?? false;
            const columns = validArray(item.columns) ?? [];
            const badgeOwner = validBool(item.badgeOwner) ?? false;
            const badgeVerified = validBool(item.badgeVerified) ?? false;
            const avatar = valid(item.avatar) ?? false;
            const repos = validArray(item.repos) ?? [];

            const organizationElement = renderOrganization({
                id,
                name,
                description,
                website,
                columns,
                badgeOwner,
                badgeVerified,
                avatar,
                repos,
            });

            element.appendChild(organizationElement);

            appendGlobalProperties(item, organizationElement);
        }
        if (type == "input") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? false;
            const description = valid(item.description) ?? false;
            const placeholder = valid(item.placeholder) ?? false;
            const prefix = valid(item.prefix) ?? false;
            const values = validArray(item.values) ?? [];
            const valuesReadOnly = validBool(item.valuesReadOnly) ?? false;
            const onAdd = valid(item.onAdd) ?? false;

            const inputElement = renderInput({
                id,
                title,
                description,
                placeholder,
                prefix,
                values,
                valuesReadOnly,
                onAdd,
            });

            element.appendChild(inputElement);

            appendGlobalProperties(item, inputElement);
        }
        if (type == "button") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? false;
            const container = valid(item.container) ?? false;
            const btnClass = valid(item.class) ?? "default";
            const onclick = valid(item.onclick) ?? false;

            const buttonElement = renderButton({
                id,
                title,
                container,
                element,
                class: btnClass,
                onclick,
            });

            element.appendChild(buttonElement);

            appendGlobalProperties(item, buttonElement);
        }
        if (type == "container") {
            const id = valid(item.id) ?? false;
            const classList = validArray(item.classList) ?? [];
            const html = valid(item.html) ?? false;

            const containerElement = renderContainer({
                id,
                classList,
                html,
            });

            element.appendChild(containerElement);

            appendGlobalProperties(item, containerElement);
        }
        if (type == "centered") {
            const icon = valid(item.icon) ?? false;

            const centeredElement = renderCentered({
                icon,
            });

            element.appendChild(centeredElement);

            appendGlobalProperties(item, centeredElement);
        }
        if (type == "image") {
            const id = valid(item.id) ?? false;
            const src = valid(item.src) ?? false;

            const imageElement = renderImage({
                id,
                src,
            });

            element.appendChild(imageElement);

            appendGlobalProperties(item, imageElement);
        }
        if (type == "dropdown") {
            const id = valid(item.id) ?? false;
            const title = valid(item.title) ?? "Unnamed";
            const description = valid(item.description) ?? "No description provided";
            const options = validArray(item.options) ?? [];
            const selected = valid(item.selected) ?? "";

            const dropdownElement = renderDropdown({
                id,
                title,
                description,
                options,
                selected,
            });

            element.appendChild(dropdownElement);

            appendGlobalProperties(item, dropdownElement);
        }
        if (type == "list") {
            const id = valid(item.id) ?? false;
            const maxElements = valid(item.maxElements) ?? 10;
            const renderType = valid(item.renderType) ?? "immediately";
            const placeholders = validArray(item.placeholders) ?? [];
            const placeholderAll = valid(item.placeholderAll) ?? false;
            const placeholderPrefix = valid(item.placeholderPrefix) ?? false;

            const listElement = renderList({
                id,
                maxElements,
                renderType,
                placeholders,
                placeholderAll,
                placeholderPrefix,
            });

            element.appendChild(listElement);

            appendGlobalProperties(item, listElement);
        }
        if (type == "githubRepos") {
            const id = valid(item.id) ?? false;
            const urls = validArray(item.urls) ?? [];

            const githubReposElement = renderGithubRepos({
                id,
                urls,
            });

            element.appendChild(githubReposElement);

            appendGlobalProperties(item, githubReposElement);
        }
        if (type == "infoBlocks") {
            const id = valid(item.id) ?? false;
            const blocks = validArray(item.blocks) ?? [];

            const infoBlocksElement = renderInfoBlocks({
                id,
                blocks,
            });

            element.appendChild(infoBlocksElement);

            appendGlobalProperties(item, infoBlocksElement);
        }
    });
}

function appendGlobalProperties(item, element) {
    let note = false;
    let disabled = false;
    const classList = [];
    const styles = {};

    if ("note" in item) {
        note = document.createElement("div");
        note.classList.add("modal-note");
        note.textContent = item.note;
    }
    if ("disabled" in item) disabled = item.disabled;
    if ("classList" in item && Array.isArray(item.classList))
        element.classList.add(...item.classList);

    if ("styles" in item) {
        const aliases = {
            width: "width",
            height: "height",
            borderRadius: "border-radius",
        };

        Object.keys(item.styles).forEach((s) => {
            element.style.cssText += `${aliases[s]}: ${item.styles[s]}`;
        });
    }

    if (note) element.appendChild(note);
    if (disabled) element.classList.add("disabled");
}
