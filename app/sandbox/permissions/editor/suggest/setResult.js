function callback(data) {
    const mainSender = data.mainSender;

    return (text) => {
        if (mainSender && !mainSender.isDestroyed()) {
            mainSender.send("code-suggest-result", { text: text || null });
        }
    };
}

module.exports = { callback };
