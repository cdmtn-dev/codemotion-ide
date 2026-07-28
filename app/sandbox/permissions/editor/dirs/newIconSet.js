const { saveReadFile } = require("../../../tools.js");
const path = require("path");

function callback(data) {
    const extPath = data.extensionPath;
    const configPath = data.selfArgs[0];

    if (configPath) {
        let configContent = saveReadFile(path.join(extPath, configPath + ".json"), true);
        configContent = JSON.parse(configContent);

        Object.keys(configContent).forEach((k) => {
            configContent[k] = path.join(extPath, configContent[k]);
        });

        data.mainSender.send("new-dir-icon-register", configContent);
    }
}

module.exports = { callback };
