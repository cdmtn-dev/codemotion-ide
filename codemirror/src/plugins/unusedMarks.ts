import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";

export const setUnusedMarks = StateEffect.define<any[]>();

const unusedMark = Decoration.mark({ class: "cm-unused" });

function buildUnusedDecorations(ranges, docLength) {
    const sorted = (ranges || [])
        .map((range) => ({
            from: Math.max(0, Math.min(Number(range.from), docLength)),
            to: Math.max(0, Math.min(Number(range.to), docLength)),
        }))
        .filter((range) => Number.isFinite(range.from) && Number.isFinite(range.to) && range.to > range.from)
        .sort((a, b) => a.from - b.from || a.to - b.to);

    const builder = new RangeSetBuilder<Decoration>();
    let lastTo = -1;
    for (const range of sorted) {
        if (range.from < lastTo) continue;
        builder.add(range.from, range.to, unusedMark);
        lastTo = range.to;
    }
    return builder.finish();
}

export const unusedMarksField = StateField.define({
    create: () => Decoration.none,
    update(decorations, tr) {
        decorations = decorations.map(tr.changes);
        for (const effect of tr.effects) {
            if (effect.is(setUnusedMarks)) {
                decorations = buildUnusedDecorations(effect.value, tr.state.doc.length);
            }
        }
        return decorations;
    },
    provide: (field) => EditorView.decorations.from(field),
});

export function applyUnusedMarks(view, ranges) {
    view.dispatch({ effects: setUnusedMarks.of(Array.isArray(ranges) ? ranges : []) });
}

export const unusedMarksTheme = EditorView.baseTheme({
    ".cm-unused, .cm-unused *": { opacity: "0.8" },
});
