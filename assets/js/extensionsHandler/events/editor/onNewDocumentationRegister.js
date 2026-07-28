import { bus } from "../../../bus.js";
import { enableAceHover } from "../../helpers/aceHover.js";

export function onNewDocumentationRegisterCallback({ data }) {
    const docs = data.config;
    const onMode = data.props.onMode;

    bus.addEventListener("ace-mode-changed", (e) => {
        const detail = e.detail;
        const mode = detail.mode.trim();
        const extension = detail.extension;
        const editor = detail.editor;

        if (mode == onMode) {
            enableAceHover(editor, docs, data.props);
        }
    });
}
