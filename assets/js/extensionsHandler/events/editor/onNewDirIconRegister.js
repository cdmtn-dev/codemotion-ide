import { Dirs } from "../../../lib.js";

export function onNewDirIconRegisterCallback({ data }) {
    Object.keys(data).forEach((k) => {
        Dirs.add({
            id: k,
            icon: data[k],
            ext: "svg",
            customIcon: true,
        });
    });
}
