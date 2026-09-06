import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

export function identifierJavaScriptCompletionSource(context: any) {
    const word = context.matchBefore(/\w+/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    let ast;
    try {
        ast = parse(context.state.doc.toString(), {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
    } catch {
        return null;
    }

    const names = new Set();
    (traverse as any)(ast, {
        Identifier(path: any) {
            if (path.isReferencedIdentifier()) return;
            names.add(path.node.name);
        },
        ImportSpecifier(path: any) { names.add(path.node.local.name); },
        ImportDefaultSpecifier(path: any) { names.add(path.node.local.name); },
        FunctionDeclaration(path: any) { if (path.node.id) names.add(path.node.id.name); },
        VariableDeclarator(path: any) { if (path.node.id.name) names.add(path.node.id.name); }
    });

    return {
        from: word.from,
        options: [...names].map(label => ({ label, type: "variable" }))
    };
}