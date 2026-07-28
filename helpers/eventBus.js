const { EventEmitter } = require("events");
const bus = new EventEmitter();

module.exports = bus;
