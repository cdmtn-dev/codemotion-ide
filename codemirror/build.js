const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "iife",
    globalName: "CodeMirrorBundle",
    outfile: "dist/codemirror.js",
    sourcemap: true,
    minify: false
}).catch(() => process.exit(1));