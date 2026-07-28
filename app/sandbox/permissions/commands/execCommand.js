function callback(data) {
    const extName = data.extensionName;
    const commandString = data.selfArgs[0];

    data.debuggerSender.send("debug-event", {
        data: {
            type: "execCommand",
            command: commandString,
            from: extName,
        },
        time: Date.now(),
    });
}

module.exports = { callback };
