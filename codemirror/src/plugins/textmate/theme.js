import { EditorView } from "@codemirror/view";

export const textMateBaseTheme = EditorView.theme({
    ".cm-tm-keyword": { color: "#c586c0" },
    ".cm-tm-operator": { color: "#bc85e9" },
    ".cm-tm-comment": { color: "#525252" },
    ".cm-tm-string": { color: "#ce9178" },
    ".cm-tm-number": { color: "#b5cea8" },
    ".cm-tm-constant": { color: "#569cd6" },
    ".cm-tm-function": { color: "#dcdcaa" },
    ".cm-tm-type": { color: "#4ec9b0" },
    ".cm-tm-tag": { color: "#569cd6" },
    ".cm-tm-attribute": { color: "#9cdcfe" },
    ".cm-tm-variable": { color: "#9cdcfe" },
    ".cm-tm-punctuation": { color: "#d4d4d4" },
});
