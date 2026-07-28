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

ipcMain.on("templates-register", async (event, data) => {
    const configPath = data.configPath;
    const extPath = data.extensionPath;
    const extName = data.extensionName;

    const c = createSandboxConsole(extName, debuggerSender);

    if (configPath) {
        let configContent = saveReadFile(path.join(extPath, configPath + ".json"), true);
        configContent = JSON.parse(configContent);

        const keys = Object.keys(configContent);

        if (keys.length > 0) {
            keys.forEach((item) => {
                const extensionConfig = configContent[item];

                extensionConfig.forEach((cfgItem) => {
                    try {
                        checkFields(`templates:register:${item}`, cfgItem, {
                            name: "string",
                            content: "string",
                        });
                    } catch (e) {
                        c.error(String(e));
                    }
                });
            });

            mainSender.send("new-templates-register", {
                config: configContent,
                extPath,
            });
        }
    }
});
