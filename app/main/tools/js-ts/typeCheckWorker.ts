import { parentPort } from "worker_threads";
import path from "path";
import ts from "typescript";

interface TsconfigInfo {
    path: string;
    parsed: ts.ParsedCommandLine;
}

interface Project {
    scriptVersions: Map<string, number>;
    scriptContents: Map<string, string>;
    incrementVersion: () => void;
    languageService: ts.LanguageService;
}

interface FunctionDefinition {
    minArguments: number;
    maxArguments: number;
    hasRestParameter: boolean;
}

interface Scope {
    parent: Scope | null;
    functions: Map<string, FunctionDefinition>;
}

interface Position {
    line: number;
    column: number;
}

interface Diagnostic {
    message: string;
    category: string;
    from: number;
    to: number;
    line: number;
    col: number;
    code?: number;
}

interface CheckMessage {
    id?: any;
    op?: string;
    fileName?: string;
    code?: string;
    offset?: number;
}

interface HoverMember {
    name: string;
    type: string;
    optional: boolean;
}

interface SignaturePart {
    text: string;
    kind: string;
}

interface HoverInfo {
    kind: string;
    signature: string;
    signatureParts: SignaturePart[];
    documentation: string;
    members: HoverMember[] | null;
}

const projects = new Map<string, Project>();

const defaultCompilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    allowJs: true,
    checkJs: true,
    strict: false,
    skipLibCheck: true,
    esModuleInterop: true,
    resolveJsonModule: true,
};

function normalizeFileName(fileName: any): string {
    const resolved = path.resolve(String(fileName || "untitled.ts"));
    return resolved.replace(/\\/g, "/");
}

function findTsconfig(startDir: string): TsconfigInfo | null {
    const configPath = ts.findConfigFile(startDir, ts.sys.fileExists, "tsconfig.json");
    if (!configPath) return null;

    const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
    if (error) return null;

    return {
        path: normalizeFileName(configPath),
        parsed: ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath)),
    };
}

function createProject(config: TsconfigInfo | null, fallbackRoot: string): Project {
    const root = normalizeFileName(config ? path.dirname(config.path) : fallbackRoot);
    const scriptVersions = new Map<string, number>();
    const scriptContents = new Map<string, string>();
    let version = 0;

    const rootFiles = (config?.parsed.fileNames || [])
        .filter((fileName) => /\.d\.ts$/i.test(fileName))
        .map(normalizeFileName);
    const compilerOptions: ts.CompilerOptions = {
        ...defaultCompilerOptions,
        ...(config?.parsed.options || {}),
        allowJs: true,
        checkJs: true,
    };

    const host: ts.LanguageServiceHost = {
        getScriptFileNames: () => Array.from(new Set([...rootFiles, ...scriptVersions.keys()])),
        getScriptVersion: (fileName: string) => String(scriptVersions.get(normalizeFileName(fileName)) || 0),
        getProjectVersion: () => String(version),
        getScriptSnapshot: (fileName: string) => {
            const normalized = normalizeFileName(fileName);
            const override = scriptContents.get(normalized);
            if (override !== undefined) return ts.ScriptSnapshot.fromString(override);

            const contents = ts.sys.readFile(normalized);
            return contents === undefined ? undefined : ts.ScriptSnapshot.fromString(contents);
        },
        getCurrentDirectory: () => root,
        getCompilationSettings: () => compilerOptions,
        getDefaultLibFileName: (options: ts.CompilerOptions) => normalizeFileName(ts.getDefaultLibFilePath(options)),
        fileExists: (fileName: string) => {
            const normalized = normalizeFileName(fileName);
            return scriptContents.has(normalized) || ts.sys.fileExists(normalized);
        },
        readFile: (fileName: string) => {
            const normalized = normalizeFileName(fileName);
            return scriptContents.get(normalized) ?? ts.sys.readFile(normalized);
        },
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
        readDirectory: ts.sys.readDirectory,
        realpath: (fileName: string) => normalizeFileName(ts.sys.realpath!(fileName)),
    };

    return {
        scriptVersions,
        scriptContents,
        incrementVersion: () => { version += 1; },
        languageService: ts.createLanguageService(host, ts.createDocumentRegistry()),
    };
}

