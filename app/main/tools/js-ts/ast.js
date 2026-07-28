const { ipcMain } = require("electron");
const oxc = require("oxc-parser");

const OXC_LANGUAGES = new Set(["js", "jsx", "ts", "tsx", "dts"]);

function normalizeLanguage(language, fallback = "js") {
    if (typeof language === "boolean") return language ? "ts" : "js";

    const normalized = String(language || "")
        .trim()
        .toLowerCase()
        .replace(/^\./, "");

    if (OXC_LANGUAGES.has(normalized)) return normalized;
    if (["mjs", "cjs", "es6"].includes(normalized)) return "js";
    if (["mts", "cts"].includes(normalized)) return "ts";
    return fallback;
}

function buildLineTable(code) {
    const table = [0];
    for (let index = 0; index < code.length; index++) {
        if (code[index] === "\n") table.push(index + 1);
    }
    return table;
}

function offsetToLoc(offset, lineTable) {
    let low = 0;
    let high = lineTable.length - 1;

    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (lineTable[middle] <= offset) low = middle;
        else high = middle - 1;
    }

    return { line: low + 1, column: offset - lineTable[low] };
}

function getLoc(node, lineTable) {
    if (!(node && Number.isInteger(node.start) && Number.isInteger(node.end))) {
        return null;
    }

    return {
        start: offsetToLoc(node.start, lineTable),
        end: offsetToLoc(node.end, lineTable),
    };
}

function literalToString(node) {
    if (!node) return "";
    if (node.type === "Literal") return String(node.value ?? "");
    return expressionToString(node);
}

function keyToString(node) {
    if (!node) return "";
    if (node.type === "PrivateIdentifier") return `#${node.name || ""}`;
    if (node.type === "Identifier") return node.name || "";
    if (node.type === "Literal") return String(node.value ?? "");
    return expressionToString(node);
}

function importNameToString(node) {
    if (node?.type === "Literal") return node.raw || JSON.stringify(node.value);
    return keyToString(node);
}

function expressionToString(node) {
    if (!node) return "<...>";

    switch (node.type) {
        case "Identifier":
            return node.name || "<...>";
        case "PrivateIdentifier":
            return `#${node.name || ""}`;
        case "ThisExpression":
            return "this";
        case "Super":
            return "super";
        case "Literal":
            return String(node.value ?? "<...>");
        case "MemberExpression":
        case "OptionalMemberExpression": {
            const object = expressionToString(node.object);
            const property = expressionToString(node.property);
            if (node.computed) return `${object}${node.optional ? "?." : ""}[${property}]`;
            return `${object}${node.optional ? "?." : "."}${property}`;
        }
        case "CallExpression":
        case "OptionalCallExpression":
        case "NewExpression":
            return `${node.type === "NewExpression" ? "new " : ""}${expressionToString(node.callee)}(...)`;
        case "ImportExpression":
            return `import(${JSON.stringify(literalToString(node.source))})`;
        case "TSQualifiedName":
            return `${expressionToString(node.left)}.${expressionToString(node.right)}`;
        case "ChainExpression":
        case "ParenthesizedExpression":
        case "TSAsExpression":
        case "TSTypeAssertion":
        case "TSNonNullExpression":
            return expressionToString(node.expression);
        default:
            return node.name || "<...>";
    }
}

function bindingToString(node) {
    if (!node) return "";

    switch (node.type) {
        case "Identifier":
            return node.name || "";
        case "RestElement":
            return `...${bindingToString(node.argument)}`;
        case "AssignmentPattern":
            return bindingToString(node.left);
        case "ArrayPattern":
            return `[${(node.elements || []).map(bindingToString).join(", ")}]`;
        case "ObjectPattern":
            return `{ ${(node.properties || [])
                .map((property) => {
                    if (property?.type === "RestElement") return bindingToString(property);
                    const key = keyToString(property?.key);
                    const value = bindingToString(property?.value);
                    return property?.shorthand || key === value ? key : `${key}: ${value}`;
                })
                .filter(Boolean)
                .join(", ")} }`;
        default:
            return "";
    }
}

