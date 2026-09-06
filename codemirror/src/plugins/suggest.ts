import { EditorView, Decoration, ViewPlugin, WidgetType, ViewUpdate, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

const setSuggestion = StateEffect.define<any>();
const clearSuggestion = StateEffect.define<any>();

class GhostLineWidget extends WidgetType {
    text: string;
    constructor(text: string) {
        super();
        this.text = text;
    }

    toDOM() {
        const span = document.createElement("span");
        span.className = "cm-suggest-ghost";
        span.textContent = this.text || "\u00a0";
        return span;
    }

    eq(other: GhostLineWidget) {
        return this.text === other.text;
    }

    ignoreEvent() {
        return true;
    }
}

const suggestionField = StateField.define({
    create() {
        return { text: null, from: 0 };
    },

    update(value: any, tr: any) {
        for (const effect of tr.effects) {
            if (effect.is(setSuggestion)) return effect.value;
            if (effect.is(clearSuggestion)) return { text: null, from: 0 };
        }

        if (tr.docChanged && value.text) {
            return { text: null, from: 0 };
        }

        return value;
    }
});

const suggestionTheme = EditorView.baseTheme({
    ".cm-suggest-ghost": {
        opacity: "0.4",
        fontStyle: "italic",
        pointerEvents: "none",
        color: "inherit"
    }
});

let debounceTimer = null;
let currentLanguage = "text";

function setLanguage(lang) {
    currentLanguage = lang;
}

function buildDecorations(view) {
    try {
        const field = view.state.field(suggestionField, false);
        if (!field || !field.text) return Decoration.none;

        const lines = field.text.split("\n");
        const decorations = [];

        const firstLine = view.state.doc.lineAt(field.from);
        const firstLineSuffix = lines[0];
        decorations.push(
            Decoration.widget({
                widget: new GhostLineWidget(firstLineSuffix),
                side: 1,
                block: false
            }).range(firstLine.to)
        );

        for (let i = 1; i < lines.length; i++) {
            const targetLineNum = firstLine.number + i;
            if (targetLineNum > view.state.doc.lines) break;
            const targetLine = view.state.doc.line(targetLineNum);
            decorations.push(
                Decoration.widget({
                    widget: new GhostLineWidget(lines[i]),
                    side: 1,
                    block: false
                }).range(targetLine.to)
            );
        }

        return Decoration.set(decorations);
    } catch {
        return Decoration.none;
    }
}

const suggestPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = buildDecorations(view);
        }

        update(update: ViewUpdate) {
            this.decorations = buildDecorations(update.view);
        }
    },
    {
        decorations: (v) => v.decorations
    }
);

function acceptSuggestion(view) {
    try {
        const field = view.state.field(suggestionField, false);
        if (!field || !field.text) return false;

        const to = field.from + field.text.length;
        view.dispatch({
            changes: { from: field.from, insert: field.text },
            selection: { anchor: to },
            effects: clearSuggestion.of(null)
        });
        return true;
    } catch {
        return false;
    }
}

function dismissSuggestion(view) {
    try {
        const field = view.state.field(suggestionField, false);
        if (!field || !field.text) return false;

        view.dispatch({ effects: clearSuggestion.of(null) });
        return true;
    } catch {
        return false;
    }
}

let pendingView = null;

const suggestUpdateListener = EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;

    pendingView = update.view;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        const view = pendingView;
        if (!view) return;

        const fullCode = view.state.doc.toString();
        const cursor = view.state.selection.main.head;
        const line = view.state.doc.lineAt(cursor).number;

        const electronAPI = typeof window !== "undefined" && window.electron;
        if (!electronAPI || typeof electronAPI.sendCodeSuggestRequest !== "function") return;

        electronAPI.sendCodeSuggestRequest({
            code: fullCode,
            cursor: cursor,
            cursorLine: line,
            language: currentLanguage
        });
    }, 800);
});

function initSuggestListener() {
    const electronAPI = typeof window !== "undefined" && window.electron;
    if (!electronAPI || typeof electronAPI.onCodeSuggestResult !== "function") return;

    electronAPI.onCodeSuggestResult((result) => {
        if (!pendingView) return;

        const view = pendingView;

        if (!result || !result.text) {
            view.dispatch({ effects: clearSuggestion.of(null) });
            return;
        }

        view.dispatch({
            effects: setSuggestion.of({
                text: result.text,
                from: view.state.selection.main.head
            })
        });
    });
}

export {
    suggestionField,
    suggestionTheme,
    suggestPlugin,
    suggestUpdateListener,
    setSuggestion,
    clearSuggestion,
    acceptSuggestion,
    dismissSuggestion,
    setLanguage,
    initSuggestListener
};