const MAX_PROJECTS = 3;

function getProject(fileName: string): Project {
    const directory = path.dirname(fileName);
    const config = findTsconfig(directory);
    const key = config ? `config:${config.path}` : `isolated:${normalizeFileName(directory)}`;

    const existing = projects.get(key);
    if (existing) {
        projects.delete(key);
        projects.set(key, existing);
        return existing;
    }

    while (projects.size >= MAX_PROJECTS) {
        const oldestKey = projects.keys().next().value as string | undefined;
        if (oldestKey === undefined) break;
        try { projects.get(oldestKey)?.languageService.dispose(); } catch {}
        projects.delete(oldestKey);
    }

    const project = createProject(config, directory);
    projects.set(key, project);
    return project;
}

function buildLineTable(code: string): number[] {
    const table = [0];
    for (let index = 0; index < code.length; index += 1) {
        if (code[index] === "\n") table.push(index + 1);
    }
    return table;
}

function offsetToLoc(offset: number, lineTable: number[]): Position {
    let low = 0;
    let high = lineTable.length - 1;

    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (lineTable[middle] <= offset) low = middle;
        else high = middle - 1;
    }

    return { line: low + 1, column: offset - lineTable[low] };
}

function categoryToString(category: ts.DiagnosticCategory): string {
    switch (category) {
        case ts.DiagnosticCategory.Error: return "Error";
        case ts.DiagnosticCategory.Warning: return "Warning";
        default: return "Suggestion";
    }
}

function formatDiagnostic(diagnostic: ts.Diagnostic, lineTable: number[]): Diagnostic {
    const start = diagnostic.start ?? 0;
    const length = diagnostic.length ?? 1;
    const loc = offsetToLoc(start, lineTable);

    return {
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        category: categoryToString(diagnostic.category),
        from: start,
        to: start + Math.max(length, 1),
        line: loc.line,
        col: loc.column,
        code: diagnostic.code,
    };
}

function checkTypeScript(fileName: string, code: string): Diagnostic[] {
    const project = getProject(fileName);
    const nextVersion = (project.scriptVersions.get(fileName) || 0) + 1;

    project.scriptContents.set(fileName, code);
    project.scriptVersions.set(fileName, nextVersion);
    project.incrementVersion();

    const lineTable = buildLineTable(code);
    return project.languageService
        .getSemanticDiagnostics(fileName)
        .map((diagnostic) => formatDiagnostic(diagnostic, lineTable));
}

function isJavaScriptFile(fileName: string): boolean {
    return /\.(?:js|jsx|mjs|cjs|es6)$/i.test(fileName);
}

function createScope(parent: Scope | null = null): Scope {
    return { parent, functions: new Map<string, FunctionDefinition>() };
}

function findFunction(scope: Scope | null, name: string): FunctionDefinition | null {
    for (let current = scope; current; current = current.parent) {
        const definition = current.functions.get(name);
        if (definition) return definition;
    }

    return null;
}

function getFunctionDefinition(node: any): FunctionDefinition {
    const parameters = Array.from(node.parameters || []).filter((parameter: any) => !parameter.modifiers?.some(
        (modifier: any) => modifier.kind === ts.SyntaxKind.ThisKeyword
    ));
    const hasRestParameter = parameters.some((parameter: any) => Boolean(parameter.dotDotDotToken));
    const maxArguments = parameters.length;
    const minArguments = parameters.reduce((minimum: number, parameter: any, index: number) => {
        const optional = Boolean(parameter.questionToken || parameter.initializer || parameter.dotDotDotToken);
        return optional ? minimum : index + 1;
    }, 0);

    return { minArguments, maxArguments, hasRestParameter };
}

function registerScopeDeclarations(statements: any, scope: Scope): void {
    for (const statement of statements) {
        if (ts.isFunctionDeclaration(statement) && statement.name) {
            scope.functions.set(statement.name.text, getFunctionDefinition(statement));
            continue;
        }

        if (!ts.isVariableStatement(statement)) continue;

        for (const declaration of statement.declarationList.declarations) {
            if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
            if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
                scope.functions.set(declaration.name.text, getFunctionDefinition(declaration.initializer));
            }
        }
    }
}

