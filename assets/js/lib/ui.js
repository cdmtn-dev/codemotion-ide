import { _TopBarElement } from "../libClasses/topbarElement.js";
/** Displays the persistent top-bar prompt requesting an application reload. */
export function showNeedReloadTopBar() {
    const prompt = new _TopBarElement("needReload");
    prompt.content({
        icon: "cached",
        text: "You need to reload application",
        type: "danger",
    });
    setTimeout(() => {
        prompt.show();
        setTimeout(() => prompt.hide({ iconVisible: true }), 3000);
    }, 1000);
    prompt.on("hover", (instance) => instance.show());
    prompt.on("unhover", (instance) => instance.hide({ iconVisible: true }));
}
