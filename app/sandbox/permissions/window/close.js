const { app } = require("electron");

function callback(data) {
    app.quit();
}

module.exports = { callback };
