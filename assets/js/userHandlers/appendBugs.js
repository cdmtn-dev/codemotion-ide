import { addToBug } from "../lib.js";

export function appendBugs(bugs, type) {
    if (bugs) {
        Object.keys(bugs).forEach((bugId, index) => {
            const bug = bugs[bugId];

            const date = new Date(Number.parseInt(bug.date) * 1000);
            const hours = date.format("d.m, H:i");
            const day = date.format("l jS");

            const object = {
                id: bug.id,
                priority: Number.parseInt(bug.priority),
                value: bug.title,
                desc: bug.description ?? "",
                today: hours,
                isSelf: bug.private == 1,
                org: bug.by.organization,
                resolved: bug.resolved,
                author: bug.by.name,
                assignedTo: bug.assigned_to,
                type,
            };

            addToBug(object);
        });
    }
}
