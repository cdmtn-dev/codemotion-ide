import { EditorView, Decoration, ViewPlugin, ViewUpdate, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect, RangeSetBuilder, Facet } from "@codemirror/state";
import * as babelParser from "@babel/parser";
import traverseImport from "@babel/traverse";

const parse = babelParser.parse;
const traverse: any = (traverseImport as any).default || traverseImport;


const BASE_PLUGINS = [
    "decorators-legacy",
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
    "objectRestSpread",
    "optionalChaining",
    "nullishCoalescingOperator",
    "dynamicImport",
    "topLevelAwait",
];

function parserPlugins({ ts, jsx }: any): any[] {
    const plugins: any[] = [...BASE_PLUGINS];
    if (jsx) plugins.push("jsx");
    if (ts) plugins.push("typescript");
    return plugins;
}

const KIND_PRIORITY = { "keyword": 5, "semantic-class": 4, "function": 3, "func_arg": 2, "constant": 1 };

const BUILTIN_GLOBALS = new Set([
    "Object", "Array", "String", "Number", "Boolean", "Symbol", "BigInt", "Function",
    "Math", "JSON", "Date", "RegExp", "Intl", "WebAssembly", "Reflect", "Proxy",
    "Error", "TypeError", "RangeError", "SyntaxError", "ReferenceError", "EvalError",
    "URIError", "AggregateError",
    "Map", "Set", "WeakMap", "WeakSet", "WeakRef", "FinalizationRegistry",
    "Promise", "ArrayBuffer", "SharedArrayBuffer", "DataView", "Atomics",
    "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array",
    "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array",
    "console", "process", "globalThis", "Buffer",
    "URL", "URLSearchParams", "TextEncoder", "TextDecoder",
    "AbortController", "AbortSignal", "Event", "EventTarget",
]);

function isModuleNamespaceBinding(node) {
    if (!node) return false;
    if (node.type === "ImportDefaultSpecifier" || node.type === "ImportNamespaceSpecifier") return true;
    return node.type === "VariableDeclarator" &&
        node.init && node.init.type === "CallExpression" &&
        node.init.callee && node.init.callee.type === "Identifier" &&
        node.init.callee.name === "require";
}

function pushToken(tokens, node, kind) {
    if (!node || typeof node.start !== "number") return;

    let end;
    if (node.type === "Identifier" && typeof node.name === "string") {
        end = node.start + node.name.length;
    } else if (node.type === "ThisExpression") {
        end = node.end;
    } else if (node.type === "PrivateName" && node.id && typeof node.id.name === "string") {
        end = node.start + 1 + node.id.name.length;
    } else {
        return;
    }

    if (typeof end !== "number" || end <= node.start) return;
    tokens.push({ from: node.start, to: end, kind });
}

function isClassDeclNode(node) {
    if (!node) return false;
    if (node.type === "ClassDeclaration" || node.type === "ClassExpression") return true;
    if (node.type === "VariableDeclarator" && node.init && node.init.type === "ClassExpression") return true;
    return false;
}