function expectedArgumentsMessage(definition: FunctionDefinition, actualArguments: number): string {
    const expected = definition.hasRestParameter
        ? `${definition.minArguments}+`
        : definition.minArguments === definition.maxArguments
            ? String(definition.minArguments)
            : `${definition.minArguments}-${definition.maxArguments}`;

    return `Expected ${expected} argument${expected === "1" ? "" : "s"}, but got ${actualArguments}.`;
}

function getJavaScriptArgumentDiagnostics(fileName: string, code: string): Diagnostic[] {
    const scriptKind = /\.jsx$/i.test(fileName) ? ts.ScriptKind.JSX : ts.ScriptKind.JS;
    const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, scriptKind);
    const lineTable = buildLineTable(code);
    const diagnostics: Diagnostic[] = [];

    function addArityDiagnostic(node: any, scope: Scope): void {
        if (!ts.isIdentifier(node.expression)) return;

        const definition = findFunction(scope, node.expression.text);
        if (!definition) return;

        const actualArguments = node.arguments.length;
        const hasTooFewArguments = actualArguments < definition.minArguments;
        const hasTooManyArguments = !definition.hasRestParameter && actualArguments > definition.maxArguments;
        if (!hasTooFewArguments && !hasTooManyArguments) return;

        const from = node.getStart(sourceFile);
        const loc = offsetToLoc(from, lineTable);

        diagnostics.push({
            message: expectedArgumentsMessage(definition, actualArguments),
            category: "Warning",
            from,
            to: node.getEnd(),
            line: loc.line,
            col: loc.column,
            code: 2554,
        });
    }

    function visitStatementList(statements: any, parentScope: Scope | null): void {
        const scope = createScope(parentScope);
        registerScopeDeclarations(statements, scope);
        statements.forEach((statement: any) => visitNode(statement, scope));
    }

    function visitFunctionBody(node: any, parentScope: Scope): void {
        if (node.body && ts.isBlock(node.body)) {
            visitStatementList(node.body.statements, parentScope);
        } else if (node.body) {
            visitNode(node.body, createScope(parentScope));
        }
    }

    function visitNode(node: any, scope: Scope): void {
        if (ts.isBlock(node) || ts.isModuleBlock(node)) {
            visitStatementList(node.statements, scope);
            return;
        }

        if (ts.isCallExpression(node)) {
            addArityDiagnostic(node, scope);
        }

        if (ts.isFunctionLike(node)) {
            visitFunctionBody(node, scope);
            return;
        }

        ts.forEachChild(node, (child) => visitNode(child, scope));
    }

    visitStatementList(sourceFile.statements, null);
    return diagnostics;
}

const PRIMITIVE_TYPE_MASK =
    ts.TypeFlags.String | ts.TypeFlags.Number | ts.TypeFlags.Boolean |
    ts.TypeFlags.BigInt | ts.TypeFlags.ESSymbol | ts.TypeFlags.Void |
    ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Never |
    ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.StringLiteral |
    ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Enum |
    ts.TypeFlags.EnumLiteral;

function findNodeAtOffset(node: ts.Node, offset: number, sourceFile: ts.SourceFile): ts.Node | null {
    if (offset < node.getStart(sourceFile) || offset >= node.getEnd()) return null;

    let deepest: ts.Node = node;
    ts.forEachChild(node, (child) => {
        const found = findNodeAtOffset(child, offset, sourceFile);
        if (found) deepest = found;
    });

    return deepest;
}

function isFromDefaultLib(symbol: ts.Symbol | undefined): boolean {
    const declarations = symbol?.declarations || [];
    return declarations.some((declaration) => {
        const declarationFile = declaration.getSourceFile().fileName;
        return /node_modules[\\/]/.test(declarationFile) || /lib\.[^\\/]*\.d\.ts$/i.test(declarationFile);
    });
}

function collectMembers(checker: ts.TypeChecker, type: ts.Type, node: ts.Node): HoverMember[] | null {
    if (!type || (type.flags & PRIMITIVE_TYPE_MASK)) return null;
    if (type.getCallSignatures().length > 0) return null;

    const properties = checker.getPropertiesOfType(type);
    if (!properties.length || properties.length > 60) return null;

    return properties.map((property) => {
        const propertyType = checker.getTypeOfSymbolAtLocation(property, node);
        return {
            name: property.getName(),
            type: checker.typeToString(propertyType, node, ts.TypeFormatFlags.NoTruncation),
            optional: Boolean(property.flags & ts.SymbolFlags.Optional),
        };
    });
}