function convertNode(node, lineTable) {
    if (!node?.type) return null;

    switch (node.type) {
        case "Program":
            return {
                type: "Program",
                loc: getLoc(node, lineTable),
                body: (node.body || [])
                    .map((child) => convertNode(child, lineTable))
                    .filter(Boolean),
            };

        case "ImportDeclaration":
            return convertImportDeclaration(node, lineTable);
        case "TSImportEqualsDeclaration":
            return convertImportEqualsDeclaration(node, lineTable);
        case "VariableDeclaration":
            return convertVariableDeclaration(node, lineTable);
        case "FunctionDeclaration":
        case "TSDeclareFunction":
            return convertFunctionDeclaration(node, lineTable);
        case "ClassDeclaration":
        case "ClassExpression":
            return convertClass(node, lineTable);
        case "TSInterfaceDeclaration":
            return convertInterface(node, lineTable);
        case "TSTypeAliasDeclaration":
            return convertTypeAlias(node, lineTable);
        case "TSEnumDeclaration":
            return convertEnum(node, lineTable);
        case "TSModuleDeclaration":
            return convertModuleDeclaration(node, lineTable);
        case "ExpressionStatement":
            return convertExpressionStatement(node, lineTable);
        case "IfStatement":
            return convertIfStatement(node, lineTable);
        case "TryStatement":
            return convertTryStatement(node, lineTable);
        case "ForStatement":
        case "ForInStatement":
        case "ForOfStatement":
        case "WhileStatement":
        case "DoWhileStatement":
            return convertLoopStatement(node, lineTable);
        case "SwitchStatement":
            return convertSwitchStatement(node, lineTable);
        case "BlockStatement":
            return {
                type: "BlockStatement",
                loc: getLoc(node, lineTable),
                body: convertBlockBody(node, lineTable),
            };
        case "ExportNamedDeclaration":
        case "ExportDefaultDeclaration":
            return convertExportDeclaration(node, lineTable);
        case "LabeledStatement":
            return {
                type: "LabeledStatement",
                loc: getLoc(node, lineTable),
                body: [convertNode(node.body, lineTable)].filter(Boolean),
            };
        default:
            return {
                type: node.type,
                loc: getLoc(node, lineTable),
            };
    }
}

function convertImportDeclaration(node, lineTable) {
    const importKind = node.importKind || "value";

    return {
        type: "ImportDeclaration",
        source: literalToString(node.source),
        importKind,
        phase: node.phase || null,
        attributes: (node.attributes || []).map((attribute) => ({
            key: importNameToString(attribute.key),
            value: literalToString(attribute.value),
        })),
        specifiers: (node.specifiers || []).map((specifier) => {
            const specifierKind = specifier.importKind || importKind;
            const local = specifier.local?.name || "";

            if (specifier.type === "ImportDefaultSpecifier") {
                return { type: "ImportDefault", name: local, importKind: specifierKind };
            }
            if (specifier.type === "ImportNamespaceSpecifier") {
                return { type: "ImportNamespace", name: local, importKind: specifierKind };
            }

            return {
                type: "ImportSpecifier",
                name: local,
                imported: importNameToString(specifier.imported) || local,
                importKind: specifierKind,
            };
        }),
        loc: getLoc(node, lineTable),
    };
}

function convertImportEqualsDeclaration(node, lineTable) {
    const reference = node.moduleReference;
    const source =
        reference?.type === "TSExternalModuleReference"
            ? literalToString(reference.expression)
            : expressionToString(reference);

    return {
        type: "TSImportEqualsDeclaration",
        id: { name: node.id?.name || "" },
        source,
        importKind: node.importKind || "value",
        loc: getLoc(node, lineTable),
    };
}

function convertVariableDeclaration(node, lineTable) {
    return {
        type: "VariableDeclaration",
        loc: getLoc(node, lineTable),
        declarations: (node.declarations || [])
            .map((declaration) => convertVariableDeclarator(declaration, lineTable))
            .filter(Boolean),
    };
}

function convertVariableDeclarator(node, lineTable) {
    const init = node.init;
    const base = {
        type: "VariableDeclarator",
        id: { name: bindingToString(node.id) },
        typeAnnotation: serializeTypeAnnotation(node.id?.typeAnnotation),
        loc: getLoc(node, lineTable),
    };

    if (init?.type === "ArrowFunctionExpression") {
        return {
            ...base,
            isArrow: true,
            isAsync: Boolean(init.async),
            returnType: serializeTypeAnnotation(init.returnType),
            body: convertFunctionBody(init.body, lineTable),
        };
    }

    if (init?.type === "FunctionExpression") {
        return {
            ...base,
            isFunction: true,
            isAsync: Boolean(init.async),
            returnType: serializeTypeAnnotation(init.returnType),
            body: convertFunctionBody(init.body, lineTable),
        };
    }

    if (init?.type === "ObjectExpression") {
        return {
            ...base,
            isObject: true,
            properties: (init.properties || [])
                .map((property) => convertProperty(property, lineTable))
                .filter(Boolean),
        };
    }

    if (init?.type === "AwaitExpression") {
        return {
            ...base,
            isAwait: true,
            body: [convertAwaitExpression(init, lineTable)].filter(Boolean),
        };
    }

    const child = convertExpressionChild(init, lineTable);
    return child ? { ...base, body: [child] } : base;
}

