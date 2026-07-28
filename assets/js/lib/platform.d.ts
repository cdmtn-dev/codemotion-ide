export interface NotificationProperties {
    type?: unknown;
    icon?: unknown;
    title?: unknown;
    content?: unknown;
    time?: unknown;
    image?: unknown;
}
/** Creates a native notification through the Electron preload API. */
export declare function createNotify(properties?: NotificationProperties): void;
/** Returns the current body theme or the default theme name. */
export declare function getTheme(): string;
/** Copies text to the system clipboard and reports failures to the console. */
export declare function copyText(text: string): void;
/** Converts emoji in a string to Twemoji SVG markup. */
export declare function parseTwemojiString(text: string): string;
/** Converts emoji contained by an element to Twemoji SVG markup. */
export declare function parseTwemojiElement(element?: Element | null): void;
/** Updates the native application title. */
export declare function setAppTitle(title?: string): void;
/** Returns the persisted GitHub token or the historical `false` sentinel. */
export declare function getGithubToken(): Promise<string | false>;
