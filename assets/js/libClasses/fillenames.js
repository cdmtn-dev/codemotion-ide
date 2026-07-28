export class _Filenames {
    static filenames = {
        "tsconfig.json": {
            name: "TypeScript Config",
            icon: "tsconfig",
            iconExt: "svg",
            mode: "json",
            color: "#2e70ff",
        },
        LICENSE: {
            name: "License file",
            icon: "license",
            iconExt: "svg",
            mode: "text",
            color: "#929292",
        },
        "package.json": {
            name: "NPM Package file",
            icon: "npm",
            iconExt: "svg",
            mode: "json",
            color: "#ff2828",
        },
        "package-lock.json": {
            name: "NPM Package file",
            icon: "npm",
            iconExt: "svg",
            mode: "json",
            color: "#ff2828",
        },
        "go.mod": {
            name: "GO Mod File",
            icon: "gomod",
            iconExt: "svg",
            mode: "gomod",
            color: "#eecb80",
        },
    };

    static add(name, properties) {
        _Filenames.filenames[name] = properties;
    }

    static list() {
        return _Filenames.filenames;
    }

    static get(name) {
        if (name in _Filenames.filenames) {
            return _Filenames.filenames[name];
        }
        return false;
    }

    static async getIcon(name) {
        const info = _Filenames.get(name);
        let allFilenamesIcons = await window.electron.getAllFilenamesIcons();

        allFilenamesIcons = allFilenamesIcons.map((item) => {
            if (item.type != "folder") return item.name;
        });
        allFilenamesIcons = allFilenamesIcons.filter((item) => item != undefined);

        if (name in _Filenames.filenames) {
            let fileName = `${_Filenames.filenames[name].icon}.${_Filenames.filenames[name].iconExt}`;

            if (info.customIcon) {
                fileName = _Filenames.filenames[name].icon;
            }

            if (allFilenamesIcons.includes(fileName)) {
                return fileName;
            }
            return fileName;
        }
        return false;
    }

    static async getIconPath(name) {
        const info = _Filenames.get(name);
        const icon = await _Filenames.getIcon(name);

        if (info.customIcon) {
            return icon;
        }
        if (icon) {
            return `../assets/media/icons/symbols/files/${icon}`;
        }
        return false;
    }
}
