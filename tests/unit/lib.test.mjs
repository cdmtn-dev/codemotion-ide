import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function importModule(path) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

const encoding = await importModule("../../assets/js/lib/encoding.js");
const format = await importModule("../../assets/js/lib/format.js");
const text = await importModule("../../assets/js/lib/text.js");
const values = await importModule("../../assets/js/lib/values.js");

test("text helpers preserve legacy output", () => {
    assert.equal(text.escapeHtml(`<a href="'">&`), "&lt;a href=&quot;&#039;&quot;&gt;&amp;");
    assert.equal(text.capitilize("hello"), "Hello");
    assert.equal(text.getInitials("Ada Lovelace Byron"), "AL");
    assert.equal(text.getInitials(""), "A");
    assert.equal(text.truncateString("abcdef", 3), "abc...");
    assert.deepEqual(text.splitCamelCase("helloWorldAgain"), ["Hello", "world", "again"]);
    assert.equal(text.dedent("\n    first\n      second"), "first\n  second");
});

test("encoding and format helpers preserve legacy contracts", () => {
    assert.equal(encoding.toBase64("Привет"), "0J/RgNC40LLQtdGC");
    assert.equal(encoding.idify("test"), "dGVzdA");
    assert.equal(format.getCodeByName("JS"), "javascript");
    assert.equal(format.getCodeByName("unknown", true), "text");
    assert.equal(format.normalizePath("C:\\tmp\\file.js"), "C:/tmp/file.js");
    assert.equal(format.secondsToMinutes(90), 1.5);
    assert.equal(format.transparentColor("#abc", 0.5), "rgba(170, 187, 204, 0.5)");
    assert.equal(format.transparentColor("rgb(1, 2, 3)", 2), "rgba(1, 2, 3, 1)");
});

test("value helpers retain sentinel and null behavior", () => {
    assert.equal(values.isStringifiedObject("[]"), "array");
    assert.equal(values.isStringifiedObject("{}"), "object");
    assert.equal(values.isStringifiedObject("1"), null);
    assert.equal(values.isStringifiedObject("{"), false);
    assert.equal(values.isObject(null), true);
    assert.equal(values.isArray([]), true);
    assert.equal(values.type("1.5"), "float");
});
