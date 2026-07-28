export interface SandboxLog {
    type: "log" | "warn" | "error";
    line?: number;
    col?: number;
    args: unknown[];
}
/** Executes code with a captured console and returns its emitted records. */
export declare function runSandbox(code: string): SandboxLog[];
interface Parser {
    parse(code: string, options: Record<string, unknown>): unknown;
}
/** Performs the syntax and runtime checks expected by the editor. */
export declare function runCode(code: string, parser: Parser): unknown;
export {};
