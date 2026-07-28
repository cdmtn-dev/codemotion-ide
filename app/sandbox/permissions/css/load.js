const { saveReadFile } = require("../../tools.js");
const path = require("path");

function callback(data) {
    const extName = data.extensionName;
    const extPath = data.extensionPath;
    const filename = data.selfArgs[0] + ".css";
    const CssContent = saveReadFile(path.join(extPath, filename));

    if (!CssContent) throw new Error(`The file "${filename}" was not found or is empty`);

    data.debuggerSender.send("debug-event", {
        data: {
            type: "warn",
            content: `Loaded local resource: ${filename}`,
            from: extName,
        },
        time: Date.now(),
    });

    data.mainSender.send("load-css", extName, CssContent);
}

module.exports = { callback };