function isFunctionInit(node) {
    return node && node.type === "VariableDeclarator" && node.init &&
        (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression");
}

function classifyBinding(binding) {
    const declNode = binding.path && binding.path.node;
    if (isClassDeclNode(declNode)) return "semantic-class";
    if (isModuleNamespaceBinding(declNode)) return "semantic-class";
    if (binding.kind === "param") return "func_arg";
    if (binding.kind === "const") {
        if (isFunctionInit(declNode)) return "function";
        return "constant";
    }
    return null;
}

function collectTokens(ast, tokens) {
    traverse(ast, {
        Scopable(path) {
            const bindings = path.scope.bindings;
            for (const name in bindings) {
                const binding = bindings[name];
                const kind = classifyBinding(binding);
                if (!kind) continue;

                pushToken(tokens, binding.identifier, kind);
                for (const ref of binding.referencePaths) {
                    pushToken(tokens, ref.node, kind);
                }
            }
        },
        ClassMethod(path) {
            const node = path.node;
            if (node.computed || !node.key || node.key.type !== "Identifier") return;
            pushToken(tokens, node.key, node.kind === "constructor" ? "keyword" : "function");
        },
        ClassPrivateMethod(path) {
            const key = path.node.key;
            if (key && key.id) pushToken(tokens, key.id, "function");
        },
        ObjectMethod(path) {
            const node = path.node;
            if (!node.computed && node.key && node.key.type === "Identifier") {
                pushToken(tokens, node.key, "function");
            }
        },
        ObjectProperty(path) {
            const node = path.node;
            if (node.computed || !node.key || node.key.type !== "Identifier") return;
            const value = node.value;
            if (value && (value.type === "ArrowFunctionExpression" || value.type === "FunctionExpression")) {
                pushToken(tokens, node.key, "function");
            }
        },
        ThisExpression(path) {
            pushToken(tokens, path.node, "constant");
        },
        ReferencedIdentifier(path) {
            const name = path.node.name;
            if (!BUILTIN_GLOBALS.has(name)) return;
            if (path.scope.getBinding(name)) return;
            pushToken(tokens, path.node, "semantic-class");
        },
    });
}

function finalizeTokens(tokens) {
    const byStart = new Map();
    for (const token of tokens) {
        const existing = byStart.get(token.from);
        if (!existing || KIND_PRIORITY[token.kind] > KIND_PRIORITY[existing.kind]) {
            byStart.set(token.from, token);
        }
    }

    const sorted = Array.from(byStart.values()).sort((a, b) => a.from - b.from || a.to - b.to);

    const result = [];
    let lastTo = -1;
    for (const token of sorted) {
        if (token.from < lastTo) continue;
        result.push(token);
        lastTo = token.to;
    }
    return result;
}

const MEMBER_TYPES = new Set([
    "ClassMethod", "ClassPrivateMethod",
    "ClassProperty", "ClassPrivateProperty", "PropertyDefinition",
]);

function memberKeyName(key) {
    if (!key) return null;
    if (key.type === "Identifier") return key.name;
    if (key.type === "PrivateName") return key.id && key.id.name;
    if (key.type === "StringLiteral") return key.value;
    if (key.type === "NumericLiteral") return String(key.value);
    return null;
}

function collectConstructorMembers(classPath, info) {
    for (const element of classPath.get("body.body")) {
        if (!element.isClassMethod() || element.node.kind !== "constructor") continue;

        element.traverse({
            AssignmentExpression(assign) {
                const left = assign.node.left;
                if (
                    left.type === "MemberExpression" && !left.computed &&
                    left.object.type === "ThisExpression" &&
                    left.property.type === "Identifier"
                ) {
                    info.members.add(left.property.name);
                }
            },
            CallExpression(call) {
                const callee = call.node.callee;
                if (
                    callee.type === "MemberExpression" &&
                    callee.object.type === "Identifier" && callee.object.name === "Object" &&
                    callee.property.type === "Identifier" && callee.property.name === "assign" &&
                    call.node.arguments[0] && call.node.arguments[0].type === "ThisExpression"
                ) {
                    info.open = true;
                }
            },
        });
    }
}

function analyzeMethods(ast, diagnostics) {
    const localClasses = new Map();
    const prototypeAugmented = new Set();
    const instanceVars = new Map();

    traverse(ast, {
        "ClassDeclaration|ClassExpression"(path) {
            const node = path.node;
            const name = node.id && node.id.name;
            if (!name) return;

            const info = { members: new Set(), superName: null, open: false };

            if (node.superClass) {
                if (node.superClass.type === "Identifier") info.superName = node.superClass.name;
                else info.open = true;
            }

            for (const element of node.body.body) {
                if (element.computed) { info.open = true; continue; }
                if (!MEMBER_TYPES.has(element.type)) continue;
                const key = memberKeyName(element.key);
                if (key) info.members.add(key);
            }

            collectConstructorMembers(path, info);
            localClasses.set(name, info);
        },

        MemberExpression(path) {
            const node = path.node;
            if (
                !node.computed &&
                node.object.type === "Identifier" &&
                node.property.type === "Identifier" && node.property.name === "prototype"
            ) {
                prototypeAugmented.add(node.object.name);
            }
        },

        VariableDeclarator(path) {
            const node = path.node;
            if (
                node.id.type === "Identifier" &&
                node.init && node.init.type === "NewExpression" &&
                node.init.callee.type === "Identifier"
            ) {
                const binding = path.scope.getBinding(node.id.name);
                if (binding) instanceVars.set(binding, node.init.callee.name);
            }
        },
    });

    for (const [name, info] of localClasses) {
        if (prototypeAugmented.has(name)) info.open = true;
        if (info.superName && !localClasses.has(info.superName)) info.open = true;
    }

    const resolveMembers = (name, seen = new Set()) => {
        if (seen.has(name)) return null;
        seen.add(name);

        const info = localClasses.get(name);
        if (!info || info.open) return null;

        const members = new Set(info.members);
        if (info.superName) {
            const inherited = resolveMembers(info.superName, seen);
            if (inherited === null) return null;
            for (const member of inherited) members.add(member);
        }
        return members;
    };

    traverse(ast, {
        CallExpression(path) {
            const callee = path.node.callee;
            if (callee.type !== "MemberExpression" || callee.computed) return;
            if (callee.object.type !== "Identifier" || callee.property.type !== "Identifier") return;

            const binding = path.scope.getBinding(callee.object.name);
            if (!binding || !instanceVars.has(binding)) return;
            if (binding.constantViolations.length > 0) return;

            const className = instanceVars.get(binding);
            const members = resolveMembers(className);
            if (!members) return;

            const method = callee.property.name;
            if (!members.has(method)) {
                diagnostics.push({
                    from: callee.property.start,
                    to: callee.property.end,
                    severity: "error",
                    message: `Property '${method}' does not exist on type '${className}'.`,
                    code: "semantic-2339",
                });
            }
        },
    });
}

function parseCode(code, { ts, jsx }) {
    return parse(code, {
        sourceType: "module",
        errorRecovery: true,
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        allowUndeclaredExports: true,
        plugins: parserPlugins({ ts, jsx }),
    });
}

export function analyze(code, { ts = false, jsx = true } = {}) {
    let ast;
    try {
        ast = parseCode(code, { ts, jsx });
    } catch {
        if (ts) {
            try {
                ast = parseCode(code, { ts, jsx: !jsx });
            } catch {
                return { ok: false, tokens: [], diagnostics: [] };
            }
        } else {
            return { ok: false, tokens: [], diagnostics: [] };
        }
    }

    const tokens = [];
    const diagnostics = [];
    try {
        collectTokens(ast, tokens);
        if (!ts) analyzeMethods(ast, diagnostics);
    } catch {
        return { ok: false, tokens: [], diagnostics: [] };
    }

    return { ok: true, tokens: finalizeTokens(tokens), diagnostics };
}


const MAX_DOC_LENGTH = 200_000;
const DEBOUNCE_MS = 200;
const INITIAL_DELAY_MS = 30;

export const semanticDiagnosticsSink = Facet.define({
    combine: (values) => (values.length ? values[0] : null),
});

const setSemanticDecorations = StateEffect.define<DecorationSet>();

const MARKS = {
    "func_arg": Decoration.mark({ class: "cm-func-arg" }),
    "semantic-class": Decoration.mark({ class: "cm-semantic-class" }),
    "constant": Decoration.mark({ class: "cm-constant" }),
    "keyword": Decoration.mark({ class: "cm-keyword" }),
    "function": Decoration.mark({ class: "cm-function" }),
};

function buildDecorations(tokens) {
    const builder = new RangeSetBuilder<Decoration>();
    for (const token of tokens) builder.add(token.from, token.to, MARKS[token.kind]);
    return builder.finish();
}

const semanticField = StateField.define({
    create: () => Decoration.none,
    update(decorations, tr) {
        decorations = decorations.map(tr.changes);
        for (const effect of tr.effects) {
            if (effect.is(setSemanticDecorations)) decorations = effect.value;
        }
        return decorations;
    },
    provide: (field) => EditorView.decorations.from(field),
});

export function semanticHighlight({ ts = false, jsx = true } = {}) {
    const driver = ViewPlugin.fromClass(class {
        timer: any;
        constructor(view: EditorView) {
            this.timer = null;
            this.schedule(view, INITIAL_DELAY_MS);
        }
        update(update: ViewUpdate) {
            if (update.docChanged) this.schedule(update.view, DEBOUNCE_MS);
        }
        schedule(view: EditorView, delay: number) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => { this.timer = null; this.run(view); }, delay);
        }
        run(view: EditorView) {
            try {
                const code = view.state.doc.toString();
                const sink: any = view.state.facet(semanticDiagnosticsSink);

                if (code.length > MAX_DOC_LENGTH) {
                    view.dispatch({ effects: setSemanticDecorations.of(Decoration.none) });
                    if (sink) sink([]);
                    return;
                }

                const { ok, tokens, diagnostics } = analyze(code, { ts, jsx });
                if (!ok) return;

                view.dispatch({ effects: setSemanticDecorations.of(buildDecorations(tokens)) });
                if (sink) sink(diagnostics);
            } catch (err) {
                console.error("semantic highlight run failed:", err);
            }
        }
        destroy() {
            clearTimeout(this.timer);
        }
    });

    return [semanticField, driver];
}

export const semanticHighlightTheme = EditorView.baseTheme({
    ".cm-func-arg, .cm-func-arg *": { color: "var(--color-func-arg, #9CDCFE) !important" },
    ".cm-semantic-class, .cm-semantic-class *": { color: "var(--color-class, #4EC9B0) !important" },
    ".cm-constant, .cm-constant *": { color: "var(--color-const, #4FC1FF) !important" },
    ".cm-keyword, .cm-keyword *": { color: "var(--color-keyword, #569CD6) !important" },
    ".cm-function, .cm-function *": { color: "var(--color-function, #DCDCAA) !important" },
});
