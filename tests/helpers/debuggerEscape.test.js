import { describe, expect, it } from "vitest";

function escapePs(filePath) {
    return filePath.replace(/'/g, "''");
}

function escapeOsa(filePath) {
    return filePath
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\$/g, "\\$")
        .replace(/`/g, "\\`");
}

function escapeUrl(filePath) {
    return (
        "file://" +
        filePath
            .replace(/\\/g, "/")
            .replace(/[^a-zA-Z0-9-._~:/?#[\]@!'()*+,;=%]/g, encodeURIComponent)
    );
}

describe("debugger copy-as-file escaping", () => {
    const normalPath = "/tmp/Debugger-cdmtn-20260723_143022.txt";

    describe("PowerShell escaping", () => {
        it("handles normal path", () => {
            expect(escapePs(normalPath)).toBe(normalPath);
        });

        it("escapes single quotes", () => {
            expect(escapePs("/tmp/test'file.txt")).toBe("/tmp/test''file.txt");
        });

        it("escapes multiple single quotes", () => {
            expect(escapePs("it's a 'file'.txt")).toBe("it''s a ''file''.txt");
        });

        it("leaves double quotes alone", () => {
            expect(escapePs('/tmp/test"file.txt')).toBe('/tmp/test"file.txt');
        });
    });

    describe("osascript escaping", () => {
        it("handles normal path", () => {
            expect(escapeOsa(normalPath)).toBe(normalPath);
        });

        it("escapes double quotes", () => {
            expect(escapeOsa('/tmp/test"file.txt')).toBe('/tmp/test\\"file.txt');
        });

        it("escapes backslashes", () => {
            expect(escapeOsa("C:\\Users\\test\\file.txt")).toBe("C:\\\\Users\\\\test\\\\file.txt");
        });

        it("escapes both backslashes and double quotes", () => {
            expect(escapeOsa('C:\\Users\\test"file.txt')).toBe('C:\\\\Users\\\\test\\"file.txt');
        });

        it("blocks $(cmd) injection", () => {
            const injected = "/tmp/$(rm -rf /)/file.txt";
            const escaped = escapeOsa(injected);
            expect(escaped).toContain("\\$(");
        });

        it("blocks backtick injection", () => {
            const injected = "/tmp/`whoami`/file.txt";
            const escaped = escapeOsa(injected);
            expect(escaped).toContain("\\`whoami\\`");
        });
    });

    describe("URL escaping", () => {
        it("handles normal path", () => {
            expect(escapeUrl(normalPath)).toBe("file://" + normalPath);
        });

        it("encodes spaces", () => {
            expect(escapeUrl("/tmp/my file.txt")).toBe("file:///tmp/my%20file.txt");
        });

        it("encodes special characters", () => {
            expect(escapeUrl("/tmp/test&file.txt")).toBe("file:///tmp/test%26file.txt");
        });

        it("encodes shell metacharacters", () => {
            const injected = "/tmp/$(rm -rf /)/file.txt";
            const escaped = escapeUrl(injected);
            expect(escaped).toContain("%24(");
        });

        it("encodes backticks", () => {
            const escaped = escapeUrl("/tmp/`whoami`/file.txt");
            expect(escaped).not.toContain("`");
            expect(escaped).toContain("%60");
        });

        it("converts Windows backslashes to forward slashes", () => {
            expect(escapeUrl("C:\\Users\\test\\file.txt")).toBe("file://C:/Users/test/file.txt");
        });
    });
});
