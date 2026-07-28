import { BottomWindow } from "../handlers/BottomWindowHandler.js";
import { formatUnix } from "./format.js";

interface RuntimeErrorProperties {
    msg?: string;
    line?: number | null;
    col?: number | null;
    time?: number | null;
    isNull?: boolean;
    win?: unknown;
}

interface RuntimeError {
    msg?: string;
    line: number | null;
    col: number | null;
}

let runtimeErrors: RuntimeError[] = [];
let runtimeErrorsCount = 0;

/** Adds a unique runtime result to the errors history window. */
export function addRuntimeError({
    msg,
    line = null,
    col = null,
    time = null,
    isNull = false,
}: RuntimeErrorProperties): void {
    const exists = runtimeErrors.some(
        (error) => error.msg === msg && error.line === line && error.col === col,
    );
    const wrapper = BottomWindow.get("errorsHistory");
    const badge = document.querySelector<HTMLElement>("#runtimeErrors .badge");
    const items = document.querySelectorAll<HTMLElement>(".runtime-item#runTimeErrorItem");
    const lastItem = items[items.length - 1];
    if ((isNull && lastItem?.classList.contains("success")) || exists || !(wrapper && badge))
        return;
    const element = document.createElement("div");
    if (isNull) {
        runtimeErrors = [];
        badge.classList.add("hidden");
    } else {
        runtimeErrors.push({ msg, line, col });
        runtimeErrorsCount += 1;
    }
    badge.classList.toggle("hidden", runtimeErrors.length === 0);
    badge.textContent = String(runtimeErrors.length);
    items.forEach((item) => item.classList.add("prev"));
    element.classList.add("runtime-item", "bottom-window__item");
    element.id = "runTimeErrorItem";
    if (isNull) {
        element.classList.add("success");
        element.innerHTML = `
            <span class="material-symbols-rounded error">check_circle</span>
            All errors fixed
            ${runtimeErrorsCount > 0 ? `<span class="translucent">(${runtimeErrorsCount})</span>` : ""}
            ${time === null ? "" : `<span class="time">${formatUnix(time)}</span>`}
        `;
        runtimeErrorsCount = 0;
    } else {
        element.innerHTML = `
            <span class="material-symbols-rounded error">error</span>
            ${msg}
            ${line === null ? "" : `<span class="translucent">${line}:${col ?? 0}</span>`}
            ${time === null ? "" : `<span class="time">${formatUnix(time)}</span>`}
        `;
    }
    wrapper.add(element);
    wrapper.win.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
}

/** Clears runtime errors and records a successful check result. */
export function clearRuntimeErrors(): void {
    runtimeErrors = [];
    runtimeErrorsCount = 0;
    addRuntimeError({ isNull: true, time: Math.floor(Date.now() / 1000) });
}