function convertFunctionDeclaration(node, lineTable) {
    return {
        type: "FunctionDeclaration",
        id: node.id ? { name: node.id.name || "anonymous" } : { name: "anonymous" },
        isAsync: Boolean(node.async),
        returnType: serializeTypeAnnotation(node.returnType),
        loc: getLoc(node, lineTable),
        body: convertFunctionBody(node.body, lineTable),
    };
}

function convertFunctionBody(body, lineTable) {
    if (body?.type === "BlockStatement") return convertBlockBody(body, lineTable);
    return [convertExpressionChild(body, lineTable)].filter(Boolean);
}

function convertClass(node, lineTable) {
    return {
        type: "ClassDeclaration",
        id: { name: node.id?.name || "anonymous" },
        isAbstract: Boolean(node.abstract),
        extends: node.superClass ? [expressionToString(node.superClass)] : [],
        implements: (node.implements || [])
            .map((implementation) => expressionToString(implementation.expression))
            .filter(Boolean),
        loc: getLoc(node, lineTable),
        body: (node.body?.body || [])
            .map((member) => convertClassMember(member, lineTable))
            .filter(Boolean),
    };
}

function convertClassMember(node, lineTable) {
    if (!node?.type) return null;
    const loc = getLoc(node, lineTable);

    if (node.type === "StaticBlock") {
        return { type: "StaticBlock", loc, body: convertBlockBody(node, lineTable) };
    }

    if (node.type === "PropertyDefinition" || node.type === "AccessorProperty") {
        return {
            type: "ClassProperty",
            id: { name: keyToString(node.key) },
            typeAnnotation: serializeTypeAnnotation(node.typeAnnotation),
            isStatic: Boolean(node.static),
            isReadonly: Boolean(node.readonly),
            isAbstract: Boolean(node.abstract),
            isPrivate: node.accessibility === "private" || node.key?.type === "PrivateIdentifier",
            isProtected: node.accessibility === "protected",
            loc,
        };
    }

    if (["MethodDefinition", "TSAbstractMethodDefinition", "TSDeclareMethod"].includes(node.type)) {
        const fn = node.value;
        const isConstructor = node.kind === "constructor";

        return {
            type: "MethodDefinition",
            key: { name: isConstructor ? "constructor" : keyToString(node.key) },
            isConstructor,
            returnType: serializeTypeAnnotation(fn?.returnType),
            typeParams: typeParameterNames(fn?.typeParameters),
            isStatic: Boolean(node.static),
            isAsync: Boolean(fn?.async),
            isOverride: Boolean(node.override),
            isAbstract: Boolean(node.abstract) || node.type === "TSAbstractMethodDefinition",
            isPrivate: node.accessibility === "private" || node.key?.type === "PrivateIdentifier",
            isProtected: node.accessibility === "protected",
            isGetter: node.kind === "get",
            isSetter: node.kind === "set",
            loc,
            body: convertFunctionBody(fn?.body, lineTable),
        };
    }

    if (node.type === "TSIndexSignature") return { type: "IndexSignature", loc };
    return null;
}

function convertInterface(node, lineTable) {
    return {
        type: "InterfaceDeclaration",
        id: { name: node.id?.name || "" },
        extends: (node.extends || [])
            .map((extension) => expressionToString(extension.expression))
            .filter(Boolean),
        loc: getLoc(node, lineTable),
        body: (node.body?.body || [])
            .map((member) => convertInterfaceMember(member, lineTable))
            .filter(Boolean),
    };
}

