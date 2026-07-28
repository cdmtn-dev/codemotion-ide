import { CodeTemplates } from "../../../lib.js";

export function onTemplatesRegister(data) {
    const config = data.config;

    Object.keys(config).forEach((item) => {
        CodeTemplates.add(item, config[item]);
    });
}
