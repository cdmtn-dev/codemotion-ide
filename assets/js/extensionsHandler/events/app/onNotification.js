import { createNotify } from "../../../lib.js";

export function onNotificationCallback({ data, name }) {
    if ("content" in data) {
        data["content"] = `(${name}) ${data.content}`;
    }
    if ("time" in data && data.time > 15_000) data.time = 4000;

    createNotify(data);
}
