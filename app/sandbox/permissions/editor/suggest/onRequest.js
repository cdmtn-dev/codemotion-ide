const bus = require("../../../../../helpers/eventBus.js");
const { callbacks } = require("./shared.js");

function callback(data) {
    const extensionName = data.extensionName;

    console.log(`[code-suggest] onRequest registered for: ${extensionName}`);

    return (userCallback) => {
        if (typeof userCallback !== "function") return;

        callbacks.set(extensionName, userCallback);
        console.log(`[code-suggest] callback stored for: ${extensionName}`);

        bus.on("code-suggest-request", (requestData) => {
            console.log(`[code-suggest] bus event received for: ${extensionName}`);
            const cb = callbacks.get(extensionName);
            if (cb) {
                try {
                    cb(requestData);
                } catch (e) {
                    console.error(`[code.suggest] ${extensionName} error:`, e.message);
                }
            }
        });
    };
}

module.exports = { callback };
