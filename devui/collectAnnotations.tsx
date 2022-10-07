import { FullContext } from '../core/ctx';
import { extract } from '../core/ids';
import * as tt from '../core/transform-tast';
import { File, Loc } from '../core/typed-ast';
import {
    localTrackingVisitor,
    LTCtx,
} from '../core/typing/localTrackingVisitor';
import { getType, GTCache } from '../core/typing/getType';
import { maybeExpandTask } from '../core/typing/tasks';
import { typeToString } from './Highlight';

// NOTE: CollectAnnotations is probably not waht you want.
// look for annotationVisitor in full.ts
export const collectAnnotations = (tast: File, ctx: FullContext) => {
    const annotations: { loc: Loc; text: string }[] = [];
    const visitor: tt.Visitor<FullContext & LTCtx> = annotationVisitor(
        annotations,
        {},
    );
    // const allLocals: AllLocals = [];
    tt.transformFile(tast, visitor, { ...ctx, allLocals: annotations });

    // allLocals.forEach((local) => {
    //     // const type = getType(local.type, ctx);
    //     const text = typeToString(local.type, ctx);
    //     annotations.push({ loc: local.sym.loc, text });
    // });
    // console.log('alllocals', allLocals);
    return annotations;
};

export function annotationVisitor(
    annotations: { loc: Loc; text: string }[],
    uses: { [key: string]: true },
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
                    text: `Failed to type check`,
                });
            }
            return null;
        },
        ToplevelLet(node, ctx) {
            node.elements.forEach((el) => {
                const t =
                    el.typ && el.typ.type !== 'TBlank'
                        ? el.typ
                        : ctx.getType(el.expr);
                if (t) {
                    annotations.push({
                        loc: el.loc,
                        text: typeToString(t, ctx),
                    });
                }
            });
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
        TRef(node, ctx) {
            if (node.ref.type === 'Global') {
                const { hash } = extract(node.ref.id);
                uses[hash] = true;
            }
            return null;
        },
        Ref(node, ctx) {
            if (node.kind.type === 'Global') {
                const { hash } = extract(node.kind.id);
                uses[hash] = true;
            }
            //     let text =
            //         node.kind.type === 'Unresolved'
            //             ? 'Unresolved'
            //             : node.kind.type === 'Global'
            //             ? refHash(node.kind)
            //             : node.kind.type === 'Local'
            //             ? `sym=${node.kind.sym}`
            //             : `recur(${node.kind.idx})`;
            //     annotations.push({
            //         loc: node.loc,
            //         text,
            //     });
            //     return null;
            if (node.kind.type === 'Unresolved') {
                annotations.push({
                    loc: node.loc,
                    text: 'Unresolved',
                });
            }
            return null;
        },
    };
}