function convertInterfaceMember(node, lineTable) {
    if (!node?.type) return null;
    const loc = getLoc(node, lineTable);

    if (node.type === "TSMethodSignature") {
        return {
            type: "InterfaceMethod",
            id: { name: keyToString(node.key) },
            returnType: serializeTypeAnnotation(node.returnType),
            isOptional: Boolean(node.optional),
            loc,
        };
    }

    if (node.type === "TSPropertySignature") {
        return {
            type: "InterfaceProperty",
            id: { name: keyToString(node.key) },
            typeAnnotation: serializeTypeAnnotation(node.typeAnnotation),
            isOptional: Boolean(node.optional),
            isReadonly: Boolean(node.readonly),
            loc,
        };
    }

    if (node.type === "TSIndexSignature") return { type: "IndexSignature", loc };
    return null;
}

function convertTypeAlias(node, lineTable) {
    return {
        type: "TypeAlias",
        id: { name: node.id?.name || "" },
        typeParams: typeParameterNames(node.typeParameters),
        loc: getLoc(node, lineTable),
    };
}

function convertEnum(node, lineTable) {
    return {
        type: "EnumDeclaration",
        id: { name: node.id?.name || "" },
        isConst: Boolean(node.const),
        members: (node.members || []).map((member) => ({
            type: "EnumMember",
            id: { name: keyToString(member.id) },
            loc: getLoc(member, lineTable),
        })),
        loc: getLoc(node, lineTable),
    };
}

function convertModuleDeclaration(node, lineTable) {
    const body =
        node.body?.type === "TSModuleBlock" ? node.body.body : node.body ? [node.body] : [];
    return {
        type: "TSModuleDeclaration",
        id: { name: keyToString(node.id) },
        loc: getLoc(node, lineTable),
        body: Array.isArray(body)
            ? body.map((child) => convertNode(child, lineTable)).filter(Boolean)
            : [],
    };
}

function convertProperty(node, lineTable) {
    if (!node?.type || node.type === "SpreadElement") return null;

    const value = node.value;
    const base = {
        loc: getLoc(node, lineTable),
        id: { name: keyToString(node.key) },
    };

    if (node.method || value?.type === "FunctionExpression") {
        return {
            type: "ObjectMethod",
            ...base,
            isAsync: Boolean(value?.async),
            isGetter: node.kind === "get",
            isSetter: node.kind === "set",
            body: convertFunctionBody(value?.body, lineTable),
        };
    }

    if (value?.type === "ArrowFunctionExpression") {
        return {
            type: "Property",
            ...base,
            isArrow: true,
            isAsync: Boolean(value.async),
            body: convertFunctionBody(value.body, lineTable),
        };
    }

    if (value?.type === "ObjectExpression") {
        return {
            type: "Property",
            ...base,
            isObject: true,
            properties: (value.properties || [])
                .map((property) => convertProperty(property, lineTable))
                .filter(Boolean),
        };
    }

    const child = convertExpressionChild(value, lineTable);
    return child ? { type: "Property", ...base, body: [child] } : { type: "Property", ...base };
}

function convertExpressionStatement(node, lineTable) {
    return (
        convertExpressionChild(node.expression, lineTable) || {
            type: "ExpressionStatement",
            loc: getLoc(node, lineTable),
        }
    );
}

function convertExpressionChild(node, lineTable) {
    if (!node?.type) return null;

    switch (node.type) {
        case "CallExpression":
        case "OptionalCallExpression":
        case "NewExpression":
            return convertCallExpression(node, lineTable);
        case "AwaitExpression":
            return convertAwaitExpression(node, lineTable);
        case "AssignmentExpression":
            return convertAssignmentExpression(node, lineTable);
        case "ImportExpression":
            return convertImportExpression(node, lineTable);
        case "ArrowFunctionExpression":
        case "FunctionExpression":
            return {
                type: "FunctionExpression",
                isAsync: Boolean(node.async),
                loc: getLoc(node, lineTable),
                body: convertFunctionBody(node.body, lineTable),
            };
        case "ObjectExpression":
            return {
                type: "ObjectExpression",
                loc: getLoc(node, lineTable),
                properties: (node.properties || [])
                    .map((property) => convertProperty(property, lineTable))
                    .filter(Boolean),
            };
        case "ClassExpression":
            return convertClass(node, lineTable);
        case "ChainExpression":
        case "ParenthesizedExpression":
        case "TSAsExpression":
        case "TSTypeAssertion":
        case "TSNonNullExpression":
            return convertExpressionChild(node.expression, lineTable);
        case "ConditionalExpression":
            return {
                type: "ConditionalExpression",
                loc: getLoc(node, lineTable),
                body: [convertExpressionChild(node.consequent, lineTable)].filter(Boolean),
                alternate: [convertExpressionChild(node.alternate, lineTable)].filter(Boolean),
            };
        case "SequenceExpression":
            return {
                type: "SequenceExpression",
                loc: getLoc(node, lineTable),
                body: (node.expressions || [])
                    .map((expression) => convertExpressionChild(expression, lineTable))
                    .filter(Boolean),
            };
        default:
            return null;
    }
}

