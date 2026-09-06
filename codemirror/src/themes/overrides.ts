import { EditorView } from "@codemirror/view";

export const vscodeDarkOverride = EditorView.theme({
    "&": {
        backgroundColor: "#101010!important"
    },
    ".cm-gutters": {
        backgroundColor: "#101010!important"
    }
});
export const atomoneOverride = EditorView.theme({
    "&": {
        backgroundColor: "#040404!important"
    },
    ".cm-gutters": {
        backgroundColor: "#040404!important"
    }
});
export const githubDarkOverride = EditorView.theme({
    ".cm-gutters": {
        backgroundColor: "#0d1117!important"
    }
});
