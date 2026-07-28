/** Appends an entry to the legacy global history store. */
export function addToHistory({ id, actionType, value, desc, today }) {
    const historyId = id === undefined ? Object.keys(historyObject).length + 1 : id;
    historyObject[historyId] = {
        time: today === undefined ? new Date().format("H:i") : today,
        action: actionType,
        value: value === undefined ? "Untitled" : value,
        description: desc === undefined ? "No description provided" : desc,
    };
}
/** Adds a bug and records the corresponding history event. */
export function addToBug(properties) {
    const bugId = properties.id ?? Object.keys(bugsObject).length + 1;
    const priority = properties.priority !== undefined && !Number.isNaN(properties.priority)
        ? properties.priority
        : 0;
    const priorityInfo = priorityClasses[String(priority)] || priorityClasses["0"];
    addToHistory({
        actionType: "bug-added",
        value: properties.value,
        desc: `Bug "${properties.value}" added with ${priorityInfo.name} priority`,
    });
    bugsObject[bugId] = {
        id: bugId,
        time: properties.today ?? new Date().format("H:i"),
        priority,
        value: properties.value,
        description: properties.desc ?? "No description provided",
        self: properties.isSelf ?? false,
        organization: properties.org,
        resolved: properties.resolved ?? false,
        author: properties.author ?? false,
        assignedTo: properties.assignedTo ?? {},
        type: properties.type,
    };
    return bugsObject;
}
