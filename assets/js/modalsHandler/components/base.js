import { showBackdrop, hideBackdrop } from "../engine.js"
import { sideBarHandler } from "../handlers/sidebarHandler.js"
import { defaultContentHandler } from "../handlers/contentHandler.js"

export function renderModalBase(options = {}) {
    const id = options.id
    const isHiddenOnSpawn = options.isHiddenOnSpawn
    const modalClassList = options.modalClassList
    const title = options.title
    const titleAvatar = options.titleAvatar
    const pages = options.pages
    const size = options.size

    const modalWrapper = document.createElement("div")
    modalWrapper.id = id
    modalWrapper.classList.add("modal-wrapper", isHiddenOnSpawn ? "hidden" : "")

    const modal = document.createElement("div")
    modal.classList.add("modal", size)

    const modalBody = document.createElement("div")
    modalBody.classList.add("modal-body")

    const modalHeader = document.createElement("div")
    modalHeader.classList.add("modal-header")

    const modalHeaderCloseBtn = document.createElement("div")
    modalHeaderCloseBtn.classList.add("modal-header__close")

    const modalHeaderCloseBtnIcon = document.createElement("span")
    modalHeaderCloseBtnIcon.textContent = "close"
    modalHeaderCloseBtnIcon.classList.add("material-symbols-rounded")

    if(!title) {
        modalHeader.classList.add("no-title")
    }
    else if(pages.length > 0) {
        modalHeader.classList.add("no-title")
    }
    else {
        const modalTitle = document.createElement("div")
        modalTitle.classList.add("modal-header__title")
        modalTitle.textContent = title

        modalHeader.appendChild(modalTitle)
    }

    if(modalClassList.length > 0) modal.classList.add(...modalClassList)

    modalHeaderCloseBtn.appendChild(modalHeaderCloseBtnIcon)

    modalHeader.appendChild(modalHeaderCloseBtn)
    modalWrapper.appendChild(modal)

    modal.appendChild(modalHeader)
    modal.appendChild(modalBody)

    // events
    modalHeaderCloseBtn.addEventListener("click", () => {
        modalWrapper.classList.add("hidden")
        hideBackdrop()
    })
    modalWrapper.addEventListener("click", (event) => {
        if (event.target !== modalWrapper) return

        modalWrapper.classList.add("hidden")
        hideBackdrop()
    })

    if(typeof pages == "object" && pages.length > 0) {
        sideBarHandler(pages, {
            body: modalBody,
            title: title,
            titleAvatar: titleAvatar
        })
    }
    else if("content" in options) {
        defaultContentHandler(modalBody, options.content)
    }

    return {
        wrapper: modalWrapper,
        body: modalBody,
        header: modalHeader
    }
}