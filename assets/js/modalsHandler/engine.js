import { renderModalBase } from "./components/base.js"

const backdrop = document.createElement("div")
backdrop.classList.add("backdrop", "hidden")

document.body.prepend(backdrop)

// function for object validation inside Modal class
export function valid(obj) {
    if (obj === undefined || obj === null || obj === false) return undefined

    if (Array.isArray(obj) && obj.length === 0) return undefined

    if (
        typeof obj === "object" &&
        !Array.isArray(obj) &&
        Object.keys(obj).length === 0
    ) return undefined

    return obj
}
// for arrays
export function validArray(obj) {
    if(valid(obj) == undefined) return undefined
    if(typeof obj == "object" && !Array.isArray(obj)) return Object.keys(obj)
    if(typeof obj != "object") return undefined

    return obj
}
// for urls
export function validHTTPS(url) {
    if(!url) return undefined
    if(!url.startsWith("https://")) return undefined

    return url
}
// for booleans
export function validBool(boolean) {
    if(typeof boolean == "boolean") return boolean
    else return undefined
}
// for objects
export function validObject(object) {
    if(object !== null && typeof object === 'object' && !Array.isArray(object)) {
        return object
    }
    else {
        return undefined
    }
}

export function err(text) {
    throw new Error(`[CodeMotion.Modals] ${text}`)
}
export function showBackdrop() {
    backdrop.classList.remove("hidden")
}
export function hideBackdrop() {
    backdrop.classList.add("hidden")
}

const INPUT_EVENT_OPTS = { bubbles: true }

export class Modal {
    static list = {}

