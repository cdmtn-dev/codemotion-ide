import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { loadGitignore, isIgnored } = require("../../app/main/helpers/gitignore.js")

function loadOsHelper() {
    const electronPath = require.resolve("electron")
    const electronModule = require.cache[electronPath]
    require.cache[electronPath] = { exports: { dialog: {} } }

    try {
        return require("../../app/main/helpers/os.js")
    } finally {
        if (electronModule) require.cache[electronPath] = electronModule
        else delete require.cache[electronPath]
    }
}

test("supports gitignore directory, globstar, and negation rules", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "codemotion-gitignore-"))
    const rules = await fs.writeFile(
        path.join(root, ".gitignore"),
        "node_modules/\n**/*.log\n!important.log\n",
        "utf8"
    ).then(() => loadGitignore(root))

    assert.equal(isIgnored(path.join(root, "node_modules"), root, rules, true), true)
    assert.equal(isIgnored(path.join(root, "node_modules", "package.json"), root, rules), true)
    assert.equal(isIgnored(path.join(root, "logs", "debug.log"), root, rules), true)
    assert.equal(isIgnored(path.join(root, "important.log"), root, rules), false)
    assert.equal(isIgnored(path.join(root, "src", "index.js"), root, rules), false)
    assert.equal(rules.canPrune, false)
})

test("returns an empty matcher when .gitignore is missing", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "codemotion-gitignore-"))
    const rules = await loadGitignore(root)

    assert.equal(isIgnored(path.join(root, "node_modules"), root, rules), false)
    assert.equal(rules.canPrune, true)
})

test("prunes ignored directories instead of reading their contents", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "codemotion-gitignore-"))
    await fs.mkdir(path.join(root, "node_modules", "nested"), { recursive: true })
    await fs.writeFile(path.join(root, ".gitignore"), "node_modules/\n", "utf8")
    await fs.writeFile(path.join(root, "node_modules", "nested", "hidden.js"), "", "utf8")
    await fs.writeFile(path.join(root, "visible.js"), "", "utf8")

    const { readDirTree } = loadOsHelper()
    const entries = await readDirTree(root)
    const ignored = entries.find(entry => entry.name === "node_modules")

    assert.equal(ignored.ignored, true)
    assert.equal(ignored.loaded, false)
    assert.equal(ignored.children, undefined)
})
