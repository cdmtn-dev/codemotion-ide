import { sendEvent } from "../bus.js";

function getTriggerObj({ editor, language, extension }) {
    return {
        editorId: editor.id,
        editorValue: editor.getValue(),
        editorMode: editor.getCurrentLanguage(),
        editorLanguage: language.mode,
        editorLanguageExtension: extension,
        errors: editor.getAnnotations().filter((item) => item.type === "error").length,
        cursor: {
            line: editor.getCursorPosition().row + 1,
            column: editor.getCursorPosition().column + 1,
        },
    };
}

export function triggerEditorChanged({ editor, extension, language }) {
    window.electron.triggers.sendEditorChanged(getTriggerObj({ editor, extension, language }));

    sendEvent("editor-language-changed", {
        extension,
        editor,
        mode: editor.currentLanguageId(),
    });
}
export function triggerEditorClicked({ editor, extension, language }) {
    window.electron.triggers.sendEditorClicked(getTriggerObj({ editor, extension, language }));

    sendEvent("editor-clicked", {
        extension,
        editor,
        mode: editor.currentLanguageId(),
    });
}
