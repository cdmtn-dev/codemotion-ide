import { getCurrentUserDataFromAPI } from "../user.js";

export async function addBug({
    bugModal,
    bugName,
    bugContent,
    bugPriority,
    bugPrivate,
    bugAssignTo,
}) {
    bugPrivate = Number.isInteger(bugPrivate) ? bugPrivate : 0;
    bugPriority = Number.isInteger(bugPriority) ? bugPriority : 0;
    bugAssignTo = Number.isInteger(bugAssignTo) ? bugAssignTo : 0;

    const res = await window.electron.requestAddBug({
        title: bugName,
        description: bugContent,
        priority: bugPriority,
        private: bugPrivate,
        assignTo: bugAssignTo,
    });

    if (res.success) {
        const msg = res.msg;

        const object = {
            id: msg.id,
            priority: msg.priority,
            value: msg.title,
            desc: msg.description,
            isSelf: bugPrivate,
            org: false,
            type: "created",
        };

        if ("name" in msg.assigned_to) {
            object["assignedTo"] = msg.assigned_to;
        }
        if ("name" in msg.by) {
            object["author"] = msg.by.name;
        }

        addToBug(object);

        bugModal.close();

        if (document.querySelector(".sidebar-item#bugs")) {
            document.querySelector(".sidebar-item#bugs").click();
        }
    } else {
        createNotify({
            icon: "close",
            title: "Error while adding bug on server",
            content: res.msg,
        });
    }
}
