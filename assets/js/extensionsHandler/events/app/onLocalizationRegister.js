import { bus, sendEvent } from "../../../bus.js";

export function onLocalizationRegister(data) {
    sendEvent("extension-localization-register", data);
}
