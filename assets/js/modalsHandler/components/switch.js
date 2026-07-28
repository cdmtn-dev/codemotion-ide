export function renderSwitch(properties = {}) {
    const id = properties.id;
    const title = properties.title;
    const description = properties.description;
    const checked = properties.checked;

    const wrapper = document.createElement("div");
    wrapper.classList.add("modal-category__item");

    const element = document.createElement("label");
    element.classList.add("round-switch");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;

    if (checked) input.checked = checked;

    const span = document.createElement("span");
    span.classList.add("slider");

    const elementTitle = document.createElement("div");
    elementTitle.classList.add("modal-category__item-title");
    elementTitle.textContent = title;

    const elementDesc = document.createElement("div");
    elementDesc.classList.add("modal-category__item-desc");
    elementDesc.textContent = description;

    element.appendChild(input);
    element.appendChild(span);

    wrapper.appendChild(elementTitle);
    wrapper.appendChild(elementDesc);
    wrapper.appendChild(element);

    return wrapper;
}
