declare module "*.js";

interface Date {
    format(pattern: string): string;
}

interface Window {
    electron: Record<string, (...args: any[]) => any>;
    CodeMirror: any;
    Notificator: any;
    addToBug: (...args: any[]) => any;
    addToHistory: (...args: any[]) => any;
    showIndicator: (...args: any[]) => any;
    animate: any;
    webkitRequestAnimationFrame?: typeof requestAnimationFrame;
    mozRequestAnimationFrame?: typeof requestAnimationFrame;
    oRequestAnimationFrame?: typeof requestAnimationFrame;
    msRequestAnimationFrame?: typeof requestAnimationFrame;
}

declare const historyObject: Record<string | number, unknown>;
declare const bugsObject: Record<string | number, unknown>;
declare const priorityClasses: Record<string, { name: string }>;
declare const twemoji: {
    parse(value: string | Element, options: { folder: string; ext: string }): string;
};
