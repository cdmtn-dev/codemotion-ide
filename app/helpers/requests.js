const fs = require("fs")
const path = require("path")
const fsPromise = require('fs/promises');
const https = require("https")
const {
    SETTINGS_PATH,
    LOCAL_BUGS_PATH,
    LOCAL_FILE_PATH,
    PACKAGE_FILE_PATH,
    DEFAULT_ICON,
    ASSETS_PATH
} = require("./paths.js")

function deepMerge(target, source) {
    if (!source || typeof source !== "object") return target;

    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];

        if (
            srcVal &&
            typeof srcVal === "object" &&
            !Array.isArray(srcVal) &&
            tgtVal &&
            typeof tgtVal === "object" &&
            !Array.isArray(tgtVal)
        ) {
            target[key] = deepMerge({ ...tgtVal }, srcVal);
        } else {
            target[key] = srcVal;
        }
    }

    return target;
}
function readSettings() {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) {
            return {};
        }

        const raw = fs.readFileSync(SETTINGS_PATH, "utf8").trim();
        if (!raw) return {};

        return JSON.parse(raw);
    } catch (err) {
        console.error("Error reading settings.json:", err);
        return {};
    }
}
function writeLocalBugs(data) {
    try {
        fs.writeFileSync(LOCAL_BUGS_PATH, JSON.stringify(data, null, 4), "utf-8")
    } catch (e) {
        console.error("Write error:", e)
    }
}

function writeSettings(data) {
    const current = readSettings() || {};

    const merged = deepMerge({ ...current }, data);

    try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), "utf8");
        console.log("Settings changed successfully:", merged)
    } catch (err) {
        console.error("Error writing settings.json:", err);
    }

    return merged;
}
function ensureLocalJson() {
    if (!fs.existsSync(LOCAL_FILE_PATH)) {
        const defaultData = {
            user: false,
            password: false
        };
        fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(defaultData, null, 4), "utf-8");
    }
}
function ensureSettingsJson() {
    if (!fs.existsSync(SETTINGS_PATH)) {
        const defaultData = {
            "app": {
                "icon": "default",
                "workSeconds": 0,
                "workSecondsSession": 0,
                "devMode": false,
                "splashScreen": true
            },
            "editor": {
                "smoothScroll": true
            }
        }

        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultData, null, 4), "utf-8");
    }
}
function ensureLocalBugs() {
    if (!fs.existsSync(LOCAL_BUGS_PATH)) {
        fs.writeFileSync(LOCAL_BUGS_PATH, "[]", "utf-8");
    }
}
function getLocalAppData() {
    try {
        const data = fs.readFileSync(LOCAL_FILE_PATH, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error while reading ${LOCAL_FILE_PATH}:`, err);
        return { user: false, password: false };
    }
}
function getSettingsData() {
    try {
        const data = fs.readFileSync(SETTINGS_PATH, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error while reading ${SETTINGS_PATH}`, err);
        return {};
    }
}
function getLocalBugsData() {
    try {
        const data = fs.readFileSync(LOCAL_BUGS_PATH, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error while reading ${LOCAL_BUGS_PATH}:`, err);
        return {};
    }
}
function getPackageData() {
    try {
        const data = fs.readFileSync(PACKAGE_FILE_PATH, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error while reading ${PACKAGE_FILE_PATH}:`, err);
        return {};
    }
}
async function getAppIcon() {
    const settings = await readSettings()

    if ("app" in settings) {
        if ("icon" in settings.app) {
            const appIcon = settings.app.icon == "default"
                ? DEFAULT_ICON
                : path.join(ASSETS_PATH, "media", "app-icons", `codemotion-icon-${settings.app.icon}.png`)

            return appIcon
        }
        else {
            return DEFAULT_ICON
        }
    }
    else {
        return DEFAULT_ICON
    }
}
function readFilesInFolder(folderPath) {
    return fs.readdirSync(folderPath).map(file => {
        const fullPath = path.join(folderPath, file);
        const isDir = fs.statSync(fullPath).isDirectory();

        return {
            name: file,
            path: fullPath,
            type: isDir ? 'folder' : 'file'
        };
    });
}
async function readFileContent(filePath, encoding = 'utf8') {
    const abs = path.resolve(filePath);
    const data = await fsPromise.readFile(abs, { encoding: encoding === null ? undefined : encoding });
    return data;
}
function updateLocalAppData(newData) {
    const filePath = path.join(__dirname, "local.json");

    let currentData = {};
    if (fs.existsSync(filePath)) {
        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            currentData = JSON.parse(raw);
        } catch (e) {
            console.error("local.json read error:", e);
        }
    }

    const updatedData = { ...currentData, ...newData };

    try {
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 4), "utf-8");
        console.log("local.json updated")
    } catch (e) {
        console.error("Error while updating local.json:", e);
    }
}
async function checkStatus({ updateSplash }) {
    function checkURL(url, stepName) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    updateSplash(`${stepName}: OK (${res.statusCode})`)
                    res.resume();
                    resolve(true);
                } else {
                    reject(new Error(`${stepName} returned status ${res.statusCode}`));
                }
            });

            req.on("error", (err) => {
                reject(new Error(`${stepName} not aviable: (${err.message})`));
            });

            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error(`${stepName}: connection timeout`));
            });
        });
    }

    updateSplash("Internet check...")

    try {
        await checkURL("https://www.gstatic.com/generate_204", "Internet");
    } catch (err) {
        updateSplash(`Error: ${err.message}`, true)

        throw new Error("Error: " + err.message);
    }

    const hosts = [
        { name: "Developers server", url: "https://dev.yurba.one" }
    ];

    for (let i = 0; i < hosts.length; i++) {
        const { name, url } = hosts[i];

        updateSplash(`Requesting ${url}...`)

        try {
            await checkURL(url, name);
        } catch (err) {
            throw new Error(`${name} not aviable: ${err.message}`);
        }
    }

    updateSplash("Everything is okey. Starting the program...")

    return true;
}

module.exports = {
    readSettings,
    deepMerge,
    writeLocalBugs,
    writeSettings,
    ensureLocalJson,
    ensureSettingsJson,
    ensureLocalBugs,
    getLocalAppData,
    getSettingsData,
    getLocalBugsData,
    getPackageData,
    getAppIcon,
    readFilesInFolder,
    readFileContent,
    updateLocalAppData,
    checkStatus
}