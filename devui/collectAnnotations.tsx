import { FullContext } from '../core/ctx';
import * as tt from '../core/transform-tast';
import { File, Loc, refHash } from '../core/typed-ast';
import { getType } from '../core/typing/getType';
import { getLocals, Locals } from '../core/elements/pattern';
import { typeToplevelT } from '../core/elements/base';
import { typeToString } from './Highlight';
import { localTrackingVisitor, LTCtx } from '../core/typing/analyze';
import { maybeExpandTask } from '../core/typing/tasks';

export const collectAnnotations = (tast: File, ctx: FullContext) => {
    const annotations: { loc: Loc; text: string }[] = [];
    const visitor: tt.Visitor<FullContext> = annotationVisitor(annotations);
    tt.transformFile(tast, visitor, ctx);
    // console.log(annotations);
    return annotations;
};

export function annotationVisitor(
    annotations: { loc: Loc; text: string }[],
): tt.Visitor<FullContext & LTCtx> {
    return {
        ...(localTrackingVisitor as any as tt.Visitor<FullContext & LTCtx>),
        Expression: (node, ctx) => {
            const t = getType(node, ctx);
            if (t) {
                annotations.push({
                    loc: node.loc,
                    text: typeToString(t, ctx),
                });
            } else {
                annotations.push({
                    loc: node.loc,
                    text: `[no type]`,
                });
            }
            return null;
        },
        Type(node, ctx) {
            let t = ctx.resolveRefsAndApplies(node) ?? node;
            t = maybeExpandTask(t, ctx) ?? t;
            annotations.push({
                loc: node.loc,
                text: typeToString(t, ctx),
            });
            return null;
        },
        Ref(node, ctx) {
            let text =
                node.kind.type === 'Unresolved'
                    ? 'Unresolved'
                    : node.kind.type === 'Global'
                    ? refHash(node.kind)
                    : node.kind.type === 'Local'
                    ? `sym=${node.kind.sym}`
                    : `recur(${node.kind.idx})`;
            annotations.push({
                loc: node.loc,
                text,
            });
            return null;
        },
    };
}
