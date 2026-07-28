function callback(data) {
    const mainSender = data.mainSender;

    return () => {
        if (mainSender && !mainSender.isDestroyed()) {
            mainSender.send("code-suggest-result", { text: null });
        }
    };
}

module.exports = { callback };
