/** The tab title element captured when the compatibility module is evaluated. */
export declare const tabName: HTMLElement | null;
/** Updates or removes the counter displayed beside the tab title. */
export declare function setTabNameCounter(count: string | number | false): void;
/** Replaces the current tab title markup. */
export declare function setTabName(text: string): void;
/** Shows the status indicator and schedules it to hide after its transition. */
export declare function showIndicator(time?: number, callback?: (indicator: Element) => void): void;
/** Transition helpers shared by legacy UI components. */
export declare const animate: {
    /** Replaces one element with another using the existing blur transition. */
    blurReplace({ add, remove }: {
        add?: Element;
        remove?: Element;
    }): void;
};
/** Installs the document-level popup interaction handler. */
export declare function handlePopups(): void;
/** Adds animated wheel scrolling to an element or the document. */
export declare function SmoothScroll(target: Document | HTMLElement, speed: number, smooth: number): void;
/** Generates the HTML for a deterministic initials avatar. */
export declare function generateAvatar(name: string): string;
/** Enables horizontal wheel scrolling for tab and command rows. */
export declare function handleOnWheelScrollX(): void;
/** Smoothly scrolls an element to its bottom edge. */
export declare function scrollToBottomSmooth(element: HTMLElement): void;
/** Lists custom property names declared by accessible `:root` rules. */
export declare function getAllCSSVariables(): string[];
/** Displays the code tabs and footer. */
export declare function showCodeWindowVisuals(): void;
/** Hides the code tabs and footer. */
export declare function hideCodeWindowVisuals(): void;
/** Replaces an element while retaining its attributes and child nodes. */
export declare function changeTagName(oldElement: Element, newTagName: string): Element;
/** Fits an Ace editor to its current line count within the given bounds. */
export declare function fitAceHeight(editor: any, minHeight?: number, maxHeight?: number): void;
/** Adds focused styling to inputs present when the module loads. */
export declare function initializeInputFocusState(): void;
