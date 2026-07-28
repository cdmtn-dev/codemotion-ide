const { dialog } = require("electron")
const fsPromise = require('fs/promises');
const path = require("path")
const { loadGitignore, isIgnored } = require("./gitignore")

function selectFile(win) {
    const result = dialog.showOpenDialogSync(win, {
        title: "Choose a file",
        properties: ["openFile"],
    });

    if (!result || !result.length) return null;

    return result[0];
}

function selectFolder(win) {
    const result = dialog.showOpenDialogSync(win, {
        title: "Choose directory",
        properties: ["openDirectory"] 
    });

    if (!result || !result.length) return null;
    return result[0];
}

async function saveFile(fullPath, content) {
    try {
        await fsPromise.writeFile(fullPath, content, 'utf8');
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function readDirTree(rootPath, options = {}) {
    const absRoot = path.resolve(rootPath);
    const maxDepth = Number.isInteger(options.maxDepth) ? options.maxDepth : Infinity;
    const ignoreRoot = path.resolve(options.ignoreRoot || absRoot);
    const ignoreRules = await loadGitignore(ignoreRoot);

    async function walk(dir, depth = 0) {
        let entries = [];

        try {
            const dirents = await fsPromise.readdir(dir, { withFileTypes: true });

            for (const d of dirents) {
                const full = path.join(dir, d.name);
                const isDirectory = d.isDirectory();
                const item = { name: d.name, path: full, ignored: isIgnored(full, ignoreRoot, ignoreRules, isDirectory) };

                if (isDirectory) {
                    if (item.ignored && ignoreRules.canPrune) {
                        entries.push({ ...item, type: 'dir', loaded: false });
                    } else if (depth < maxDepth) {
                        const children = await walk(full, depth + 1);
                        entries.push({ ...item, type: 'dir', children, loaded: true });
                    } else {
                        entries.push({ ...item, type: 'dir', loaded: false });
                    }
                } else if (d.isSymbolicLink()) {
                    entries.push({ ...item, type: 'symlink' });
                } else {
                    entries.push({ ...item, type: 'file' });
                }
            }

            entries.sort((a, b) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                if (a.type === 'dir') return -1;
                if (b.type === 'dir') return 1;
                return 0;
            });

        } catch (err) {
            entries.push({
                name: path.basename(dir),
                path: dir,
                type: 'dir',
                error: String(err),
            });
        }

        return entries;
    }

    try {
        const st = await fsPromise.lstat(absRoot);

        if (st.isFile()) {
            return [{ name: path.basename(absRoot), path: absRoot, type: 'file' }];
        }
    } catch (e) {
        throw new Error(`Path not found: ${absRoot}`);
    }
    
    return walk(absRoot);
}

module.exports = {
    selectFile,
    selectFolder,
    saveFile,
    readDirTree
}
