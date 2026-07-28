const activeRules = new Map();

function getAceTriggeredData({ data, mainSender }) {
    const fileId = data.editorId;

    const object = {
        value: data.editorValue,
        mode: data.editorMode,
        language: {
            name: data.editorLanguage,
            extension: data.editorLanguageExtension,
        },
        errors: data.errors || 0,
        cursor: data.cursor || {
            line: 1,
            column: 1,
        },
        api: {
            replace: (...args) =>
                publicApi.replace({ editorValue: data.editorValue, mainSender }, ...args),
            includes: (...args) => publicApi.includes({ editorValue: data.editorValue }, ...args),
        },
    };

    return object;
}

const publicApi = {
    replace({ editorValue, mainSender }, findString, replaceString) {
        if (typeof editorValue == "string") {
            mainSender.send("editor-api-replace", {
                findString,
                replaceString,
            });
        }
    },
    includes({ editorValue }, findString) {
        return editorValue.includes(findString);
    },
};

module.exports = { getAceTriggeredData, publicAPI: publicApi };
