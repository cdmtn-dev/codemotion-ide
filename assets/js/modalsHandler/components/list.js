import { createDIV, createSpan } from "../handlers/helpers.js";
import { renderButton } from "./button.js";
import { renderInput } from "./input.js";

function renderInputHelper({ i, placeholders, placeholderAll, placeholderPrefix, valuesReadOnly }) {
    let placeholder = placeholders[i] ?? `List item #${i}`;

    if (placeholderAll) {
        placeholder = placeholderAll;
    }
    const input = renderInput({
        id: `modal-list__item-${i + 1}`,
        placeholder,
        prefix: placeholderPrefix,
    });

    if (valuesReadOnly) {
        input.querySelector("input").setAttribute("readonly", true);
    } else {
        input.querySelector("input").removeAttribute("readonly");
    }

    return input;
}

export function renderList(properties = {}) {
    const id = properties.id;
    const maxElements = properties.maxElements;
    const renderType = properties.renderType;
    const placeholders = properties.placeholders;
    const placeholderAll = properties.placeholderAll;
    const placeholderPrefix = properties.placeholderPrefix;
    const values = properties.values;
    const valuesReadOnly = properties.valuesReadOnly;
    const onAdd = properties.onAdd;

    const addedElements = [];

    const wrapper = createDIV();
    wrapper.classList.add("modal-list");
    wrapper.id = id;

    if (renderType == "immediately") {
        for (let i = 0; i < maxElements; i++) {
            const input = renderInputHelper({
                i,
                placeholders,
                placeholderAll,
                placeholderPrefix,
                valuesReadOnly,
            });

            wrapper.appendChild(input);
        }
    } else if (renderType == "byAdding") {
        // render first
        const minRender = values.length > 1 ? values.length : 1;

        for (let i = 0; i < minRender; i++) {
            const input = renderInputHelper({
                i,
                placeholders,
                placeholderAll,
                placeholderPrefix,
                valuesReadOnly,
            });

            if (i in values) {
                input.querySelector("input").value += values[i];
            }

            addedElements.push(input);

            wrapper.appendChild(input);
        }

        const addMoreBtn = renderButton({
            title: "Add",
            id: "modal-list__add-btn",
        });

        if (!valuesReadOnly) {
            wrapper.appendChild(addMoreBtn);

            addMoreBtn.addEventListener("click", () => {
                const currentId = addedElements.length + 1;

                if (onAdd && typeof onAdd == "function") {
                    onAdd(currentId);
                }

                const input = renderInputHelper({
                    currentID: currentId,
                    placeholders,
                    placeholderAll,
                    placeholderPrefix,
                    valuesReadOnly,
                });

                addedElements.push(input);
                addMoreBtn.before(input);

                if (currentId >= maxElements) {
                    addMoreBtn.classList.add("hidden");
                }
            });
        }
    }

    return wrapper;
}
