export class _Dirs {
    static dirs = {
        default: {
            icon: "default",
            iconExt: "svg",
        },
        js: {
            icon: "js",
            iconExt: "svg",
        },
        javascript: {
            icon: "js",
            iconExt: "svg",
        },
        fonts: {
            icon: "fonts",
            iconExt: "svg",
        },
        font: {
            icon: "fonts",
            iconExt: "svg",
        },
        json: {
            icon: "json",
            iconExt: "svg",
        },
        css: {
            icon: "css",
            iconExt: "svg",
        },
        styles: {
            icon: "css",
            iconExt: "svg",
        },
        style: {
            icon: "css",
            iconExt: "svg",
        },
        plugins: {
            icon: "plugins",
            iconExt: "svg",
        },
        extensions: {
            icon: "plugins",
            iconExt: "svg",
        },
        assets: {
            icon: "assets",
            iconExt: "svg",
        },
        media: {
            icon: "assets",
            iconExt: "svg",
        },
        static: {
            icon: "assets",
            iconExt: "svg",
        },
        public: {
            icon: "assets",
            iconExt: "svg",
        },
        svg: {
            icon: "svg",
            iconExt: "svg",
        },
        icons: {
            icon: "svg",
            iconExt: "svg",
        },
        temp: {
            icon: "temp",
            iconExt: "svg",
        },
    };

    static getIcon(name) {
        if (name in _Dirs.dirs) {
            if ("customIcon" in _Dirs.dirs[name]) {
                return _Dirs.dirs[name].icon;
            }

            return `../assets/media/icons/folders/${_Dirs.dirs[name].icon}.${_Dirs.dirs[name].iconExt}`;
        }
        return `../assets/media/icons/folders/${_Dirs.dirs["default"].icon}.${_Dirs.dirs["default"].iconExt}`;
    }

    static add({ id, icon, ext, custom }) {
        const dirId = id == undefined ? crypto.randomUUID() : id;
        const dirIcon = icon;
        const dirExt = ext == undefined ? "svg" : ext;
        const customIcon = custom == undefined ? false : custom;

        _Dirs.dirs[dirId] = {
            icon: dirIcon,
            iconExt: dirExt,
            customIcon,
        };
    }

    static list() {
        return _Dirs.dirs;
    }
}