    static create(config = {}) {
        if (!config) err("Modal config can't be empty")

        const id = valid(config.id) ?? crypto.randomUUID().replaceAll("-", "")

        if (Modal.list[id]) {
            const existingModal = Modal.list[id]

            if (valid(config.content)) {
                existingModal.setContent(config.content)
            }

            if (valid(config.title)) {
                existingModal.setTitle(config.title)
            }

            return existingModal
        }

        const name = valid(config.name) ?? "Untitled"
        const isHiddenOnSpawn = valid(config.show) ?? true
        const modalClassList = validArray(config.modalClassList) ?? []
        let title = valid(config.title) ?? false
        const titleAvatar = valid(config.titleAvatar) ?? false
        const pages = valid(config.pages) ?? {}
        const content = valid(config.content) ?? {}
        const size = valid(config.size) ?? "default"

        let modalBase = null
        let wrapper = null
        let body = null
        let contentEl = null
        let titleEl = null
        let sidebarPages = null
        let sidebarIsBody = false
        let pendingZIndex = null
        let pendingContent = null
        let pendingTitleText = null
        let openListeners = []

        function build() {
            if (modalBase) return modalBase

            modalBase = renderModalBase({
                id: id,
                isHiddenOnSpawn: isHiddenOnSpawn,
                modalClassList: modalClassList,
                title: title,
                titleAvatar: titleAvatar,
                pages: pages,
                content: content,
                size: size
            })

            wrapper = modalBase.wrapper
            body = modalBase.body

            sidebarIsBody = body.classList.contains("modal-body-sidebar")
            if (sidebarIsBody) {
                sidebarPages = body.querySelectorAll(".modal-body__sidebar-content")
            }

            contentEl = wrapper.querySelector(".modal-content")
            titleEl = wrapper.querySelector(".modal-title")

            if (pendingZIndex !== null) {
                wrapper.style.zIndex = pendingZIndex
            }

            if (pendingContent !== null) {
                applyContent(pendingContent)
                pendingContent = null
            }
            if (pendingTitleText !== null) {
                applyTitle(pendingTitleText)
                pendingTitleText = null
            }

            return modalBase
        }

        function applyContent(newContent) {
            if (!contentEl) return

            if (typeof newContent === "string") {
                contentEl.innerHTML = newContent
            }
            else if (newContent instanceof HTMLElement) {
                contentEl.innerHTML = ''
                contentEl.appendChild(newContent)
            }
        }

        function applyTitle(newTitle) {
            if (!titleEl) return

            titleEl.textContent = newTitle
        }

        function mount() {
            build()

            if (!wrapper.isConnected) {
                document.body.prepend(wrapper)
            }
        }

        function activate() {
            mount()

            requestAnimationFrame(() => { 
                wrapper.classList.remove("hidden")
                showBackdrop()
            })

            if (openListeners.length) {
                const listeners = openListeners.slice()
                listeners.forEach(l => l.callback(api))
                openListeners = openListeners.filter(l => !l.once)
            }
        }

        const api = {
            id: id,

            get el() {
                build()
                return wrapper
            },

            preRender: () => {
                mount()
            },

            bind: (el) => {
                function bindClick(el) {
                    el.addEventListener("click", () => {
                        activate()
                    })
                }

                if (el instanceof NodeList) {
                    el.forEach(e => {
                        bindClick(e)
                    })
                }
                else if (el instanceof HTMLElement) {
                    bindClick(el)
                }
            },

            zIndex(value) {
                if(Number.isInteger(value)) {
                    if (modalBase) {
                        wrapper.style.zIndex = value
                    } else {
                        pendingZIndex = value
                    }
                }
            },

            open: () => {
                activate()
            },

            onOpen: (callback, options = {}) => {
                if (typeof callback !== "function") return () => {}

                const once = validBool(options.once) ?? false
                const listener = { callback, once }

                openListeners.push(listener)

                return () => {
                    openListeners = openListeners.filter(l => l !== listener)
                }
            },

            close: () => {
                if (!modalBase) return

                hideBackdrop()
                wrapper.classList.add("hidden")
            },

            destroy: () => {
                if (modalBase) {
                    wrapper.remove()
                }

                modalBase = null
                wrapper = null
                body = null
                contentEl = null
                titleEl = null
                sidebarPages = null
                openListeners = []

                delete Modal.list[id]
            },

            isSidebar: () => {
                build()
                return sidebarIsBody
            },

            disableCurrent() {
                build()
                if (sidebarIsBody) {
                    sidebarPages.forEach(p => {
                        if(!p.classList.contains("hidden")) p.classList.add("disabled")
                    })
                }
            },
            unDisableCurrent() {
                build()
                if (sidebarIsBody) {
                    sidebarPages.forEach(p => {
                        if(!p.classList.contains("hidden")) p.classList.remove("disabled")
                    })
                }
            },

            pageShow: (pageIndex) => {
                build()
                if (sidebarIsBody) {
                    sidebarPages.forEach((page, index) => {
                        const pageid = page.id.split("_content")[0]

                        if (index == pageIndex) {
                            sidebarPages.forEach(p => p.classList.add("hidden"))
                            page.classList.remove("hidden")

                            const pageSidebarBtn = wrapper.querySelector(`[id="${pageid}"]`)

                            if (pageSidebarBtn) {
                                wrapper.querySelectorAll(".modal-sidebar__item")
                                    .forEach(i => i.classList.remove("active"))

                                pageSidebarBtn.classList.add("active")
                            }
                        }
                    })
                }
            },

            clear: () => {
                if (!modalBase) return

                body.querySelectorAll("input").forEach(i => {
                    i.value = ''
                    i.dispatchEvent(new Event("input", INPUT_EVENT_OPTS))
                })
            },

            setContent: (newContent) => {
                if (!modalBase) {
                    pendingContent = newContent
                    return
                }

                applyContent(newContent)
            },

            setTitle: (newTitle) => {
                if (!modalBase) {
                    pendingTitleText = newTitle
                    return
                }

                applyTitle(newTitle)
            }
        }

        Modal.list[id] = api

        return api
    }

    static get(id) {
        return Modal.list[id] ?? null
    }

    static destroy(id) {
        const modal = Modal.list[id]

        if (!modal) return

        modal.destroy()
    }

    static closeAll() {
        Object.values(Modal.list).forEach(modal => {
            modal.close()
        })
    }
}