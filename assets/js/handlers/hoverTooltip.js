const SUPPORTED_EXTENSIONS = ["js", "jsx", "mjs", "cjs", "es6", "ts", "tsx", "mts", "cts"]
const HOVER_DELAY = 300

function fileExtension(path) {
    const match = String(path || "").toLowerCase().match(/\.([^.\\/]+)$/)
    return match ? match[1] : ""
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
}

const SIGNATURE_KIND_CLASS = {
    keyword: "tt-keyword",
    aliasName: "tt-type",
    interfaceName: "tt-type",
    className: "tt-type",
    enumName: "tt-type",
    typeParameterName: "tt-type",
    typeAliasName: "tt-type",
    functionName: "tt-function",
    methodName: "tt-function",
    parameterName: "tt-param",
    propertyName: "tt-property",
    localName: "tt-property",
    stringLiteral: "tt-string",
    numericLiteral: "tt-number",
    operator: "tt-operator",
}

function renderSignature(parts, fallback) {
    if (!parts || !parts.length) return escapeHtml(fallback || "")

    return parts.map(part => {
        if (part.kind === "lineBreak") return "<br>"
        const text = escapeHtml(part.text)
        const cls = SIGNATURE_KIND_CLASS[part.kind]
        return cls ? `<span class="${cls}">${text}</span>` : text
    }).join("")
}

export function initHoverTooltip({ editor, path }) {
    if (!editor?.instance || !window.electron?.tsQuickInfo) return
    if (!SUPPORTED_EXTENSIONS.includes(fileExtension(path))) return

    const view = editor.instance
    const scroller = view.scrollDOM

    const tooltip = document.createElement("div")
    tooltip.className = "hover-tooltip hidden"
    document.body.appendChild(tooltip)

    let hoverTimer = null
    let hideTimer = null
    let requestToken = 0
    let currentPos = -1
    let lastX = 0
    let lastY = 0
    let overTooltip = false

    function hide() {
        currentPos = -1
        requestToken++
        overTooltip = false
        clearTimeout(hideTimer)
        tooltip.classList.add("hidden")
    }

    function scheduleHide() {
        clearTimeout(hideTimer)
        hideTimer = setTimeout(() => {
            if (!overTooltip) hide()
        }, 150)
    }

    function cancelHide() {
        clearTimeout(hideTimer)
    }

    function position() {
        const margin = 8
        const rect = tooltip.getBoundingClientRect()

        let x = lastX + 12
        let y = lastY + 16

        if (x + rect.width + margin > window.innerWidth) x = window.innerWidth - rect.width - margin
        if (y + rect.height + margin > window.innerHeight) y = lastY - rect.height - 10
        if (x < margin) x = margin
        if (y < margin) y = margin

        tooltip.style.left = `${x}px`
        tooltip.style.top = `${y}px`
    }

    function renderInfo(info) {
        const hasMembers = info?.members && info.members.length
        if (!info || (!info.signature && !hasMembers)) {
            hide()
            return
        }

        const parts = []

        if (info.signature || (info.signatureParts && info.signatureParts.length)) {
            parts.push(`<div class="hover-tooltip__signature">${renderSignature(info.signatureParts, info.signature)}</div>`)
        }

        if (hasMembers) {
            const rows = info.members.map(member => {
                const name = escapeHtml(member.name) + (member.optional ? "?" : "")
                const type = escapeHtml(member.type)
                return `<div class="hover-tooltip__member"><span class="hover-tooltip__key">${name}</span><span class="hover-tooltip__sep">: </span><span class="hover-tooltip__type">${type}</span></div>`
            }).join("")
            parts.push(`<div class="hover-tooltip__members">${rows}</div>`)
        }

        if (info.documentation) {
            parts.push(`<div class="hover-tooltip__doc">${escapeHtml(info.documentation)}</div>`)
        }

        tooltip.innerHTML = parts.join("")
        tooltip.classList.remove("hidden")
        position()
    }

    async function query() {
        if (overTooltip) return

        const pos = view.posAtCoords({ x: lastX, y: lastY })
        if (pos == null) {
            hide()
            return
        }
        if (pos === currentPos && !tooltip.classList.contains("hidden")) return

        const token = ++requestToken
        try {
            const info = await window.electron.tsQuickInfo(editor.getValue(), path, pos)
            if (token !== requestToken) return
            currentPos = pos
            renderInfo(info)
        } catch (_) {
            hide()
        }
    }

    function onMove(event) {
        cancelHide()
        lastX = event.clientX
        lastY = event.clientY
        clearTimeout(hoverTimer)
        hoverTimer = setTimeout(query, HOVER_DELAY)
    }

    function onLeave() {
        clearTimeout(hoverTimer)
        scheduleHide()
    }

    function onTooltipEnter() {
        overTooltip = true
        clearTimeout(hoverTimer)
        cancelHide()
    }

    function onTooltipLeave() {
        overTooltip = false
        scheduleHide()
    }

    scroller.addEventListener("mousemove", onMove)
    scroller.addEventListener("mouseleave", onLeave)
    scroller.addEventListener("scroll", hide, true)
    view.dom.addEventListener("keydown", hide)
    tooltip.addEventListener("mouseenter", onTooltipEnter)
    tooltip.addEventListener("mouseleave", onTooltipLeave)

    editor.onDestroy(() => {
        clearTimeout(hoverTimer)
        clearTimeout(hideTimer)
        scroller.removeEventListener("mousemove", onMove)
        scroller.removeEventListener("mouseleave", onLeave)
        scroller.removeEventListener("scroll", hide, true)
        view.dom.removeEventListener("keydown", hide)
        tooltip.removeEventListener("mouseenter", onTooltipEnter)
        tooltip.removeEventListener("mouseleave", onTooltipLeave)
        tooltip.remove()
    })
}
