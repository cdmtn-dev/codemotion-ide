import { Filenames } from "../../../lib.js";

export function onFilenamesRegister(data) {
    const config = data.config;
    const extPath = data.extPath;

    Object.keys(config).forEach((item) => {
        const itemConfig = config[item];

        const name = itemConfig.name;
        const icon = `${extPath}/${itemConfig.icon}`;
        const iconExt = icon.split(".").pop() == "svg" ? "svg" : "png";
        const mode = itemConfig.mode;

        Filenames.add(item, {
            name,
            icon,
            iconExt,
            mode,
            color: "#fff",

            customIcon: true,
        });
    });
}
