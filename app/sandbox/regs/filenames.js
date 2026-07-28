const { ipcMain } = require("electron");
const { checkFields, saveReadFile, createSandboxConsole, ExtensionError } = require("../tools");
const path = require("path");

const bus = require("../../../helpers/eventBus");

let debuggerSender = null;
let mainSender = null;

bus.on("debugger-ready", (sender) => {
    debuggerSender = sender;
});
bus.on("main-ready", (sender) => {
    mainSender = sender;
});

ipcMain.on("filenames-register", async (event, data) => {
    const configPath = data.configPath;
    const extPath = data.extensionPath;
    const extName = data.extensionName;

    const c = createSandboxConsole(extName, debuggerSender);

    if (configPath) {
        let configContent = saveReadFile(path.join(extPath, configPath + ".json"), true);
        configContent = JSON.parse(configContent);

        if (Object.keys(configContent).length > 0) {
            Object.keys(configContent).forEach((item) => {
                const filename = configContent[item];

                try {
                    checkFields(`filenames:register:${item}`, filename, {
                        icon: "SVGFile|PNGFile",
                        name: "string",
                        mode: "string",
                    });
                } catch (e) {
                    c.error(String(e));
                }
            });

            mainSender.send("new-filenames-register", {
                config: configContent,
                extPath,
            });
        }
    }
});
