import { sendEvent } from "../bus.js"

function getTriggerObj({ editor, language, extension }) {
    return {
        editorId: editor.id,
        editorValue: editor.getValue(),
        editorMode: editor.getCurrentLanguage(),
        editorLanguage: language.mode,
        editorLanguageExtension: extension,
        errors: editor.getAnnotations().filter(item => item.type === "error").length,
        cursor: {
            line: editor.getCursorPosition().row + 1,
            column: editor.getCursorPosition().column + 1
        }
    }
}

export function triggerEditorChanged({ editor, extension, language }) {  
    window.electron.triggers.sendEditorChanged(
        getTriggerObj({ editor: editor, extension: extension, language: language })
    )

    sendEvent("editor-language-changed", { extension: extension, editor: editor, mode: editor.currentLanguageId() })
}
export function triggerEditorClicked({ editor, extension, language }) {
    window.electron.triggers.sendEditorClicked(
        getTriggerObj({ editor: editor, extension: extension, language: language })
    )

    sendEvent("editor-clicked", { extension: extension, editor: editor, mode: editor.currentLanguageId() })
}