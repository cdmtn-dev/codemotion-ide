export class _Task {
    constructor(name) {
        this.name = name

        this.el = document.querySelector(".code-taskprogress")
        this.finishHideTimer = 5000

        this.titleEl = this.el.querySelector(".code-taskprogress_name")
        this.descEl = this.el.querySelector(".code-taskprogress_description")
    }

    show() {
        this.el.classList.remove("hidden")
    }
    hide() {
        this.el.classList.add("hidden")
    }

    title(value, isHTML = false) {
        if(isHTML) this.titleEl.innerHTML = value
        else this.titleEl.textContent = value
    }
    description(value, isHTML = false) {
        if(isHTML) this.descEl.innerHTML = value
        else this.descEl.textContent = value
    }

    finish(properties = {}) {
        const hideTimer = "hideTimer" in properties ? properties.hideTimer : this.finishHideTimer

        this.el.classList.add("finished")

        setTimeout(() => {
            this.hide()
        }, hideTimer)
    }

    buttons(buttons) {
        if(typeof buttons == "object" && Array.isArray(buttons)) {
            const wrapper = document.createElement("div")
            wrapper.classList.add("code-taskprogress_buttons")

            buttons.forEach(b => {
                const types = [
                    "primary",
                    "secondary"
                ]

                const text = "text" in b ? b.text : "Unnamed"
                const type = "type" in b ? b.type : "primary"
                const action = "action" in b ? b.action : () => {}

                const buttonEl = document.createElement("button")
                buttonEl.textContent = text
                
                if(types.includes(type)) buttonEl.classList.add(type)

                if(typeof action == "function") {
                    buttonEl.onclick = () => {
                        action()
                    }
                }

                wrapper.appendChild(buttonEl)
            })

            this.el.appendChild(wrapper)
        }
    }
}