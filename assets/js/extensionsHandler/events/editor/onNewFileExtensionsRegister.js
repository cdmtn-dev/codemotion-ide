import { capitilize, Languages } from "../../../lib.js";

export function onNewFileExtensionsRegister(data) {
    const list = Languages.list();
    const config = data.config;
    const extPath = data.extPath;

    Object.keys(config).forEach((item) => {
        const itemConfig = config[item];

        const icon = `${extPath}/${itemConfig.icon}`;
        const iconExt = icon.split(".").pop() == "svg" ? "svg" : "png";
        const mode = itemConfig.mode;
        const name = `${itemConfig.name} (${capitilize(mode)})`;

        Languages.add({
            id: item,
            icon,
            iconExt,
            mode,
            name,

            customIcon: true,
        });
    });
}