function convertCallExpression(node, lineTable) {
    return {
        type: "CallExpression",
        calleeName: `${node.type === "NewExpression" ? "new " : ""}${expressionToString(node.callee)}()`,
        loc: getLoc(node, lineTable),
        args: (node.arguments || [])
            .map((argument) => convertExpressionChild(argument, lineTable))
            .filter(Boolean),
    };
}

function convertAwaitExpression(node, lineTable) {
    return {
        type: "AwaitExpression",
        calleeName:
            node.argument?.type === "CallExpression" ||
            node.argument?.type === "OptionalCallExpression"
                ? `${expressionToString(node.argument.callee)}()`
                : null,
        loc: getLoc(node, lineTable),
        body: [convertExpressionChild(node.argument, lineTable)].filter(Boolean),
    };
}

function convertAssignmentExpression(node, lineTable) {
    return {
        type: "AssignmentExpression",
        assignTarget: expressionToString(node.left),
        loc: getLoc(node, lineTable),
        body: [convertExpressionChild(node.right, lineTable)].filter(Boolean),
    };
}

function convertImportExpression(node, lineTable) {
    return {
        type: "ImportExpression",
        source: literalToString(node.source),
        phase: node.phase || null,
        loc: getLoc(node, lineTable),
    };
}

function convertIfStatement(node, lineTable) {
    const toBlock = (statement) =>
        statement?.type === "BlockStatement" ? statement : { body: statement ? [statement] : [] };

    return {
        type: "IfStatement",
        loc: getLoc(node, lineTable),
        body: convertBlockBody(toBlock(node.consequent), lineTable),
        alternate:
            node.alternate?.type === "IfStatement"
                ? [convertIfStatement(node.alternate, lineTable)]
                : convertBlockBody(toBlock(node.alternate), lineTable),
    };
}

function convertTryStatement(node, lineTable) {
    return {
        type: "TryStatement",
        loc: getLoc(node, lineTable),
        body: convertBlockBody(node.block, lineTable),
        handler: node.handler
            ? {
                  type: "CatchClause",
                  loc: getLoc(node.handler, lineTable),
                  body: convertBlockBody(node.handler.body, lineTable),
              }
            : null,
        finalizer: node.finalizer
            ? {
                  type: "FinallyClause",
                  loc: getLoc(node.finalizer, lineTable),
                  body: convertBlockBody(node.finalizer, lineTable),
              }
            : null,
    };
}

function convertLoopStatement(node, lineTable) {
    return {
        type: node.type,
        loc: getLoc(node, lineTable),
        init: convertNode(node.init, lineTable),
        body: convertBlockBody(
            node.body?.type === "BlockStatement"
                ? node.body
                : { body: node.body ? [node.body] : [] },
            lineTable,
        ),
    };
}

function convertSwitchStatement(node, lineTable) {
    return {
        type: "SwitchStatement",
        loc: getLoc(node, lineTable),
        body: (node.cases || []).flatMap((switchCase) =>
            (switchCase.consequent || [])
                .map((statement) => convertStatement(statement, lineTable))
                .filter(Boolean),
        ),
    };
}

function convertExportDeclaration(node, lineTable) {
    const declaration = convertNode(node.declaration, lineTable);
    return {
        type: "ExportDeclaration",
        loc: getLoc(node, lineTable),
        body: declaration ? [declaration] : [],
    };
}

function convertBlockBody(node, lineTable) {
    if (!(node?.body && Array.isArray(node.body))) return [];
    return node.body.map((statement) => convertStatement(statement, lineTable)).filter(Boolean);
}

function convertStatement(node, lineTable) {
    if (!node?.type) return null;

    if (node.type === "ReturnStatement") {
        return {
            type: "ReturnStatement",
            loc: getLoc(node, lineTable),
            body: [convertExpressionChild(node.argument, lineTable)].filter(Boolean),
        };
    }

    if (node.type === "ThrowStatement") {
        return {
            type: "ThrowStatement",
            loc: getLoc(node, lineTable),
            body: [convertExpressionChild(node.argument, lineTable)].filter(Boolean),
        };
    }

    return convertNode(node, lineTable);
}

