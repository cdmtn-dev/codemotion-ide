import { GLS } from "../lib.js";
import { Modal } from "../modalsHandler/engine.js";

export async function closeConfirmModal({ fileName }) {
    const gls = await GLS.initLocal();

    const modal = Modal.create({
        id: "closeConfirmModal",
        name: "closeConfirmModal",
        modalClassList: ["window"],
        size: "mini",
        title: gls.get("modals.closeConfirm.title"),

        content: [
            {
                type: "row",
                gap: 15,
                classList: ["background"],
                items: [
                    {
                        type: "placeholder",
                        title: gls.get("modals.closeConfirm.message", { file: fileName }),
                        description: gls.get("modals.closeConfirm.description"),
                    },
                    {
                        type: "container",
                        id: "closeConfirmButtons",
                    },
                    {
                        type: "button",
                        id: "closeConfirmYes",
                        title: gls.get("modals.closeConfirm.yes"),
                        container: "#closeConfirmButtons",
                        class: "danger",
                    },
                    {
                        type: "button",
                        id: "closeConfirmSave",
                        title: gls.get("modals.closeConfirm.save"),
                        container: "#closeConfirmButtons",
                    },
                    {
                        type: "button",
                        id: "closeConfirmNo",
                        title: gls.get("cancel"),
                        container: "#closeConfirmButtons",
                        class: "secondary",
                    },
                ],
            },
        ],
    });

    return modal;
}
