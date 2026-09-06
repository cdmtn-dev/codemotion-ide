import * as prettier from "prettier/standalone";
import * as babel from "prettier/plugins/babel";
import * as estree from "prettier/plugins/estree";
import * as typescript from "prettier/plugins/typescript";
import * as postcss from "prettier/plugins/postcss";
import * as html from "prettier/plugins/html";
import * as markdown from "prettier/plugins/markdown";
import * as yaml from "prettier/plugins/yaml";

const PLUGINS = [babel, estree, typescript, postcss, html, markdown, yaml];

const MODE_TO_PARSER: Record<string, string> = {
    javascript: "babel",
    jsx: "babel",
    typescript: "typescript",
    tsx: "typescript",
    json: "json",
    css: "css",
    sass: "scss",
    scss: "scss",
    less: "less",
    html: "html",
    vue: "vue",
    markdown: "markdown",
    yaml: "yaml",
};

export function parserForMode(mode: string) {
    if (!mode) return null;
    return MODE_TO_PARSER[String(mode).toLowerCase()] || null;
}

export async function formatCode(code: string, options: any = {}) {
    const { parser, tabWidth = 4, useTabs = true, rangeStart, rangeEnd, cursorOffset } = options;
    if (!parser) return null;

    const prettierOptions: any = { parser, plugins: PLUGINS, tabWidth, useTabs };
    if (typeof rangeStart === "number") prettierOptions.rangeStart = rangeStart;
    if (typeof rangeEnd === "number") prettierOptions.rangeEnd = rangeEnd;

    if (typeof cursorOffset === "number" && rangeStart === undefined) {
        const result = await prettier.formatWithCursor(code, { ...prettierOptions, cursorOffset });
        return { formatted: result.formatted, cursorOffset: result.cursorOffset };
    }

    const formatted = await prettier.format(code, prettierOptions);
    return { formatted, cursorOffset: null };
}