function typeParameterNames(typeParameters) {
    return (typeParameters?.params || [])
        .map((parameter) => parameter.name?.name || parameter.name || "")
        .filter(Boolean);
}

function serializeTypeAnnotation(node) {
    if (!node) return null;
    return serializeType(node.type === "TSTypeAnnotation" ? node.typeAnnotation : node);
}

function serializeType(node) {
    if (!node) return null;

    switch (node.type) {
        case "TSStringKeyword":
            return "string";
        case "TSNumberKeyword":
            return "number";
        case "TSBooleanKeyword":
            return "boolean";
        case "TSAnyKeyword":
            return "any";
        case "TSUnknownKeyword":
            return "unknown";
        case "TSNeverKeyword":
            return "never";
        case "TSVoidKeyword":
            return "void";
        case "TSNullKeyword":
            return "null";
        case "TSUndefinedKeyword":
            return "undefined";
        case "TSObjectKeyword":
            return "object";
        case "TSSymbolKeyword":
            return "symbol";
        case "TSBigIntKeyword":
            return "bigint";
        case "TSIntrinsicKeyword":
            return "intrinsic";
        case "TSArrayType":
            return `${serializeType(node.elementType)}[]`;
        case "TSUnionType":
            return (node.types || []).map(serializeType).join(" | ");
        case "TSIntersectionType":
            return (node.types || []).map(serializeType).join(" & ");
        case "TSTypeReference": {
            const parameters = node.typeArguments?.params || node.typeParameters?.params || [];
            const args = parameters.map(serializeType).join(", ");
            const name = expressionToString(node.typeName);
            return args ? `${name}<${args}>` : name;
        }
        case "TSLiteralType":
            return JSON.stringify(node.literal?.value);
        case "TSTupleType":
            return `[${(node.elementTypes || []).map(serializeType).join(", ")}]`;
        case "TSFunctionType": {
            const parameters = (node.params || [])
                .map((parameter) => {
                    const name = bindingToString(parameter);
                    const type = serializeTypeAnnotation(parameter.typeAnnotation);
                    return type ? `${name}: ${type}` : name;
                })
                .join(", ");
            return `(${parameters}) => ${serializeTypeAnnotation(node.returnType)}`;
        }
        case "TSConstructorType":
            return `new (...) => ${serializeTypeAnnotation(node.returnType)}`;
        case "TSParenthesizedType":
            return `(${serializeType(node.typeAnnotation)})`;
        case "TSOptionalType":
            return `${serializeType(node.typeAnnotation)}?`;
        case "TSRestType":
            return `...${serializeType(node.typeAnnotation)}`;
        case "TSConditionalType":
            return `${serializeType(node.checkType)} extends ${serializeType(node.extendsType)} ? ${serializeType(node.trueType)} : ${serializeType(node.falseType)}`;
        case "TSIndexedAccessType":
            return `${serializeType(node.objectType)}[${serializeType(node.indexType)}]`;
        case "TSTypeOperator":
            return `${node.operator} ${serializeType(node.typeAnnotation)}`;
        case "TSInferType":
            return `infer ${serializeType(node.typeParameter)}`;
        case "TSTypePredicate":
            return `${expressionToString(node.parameterName)} is ${serializeTypeAnnotation(node.typeAnnotation)}`;
        case "TSImportType":
            return `import(${JSON.stringify(literalToString(node.argument))})`;
        case "TSMappedType":
            return "{ [K in ...]: ... }";
        case "TSNamedTupleMember":
            return `${keyToString(node.label)}: ${serializeType(node.elementType)}`;
        default:
            return node.type || null;
    }
}

function buildAst(code, language = "js") {
    const lang = normalizeLanguage(language);

    try {
        const result = oxc.parseSync(`file.${lang}`, code, {
            lang,
            sourceType: "unambiguous",
            preserveParens: false,
        });
        return (
            convertNode(result.program, buildLineTable(code)) || {
                type: "Program",
                loc: null,
                body: [],
            }
        );
    } catch (error) {
        console.error("Oxc AST parse error:", error);
        return { type: "Program", loc: null, body: [] };
    }
}

ipcMain.handle("javascript-ast", (_, code, language = "js") =>
    buildAst(code, normalizeLanguage(language, "js")),
);
ipcMain.handle("typescript-ast", (_, code, language = "ts") =>
    buildAst(code, normalizeLanguage(language, "ts")),
);

module.exports = { buildAST: buildAst, normalizeLanguage };
