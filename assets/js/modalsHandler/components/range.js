function createRangeLabels(properties = {}) {
    const min = properties.min;
    const max = properties.max;
    const prefix = properties.prefix;

    const middle = (min + max) / 2;

    return `
        <div>${min}${prefix}</div>
        <div>${middle}${prefix}</div>
        <div>${max}${prefix}</div>
    `;
}

export function renderRange(properties = {}) {
    const id = properties.id;
    const title = properties.title;
    const description = properties.description;

    const min = properties.min;
    const max = properties.max;
    const value = properties.value;
    const step = properties.step;
    const prefix = properties.prefix;

    const wrapper = document.createElement("div");
    wrapper.classList.add("modal-category__item");

    const element = document.createElement("div");
    element.classList.add("modal-category__range");

    const input = document.createElement("input");
    input.type = "range";
    input.id = id;
    input.min = min;
    input.max = max;
    input.value = value;
    input.step = step;

    const footer = document.createElement("div");
    footer.classList.add("modal-category__range-footer");

    footer.innerHTML = createRangeLabels({
        min,
        max,
        prefix,
    });

    const elementTitle = document.createElement("div");
    elementTitle.classList.add("modal-category__item-title");
    elementTitle.textContent = title;

    const elementDesc = document.createElement("div");
    elementDesc.classList.add("modal-category__item-desc");
    elementDesc.textContent = description;

    element.appendChild(input);
    element.appendChild(footer);

    wrapper.appendChild(elementTitle);
    wrapper.appendChild(elementDesc);
    wrapper.appendChild(element);

    return wrapper;
}
