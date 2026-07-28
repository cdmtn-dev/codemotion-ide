import { ViewPlugin, Decoration } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { INITIAL } from "vscode-textmate";
import { scopesToClass } from "./scopeMap.js";

export function textMateHighlighter(grammar) {
    return ViewPlugin.fromClass(class {
        constructor(view) {
            this.grammar = grammar;
            this.cache = new Map();
            this.decorations = Decoration.none;
            this.rebuild(view);
        }

        update(update) {
            if (!this.grammar) return;

            if (update.docChanged) {
                this.invalidate(update);
            }

            if (update.docChanged || update.viewportChanged) {
                this.rebuild(update.view);
            }
        }

        invalidate(update) {
            let firstDirty = Infinity;

            update.changes.iterChangedRanges((_fromA, _toA, fromB) => {
                const line = update.state.doc.lineAt(fromB).number;
                if (line < firstDirty) firstDirty = line;
            });

            if (firstDirty === Infinity) return;

            for (const line of this.cache.keys()) {
                if (line >= firstDirty) this.cache.delete(line);
            }
        }

        stackBefore(view, lineNumber) {
            if (lineNumber <= 1) return INITIAL;

            const prev = this.cache.get(lineNumber - 1);
            if (prev) return prev.stackAfter;

            let start = lineNumber - 1;
            while (start > 1 && !this.cache.has(start - 1)) start--;

            let stack = start === 1 ? INITIAL : this.cache.get(start - 1).stackAfter;

            for (let ln = start; ln < lineNumber; ln++) {
                stack = this.tokenizeLine(view, ln, stack).stackAfter;
            }

            return stack;
        }

        tokenizeLine(view, lineNumber, stackBefore) {
            const line = view.state.doc.line(lineNumber);
            const result = this.grammar.tokenizeLine(line.text, stackBefore ?? INITIAL);

            const entry = {
                text: line.text,
                stackAfter: result.ruleStack,
                tokens: result.tokens
            };

            this.cache.set(lineNumber, entry);
            return entry;
        }

        rebuild(view) {
            const builder = new RangeSetBuilder();

            for (const { from, to } of view.visibleRanges) {
                let pos = from;

                while (pos <= to) {
                    const line = view.state.doc.lineAt(pos);
                    let entry = this.cache.get(line.number);

                    if (!entry || entry.text !== line.text) {
                        const stackBefore = this.stackBefore(view, line.number);
                        entry = this.tokenizeLine(view, line.number, stackBefore);
                    }

                    for (const token of entry.tokens) {
                        if (token.startIndex === token.endIndex) continue;

                        const className = scopesToClass(token.scopes);
                        if (className) {
                            builder.add(
                                line.from + token.startIndex,
                                line.from + token.endIndex,
                                Decoration.mark({ class: className })
                            );
                        }
                    }

                    pos = line.to + 1;
                }
            }

            this.decorations = builder.finish();
        }
    }, {
        decorations: v => v.decorations
    });
}