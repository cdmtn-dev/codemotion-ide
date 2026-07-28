export class ErrorReporter {
    static fromAcorn(error) {
        return {
            type: "syntax",
            message: error.message,
            line: error.loc?.line ?? null,
            column: error.loc?.column ?? null,
        };
    }

    static fromRuntime(error) {
        let line = null;
        let column = null;

        const match = error.stack?.match(/<anonymous>:(\d+):(\d+)/);

        if (match) {
            line = Number(match[1]);
            column = Number(match[2]);
        }

        return {
            type: "runtime",
            message: error.message,
            line,
            column,
        };
    }
}
