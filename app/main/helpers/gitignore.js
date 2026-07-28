const fsPromise = require("fs/promises")
const path = require("path")
const ignore = require("ignore")

async function loadGitignore(rootPath) {
    try {
        const content = await fsPromise.readFile(path.join(rootPath, ".gitignore"), "utf8")
        return {
            matcher: ignore().add(content),
            canPrune: !content.split(/\r?\n/).some(line => /^\s*!/.test(line))
        }
    } catch (error) {
        if (error.code === "ENOENT") return { matcher: ignore(), canPrune: true }
        throw error
    }
}

function getGitignorePath(rootPath, targetPath) {
    const relative = path.relative(rootPath, targetPath).replace(/\\/g, "/")

    if (!relative || relative.startsWith("../") || relative === "..") return null
    return relative
}

function isIgnored(targetPath, rootPath, rules, isDirectory = false) {
    const relative = getGitignorePath(rootPath, targetPath)
    if (!relative) return false

    return rules.matcher.ignores(isDirectory ? `${relative}/` : relative)
}

module.exports = { loadGitignore, isIgnored }