function getQuickInfo(fileName: string, code: string, offset: number): HoverInfo | null {
    const project = getProject(fileName);
    const nextVersion = (project.scriptVersions.get(fileName) || 0) + 1;

    project.scriptContents.set(fileName, code);
    project.scriptVersions.set(fileName, nextVersion);
    project.incrementVersion();

    const info = project.languageService.getQuickInfoAtPosition(fileName, offset);
    if (!info) return null;

    const displayParts = info.displayParts || [];
    const signature = ts.displayPartsToString(displayParts);
    const signatureParts = displayParts.map((part) => ({ text: part.text, kind: part.kind }));
    const documentation = ts.displayPartsToString(info.documentation || []);

    let members: HoverMember[] | null = null;
    let resolvedType: ts.Type | undefined;

    const program = project.languageService.getProgram();
    const sourceFile = program?.getSourceFile(fileName);

    if (program && sourceFile) {
        const checker = program.getTypeChecker();
        const node = findNodeAtOffset(sourceFile, offset, sourceFile);
        const symbol = node ? checker.getSymbolAtLocation(node) : undefined;

        if (symbol && node && !isFromDefaultLib(symbol)) {
            resolvedType = (symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias))
                ? checker.getDeclaredTypeOfSymbol(symbol)
                : checker.getTypeOfSymbolAtLocation(symbol, node);

            members = collectMembers(checker, resolvedType, node);
        }
    }

    const noExtraInfo = !members && !documentation;
    const isAnyType = Boolean(
        resolvedType &&
        (resolvedType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) &&
        resolvedType.getCallSignatures().length === 0
    );

    const trimmedSignature = signature.trim();
    const isAnySignature =
        /^(any|unknown)$/.test(trimmedSignature) ||
        (/:\s*(any|unknown)$/.test(trimmedSignature) && !trimmedSignature.includes("(") && !trimmedSignature.includes("=>"));

    if (noExtraInfo && (isAnyType || isAnySignature)) {
        return null;
    }

    return { kind: info.kind || "", signature, signatureParts, documentation, members };
}

function getUnusedRanges(fileName: string, code: string): { from: number; to: number }[] {
    const project = getProject(fileName);
    const nextVersion = (project.scriptVersions.get(fileName) || 0) + 1;

    project.scriptContents.set(fileName, code);
    project.scriptVersions.set(fileName, nextVersion);
    project.incrementVersion();

    return project.languageService
        .getSuggestionDiagnostics(fileName)
        .filter((diagnostic) => diagnostic.reportsUnnecessary)
        .map((diagnostic) => {
            const start = diagnostic.start ?? 0;
            return { from: start, to: start + Math.max(diagnostic.length ?? 1, 1) };
        });
}

function checkFile(fileName: any, code: any): Diagnostic[] {
    const normalizedFileName = normalizeFileName(fileName);
    const source = typeof code === "string" ? code : "";

    return isJavaScriptFile(normalizedFileName)
        ? getJavaScriptArgumentDiagnostics(normalizedFileName, source)
        : checkTypeScript(normalizedFileName, source);
}

parentPort?.on("message", ({ id, op, fileName, code, offset }: CheckMessage = {}) => {
    try {
        if (op === "quickInfo") {
            const quickInfo = getQuickInfo(normalizeFileName(fileName), typeof code === "string" ? code : "", Number(offset) || 0);
            parentPort?.postMessage({ id, quickInfo });
            return;
        }

        if (op === "unused") {
            const unused = getUnusedRanges(normalizeFileName(fileName), typeof code === "string" ? code : "");
            parentPort?.postMessage({ id, unused });
            return;
        }

        parentPort?.postMessage({ id, diagnostics: checkFile(fileName, code) });
    } catch (error) {
        if (op === "quickInfo") parentPort?.postMessage({ id, quickInfo: null });
        else if (op === "unused") parentPort?.postMessage({ id, unused: [] });
        else parentPort?.postMessage({ id, diagnostics: [] });
    }
});
