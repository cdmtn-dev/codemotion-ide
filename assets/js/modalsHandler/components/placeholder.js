import { createDIV, createLink, createSpan } from "../handlers/helpers.js"
import { renderBadge } from "./badge.js"

export function renderPlaceholder(properties = {}) {
    const id = properties.id
    const title = properties.title
    const description = properties.description
    const titleBadge = properties.titleBadge
    const link = properties.link

    const wrapper = document.createElement("div")
    wrapper.classList.add("modal-category__item")
    wrapper.id = id

    const elementTitle = document.createElement("div")
    elementTitle.classList.add("modal-category__item-title")
    elementTitle.textContent = title

    const elementDesc = document.createElement("div")
    elementDesc.classList.add("modal-category__item-desc")
    elementDesc.textContent = description

    if(title) wrapper.appendChild(elementTitle)
    if(description) wrapper.appendChild(elementDesc)

    if(titleBadge) {
        const badgeEl = renderBadge(
            {
                type: titleBadge
            }
        )

        elementTitle.appendChild(badgeEl)
    }

    if(link) {
        const url = link.startsWith("https") ? new URL(link) : new URL(`https://${link}`)

        const linkEl = createLink(url.href)
        linkEl.textContent = url.host

        wrapper.appendChild(linkEl)
    }

    return wrapper
}