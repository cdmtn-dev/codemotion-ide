export interface HistoryProperties {
    id?: string | number;
    actionType?: unknown;
    value?: unknown;
    desc?: unknown;
    today?: unknown;
}
export interface BugProperties {
    id?: string | number;
    priority?: number;
    value?: unknown;
    desc?: unknown;
    today?: unknown;
    isSelf?: boolean;
    org?: unknown;
    resolved?: boolean;
    author?: unknown;
    assignedTo?: unknown;
    type?: unknown;
}
/** Appends an entry to the legacy global history store. */
export declare function addToHistory({ id, actionType, value, desc, today }: HistoryProperties): void;
/** Adds a bug and records the corresponding history event. */
export declare function addToBug(properties: BugProperties): Record<string | number, unknown>;
