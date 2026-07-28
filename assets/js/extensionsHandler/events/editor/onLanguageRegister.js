import { bus } from "../../../bus.js"
import { ICON_MAP } from "../../../iconRegistry.js"
import { EditorAdapter, Languages } from "../../../lib.js"

export function onLanguageRegisterCallback({ data }) {
    const name = data.languageName
    const displayName = data.languageDisplayName
    const extensions = data.languageExtensions
    const rules = data.languageRules
    const iconPath = data.languageIconPath

    EditorAdapter.registerLanguage({
        id: name,
        rules: rules
    })

    const languageObject = {
        name: displayName,
        icon: iconPath,
        customIcon: true,
        mode: name
    }

    if ("mode" in rules) {
        languageObject.mode = rules.mode
    }

    extensions.forEach(id => {
        languageObject.id = id

        ICON_MAP[id] = iconPath
        Languages.add(languageObject)
    })
}