import { createDIV, createSpan } from "../handlers/helpers.js"

export function renderInput(properties = {}) {
    const id = properties.id
    const title = properties.title
    const description = properties.description
    const placeholder = properties.placeholder
    const prefix = properties.prefix
    const inputType = properties.inputType

    const wrapper = document.createElement("div")
    wrapper.classList.add("modal-category__item")

    const elementTitle = document.createElement("div")
    elementTitle.classList.add("modal-category__item-title")
    elementTitle.textContent = title

    const elementDesc = document.createElement("div")
    elementDesc.classList.add("modal-category__item-desc")
    elementDesc.textContent = description

    const inputWrapper = createDIV()
    inputWrapper.classList.add("form-element")

    const input = document.createElement("input")
    input.type = inputType ? inputType : "text"
    input.spellcheck = "false"
    input.id = id

    if(prefix) {
        input.classList.add("focused")
        input.value = prefix
    }

    const inputName = createSpan()
    inputName.classList.add("form-label")
    inputName.textContent = placeholder

    inputWrapper.appendChild(input)
    inputWrapper.appendChild(inputName)

    if(title) wrapper.appendChild(elementTitle)
    if(description) wrapper.appendChild(elementDesc)
    if(!placeholder) inputName.textContent = title

    wrapper.appendChild(inputWrapper)

    input.addEventListener("input", (e) => {
        if(prefix) {
            if (!e.target.value.startsWith(prefix)) {
                e.target.value = prefix;
            }

            input.classList.toggle(
                "focused",
                input.value.length > prefix.length
            );
        }
        else {
            input.classList.toggle(
                "focused",
                input.value.length > 0
            ); 
        }
    });

    return wrapper
}