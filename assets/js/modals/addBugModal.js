import { addBug } from "../coopHandlers/addBug.js";
import { createNotify, escapeHtml, GLS, Options } from "../lib.js";
import { Modal } from "../modalsHandler/engine.js";

export async function getAddBugModal() {
    const gls = await GLS.initLocal();

    let priority = 0;
    let assignId = 0;

    const prioritySelect = new Options("prioritySelect");
    const colleaguesSelect = new Options("colleaguesSelect");

    const yourColleaguesRes = await window.electron.requestGetYourOrgColleagues();
    const yourColleaguesResMsg = yourColleaguesRes.msg;

    if (yourColleaguesRes.success) {
        for (const item in yourColleaguesResMsg) {
            const colleague = yourColleaguesResMsg[item];

            const colleagueItem = colleaguesSelect.add(colleague.id, colleague.name, {
                secondary: colleague.organization.name,
            });

            if (item == 0) {
                assignId = colleague.id;
                colleagueItem.default();
            }
        }
    }

    prioritySelect.add("0", "Common priority").default();
    prioritySelect.add("1", "Medium priority", { color: "#FFB75E" });
    prioritySelect.add("2", "High priority", { color: "#FF3333" });

    function lgls(string) {
        return gls.get(`modals.addBug.${string}`);
    }

    const addBugModal = Modal.create({
        id: "addBug",
        name: "addBug",
        modalClassList: ["window"],
        size: "sm",
        title: lgls("title"),

        content: [
            {
                type: "row",
                gap: 15,
                classList: ["background"],
                items: [
                    {
                        type: "placeholder",
                        title: lgls("header.title"),
                        description: lgls("header.description"),
                    },
                    {
                        type: "input",
                        placeholder: lgls("inputs.name"),
                        id: "addBugName",
                    },
                    {
                        type: "input",
                        placeholder: lgls("inputs.description"),
                        id: "addBugContent",
                    },
                    {
                        type: "placeholder",
                        id: "addBugPriority",
                        title: "Select priority",
                        description: "Select bug priority",
                    },
                    {
                        type: "placeholder",
                        id: "addBugAssign",
                        title: "Choose who to assign the bug to",
                        description:
                            "This is a list of people who are members of the same organizations as you",
                    },
                    {
                        type: "switch",
                        id: "isPrivate",
                        checked: false,
                        title: lgls("privateBugSwitch.title"),
                        description: lgls("privateBugSwitch.description"),
                    },
                    {
                        type: "container",
                        id: "buttonsContainer",
                    },
                    {
                        type: "button",
                        id: "addBugConfirm",
                        title: lgls("confirmBtnPrivate"),
                        container: "#buttonsContainer",
                    },
                ],
            },
        ],
    });

    const element = addBugModal.el;
    const addBtn = element.querySelector("#addBugConfirm");
    const addBugAssign = element.querySelector("#addBugAssign");
    const addBugPriority = element.querySelector("#addBugPriority");

    prioritySelect.appendTo(addBugPriority);

    prioritySelect.on("click", (e) => {
        priority = Number.parseInt(e.id);
    });

    if (yourColleaguesRes.success) {
        colleaguesSelect.appendTo(addBugAssign);

        colleaguesSelect.on("click", (e) => {
            console.log(e.id);
        });
    } else {
        createNotify({
            icon: "close",
            title: "Colleagues list get error",
            content: yourColleaguesResMsg,
        });
    }

    element.querySelector("#isPrivate").addEventListener("change", (event) => {
        const originalAssignId = assignId;
        const checked = event.target.checked;

        addBtn.textContent = checked ? lgls("confirmBtnPrivate") : lgls("confirmBtn");

        if (checked) {
            addBugAssign.classList.add("disabled");
        } else {
            addBugAssign.classList.remove("disabled");
        }
    });

    addBtn.addEventListener("click", async () => {
        const bugName = escapeHtml(element.querySelector("#addBugName").value);
        const bugContent = escapeHtml(element.querySelector("#addBugContent").value);
        const isPrivate = element.querySelector("#isPrivate").checked ? 1 : 0;

        if (bugContent.length > 0 && bugContent.length > 0) {
            const objectToAdd = {
                bugModal: addBugModal,
                bugName,
                bugContent,
                bugPriority: priority,
                bugPrivate: isPrivate,
                bugAssignTo: assignId,
            };

            if (isPrivate) delete objectToAdd["bugAssignTo"];

            await addBug(objectToAdd);
        } else {
            createNotify({
                icon: "close",
                title: "Error while bug adding",
                content: "All fields must be filled",
            });
        }
    });

    return addBugModal;
}
