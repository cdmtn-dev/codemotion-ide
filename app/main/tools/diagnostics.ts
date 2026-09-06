import { ipcMain, IpcMainInvokeEvent } from "electron"
import { Worker } from "worker_threads"
import path from "path"

type DiagnosticResult = unknown[]
type DiagnosticLanguage = "js" | "jsx" | "ts" | "tsx" | "dts"
type WorkerKey = "js" | "ts" | "typecheck"

type WorkerMap = Record<WorkerKey, Worker>
type PendingMap = Record<WorkerKey, Map<number, (value: unknown) => void>>
type WorkerResponse = { id?: number, diagnostics?: DiagnosticResult, quickInfo?: unknown, unused?: unknown }

let nextRequestId = 0

function normalizeLanguage(language: unknown, fallback: DiagnosticLanguage): DiagnosticLanguage {
    const normalized = String(language || "").trim().toLowerCase().replace(/^\./, "")
    if (["js", "jsx", "ts", "tsx", "dts"].includes(normalized)) {
        return normalized as DiagnosticLanguage
    }
    if (["mjs", "cjs", "es6"].includes(normalized)) return "js"
    if (["mts", "cts"].includes(normalized)) return "ts"
    return fallback
}

function createWorker(fileName: string): Worker {
    return new Worker(path.join(__dirname, "js-ts", fileName))
}

const workerFiles: Record<WorkerKey, string> = {
    js: "diagnosticWorker.js",
    ts: "diagnosticWorker.js",
    typecheck: "typeCheckWorker.js",
}

const workers: Partial<Record<WorkerKey, Worker>> = {}

const pending: PendingMap = {
    js: new Map(),
    ts: new Map(),
    typecheck: new Map(),
}

function resolvePending(workerKey: WorkerKey, id: number | undefined, value: unknown) {
    if (id === undefined) return
    const resolve = pending[workerKey].get(id)
    if (!resolve) return
    pending[workerKey].delete(id)
    resolve(value)
}

function rejectAllPending(workerKey: WorkerKey) {
    for (const resolve of pending[workerKey].values()) resolve([])
    pending[workerKey].clear()
}

function getWorker(workerKey: WorkerKey): Worker {
    const existing = workers[workerKey]
    if (existing) return existing

    const worker = createWorker(workerFiles[workerKey])
    workers[workerKey] = worker

    worker.on("message", (response: WorkerResponse) => {
        let value: unknown = response?.diagnostics || []
        if ("quickInfo" in response) value = response.quickInfo
        else if ("unused" in response) value = response.unused
        resolvePending(workerKey, response?.id, value)
    })
    worker.on("error", (error: Error) => {
        console.error(`${workerKey} diagnostics worker error:`, error)
        rejectAllPending(workerKey)
        workers[workerKey] = undefined
    })
    worker.on("exit", (code: number) => {
        if (code !== 0) console.error(`${workerKey} diagnostics worker exited with code ${code}`)
        rejectAllPending(workerKey)
        workers[workerKey] = undefined
    })

    return worker
}

function requestDiagnostics(workerKey: "js" | "ts", code: string, lang: DiagnosticLanguage): Promise<DiagnosticResult> {
    const id = ++nextRequestId
    return new Promise(resolve => {
        pending[workerKey].set(id, resolve as (value: unknown) => void)
        getWorker(workerKey).postMessage({ id, code, lang })
    })
}

function requestTypeCheck(fileName: string, code: string): Promise<DiagnosticResult> {
    const id = ++nextRequestId
    return new Promise(resolve => {
        pending.typecheck.set(id, resolve as (value: unknown) => void)
        getWorker("typecheck").postMessage({ id, fileName, code })
    })
}

function requestQuickInfo(fileName: string, code: string, offset: number): Promise<unknown> {
    const id = ++nextRequestId
    return new Promise(resolve => {
        pending.typecheck.set(id, resolve)
        getWorker("typecheck").postMessage({ id, op: "quickInfo", fileName, code, offset })
    })
}

function requestUnused(fileName: string, code: string): Promise<unknown> {
    const id = ++nextRequestId
    return new Promise(resolve => {
        pending.typecheck.set(id, resolve)
        getWorker("typecheck").postMessage({ id, op: "unused", fileName, code })
    })
}

ipcMain.handle(
    "javascript-diagnostic",
    (_event: IpcMainInvokeEvent, code: string, language?: unknown): Promise<DiagnosticResult> => {
        const lang = normalizeLanguage(language, "js")
        return requestDiagnostics("js", code, lang)
    }
)

ipcMain.handle(
    "typescript-diagnostic",
    (_event: IpcMainInvokeEvent, code: string, language?: unknown): Promise<DiagnosticResult> => {
        const lang = normalizeLanguage(language, "ts")
        return requestDiagnostics("ts", code, lang)
    }
)

ipcMain.handle(
    "ts-type-check",
    (_event: IpcMainInvokeEvent, code: string, filePath: string): Promise<DiagnosticResult> => {
        return requestTypeCheck(filePath, code)
    }
)

ipcMain.handle(
    "ts-quick-info",
    (_event: IpcMainInvokeEvent, code: string, filePath: string, offset: number): Promise<unknown> => {
        return requestQuickInfo(filePath, code, offset)
    }
)

ipcMain.handle(
    "ts-unused",
    (_event: IpcMainInvokeEvent, code: string, filePath: string): Promise<unknown> => {
        return requestUnused(filePath, code)
    }
)