const { checkFields } = require("../../tools.js");

function callback(data) {
    const themeName = data.selfArgs[0];
    const themeData = data.selfArgs[1];
    const extName = data.extensionName;
    const permissionName = data.permissionName;

    let allCssVariables = data.allCSSVariables;

    checkFields(permissionName, themeData, {
        id: "string",
        variables: "object",
        editorTheme: "string",
    });

    const variables = [];

    Object.keys(themeData.variables).forEach((v) => {
        variables.push(`${v}: ${themeData.variables[v]}`);

        allCssVariables = allCssVariables.map((item) => {
            const name = item.split(":")[0].trim();
            const value = themeData.variables[name];

            if (value) {
                return `${name}: <important>${value}</important>`;
            }
            return `${name}: <span class="transparent">default</span>`;
        });
    });

    themeData.variables = variables.join(";");

    data.mainSender.send("new-theme-register", themeName, themeData);

    data.debuggerSender.send("debug-event", {
        data: {
            type: "newCommand",
            command: {
                name: "CSSVariables",
                response: `A list of current CSS variables will be displayed below. The format is "name:value":\n${allCssVariables.join(", \n")}`,
            },
            from: extName,
        },
        time: Date.now(),
    });
}

module.exports = { callback };
