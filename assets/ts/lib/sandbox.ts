import { ErrorReporter } from "../../js/ErrorReporter.js";

export interface SandboxLog {
    type: "log" | "warn" | "error";
    line?: number;
    col?: number;
    args: unknown[];
}

/** Executes code with a captured console and returns its emitted records. */
export function runSandbox(code: string): SandboxLog[] {
    const logs: SandboxLog[] = [];
    const getPosition = () => {
        const stack = new Error().stack?.split("\n")[3] ?? "";
        const match = stack.match(/:(\d+):(\d+)/);
        return match ? { line: Number(match[1]), col: Number(match[2]) } : {};
    };
    const formatArgs = (args: unknown[]) =>
        args.map((arg) => {
            if (typeof arg !== "object" || arg === null) return arg;
            try {
                return JSON.stringify(arg);
            } catch {
                return "[Object]";
            }
        });
    const capture =
        (type: SandboxLog["type"]) =>
        (...args: unknown[]) =>
            logs.push({ type, ...getPosition(), args: formatArgs(args) });
    const consoleProxy = { log: capture("log"), warn: capture("warn"), error: capture("error") };
    try {
        const execute = new Function("console", code + "\n//# sourceURL=sandbox.js");
        execute(consoleProxy);
    } catch (error) {
        logs.push({
            type: "error",
            args: [error instanceof Error ? error.message : String(error)],
        });
    }
    return logs;
}

interface Parser {
    parse(code: string, options: Record<string, unknown>): unknown;
}

/** Performs the syntax and runtime checks expected by the editor. */
export function runCode(code: string, parser: Parser): unknown {
    try {
        parser.parse(code, { ecmaVersion: "latest", locations: true, sourceType: "module" });
    } catch (error) {
        return ErrorReporter.fromAcorn(error);
    }
    try {
        runSandbox(code);
    } catch (error) {
        return ErrorReporter.fromRuntime(error);
    }
    return null;
}
