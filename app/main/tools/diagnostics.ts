import { type IpcMainInvokeEvent, ipcMain } from "electron";
import path from "path";
import { Worker } from "worker_threads";

type DiagnosticResult = unknown[];
type DiagnosticLanguage = "js" | "jsx" | "ts" | "tsx" | "dts";

type WorkerKey = "js" | "ts";

type WorkerMap = Record<WorkerKey, Worker>;
type PendingMap = Record<WorkerKey, Map<number, (value: DiagnosticResult) => void>>;
type WorkerResponse = { id?: number; diagnostics?: DiagnosticResult };

let nextRequestId = 0;

function normalizeLanguage(language: unknown, fallback: DiagnosticLanguage): DiagnosticLanguage {
    const normalized = String(language || "")
        .trim()
        .toLowerCase()
        .replace(/^\./, "");
    if (["js", "jsx", "ts", "tsx", "dts"].includes(normalized)) {
        return normalized as DiagnosticLanguage;
    }
    if (["mjs", "cjs", "es6"].includes(normalized)) return "js";
    if (["mts", "cts"].includes(normalized)) return "ts";
    return fallback;
}

function createWorker(): Worker {
    return new Worker(path.join(__dirname, "js-ts/diagnosticWorker.js"));
}

const workers: WorkerMap = {
    js: createWorker(),
    ts: createWorker(),
};

const pending: PendingMap = {
    js: new Map(),
    ts: new Map(),
};

function resolvePending(
    workerKey: WorkerKey,
    id: number | undefined,
    diagnostics: DiagnosticResult,
) {
    if (id === undefined) return;
    const resolve = pending[workerKey].get(id);
    if (!resolve) return;

    pending[workerKey].delete(id);
    resolve(diagnostics);
}

function rejectAllPending(workerKey: WorkerKey) {
    for (const resolve of pending[workerKey].values()) resolve([]);
    pending[workerKey].clear();
}

for (const workerKey of ["js", "ts"] as const) {
    workers[workerKey].on("message", (response: WorkerResponse) => {
        resolvePending(workerKey, response?.id, response?.diagnostics || []);
    });

    workers[workerKey].on("error", (error: Error) => {
        console.error(`${workerKey.toUpperCase()} diagnostics worker error:`, error);
        rejectAllPending(workerKey);
    });

    workers[workerKey].on("exit", (code: number) => {
        if (code !== 0)
            console.error(`${workerKey.toUpperCase()} diagnostics worker exited with code ${code}`);
        rejectAllPending(workerKey);
    });
}

function requestDiagnostics(
    workerKey: WorkerKey,
    code: string,
    lang: DiagnosticLanguage,
): Promise<DiagnosticResult> {
    const id = ++nextRequestId;

    return new Promise((resolve) => {
        pending[workerKey].set(id, resolve);
        workers[workerKey].postMessage({ id, code, lang });
    });
}

ipcMain.handle(
    "javascript-diagnostic",
    (_event: IpcMainInvokeEvent, code: string, language?: unknown): Promise<DiagnosticResult> => {
        const lang = normalizeLanguage(language, "js");
        return requestDiagnostics("js", code, lang);
    },
);

ipcMain.handle(
    "typescript-diagnostic",
    (_event: IpcMainInvokeEvent, code: string, language?: unknown): Promise<DiagnosticResult> => {
        const lang = normalizeLanguage(language, "ts");
        return requestDiagnostics("ts", code, lang);
    },
);
