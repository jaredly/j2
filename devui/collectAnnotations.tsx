import { FullContext } from '../core/ctx';
import * as tt from '../core/transform-tast';
import { File, Loc, refHash } from '../core/typed-ast';
import { getType } from '../core/typing/getType';
import { getLocals, Locals } from '../core/elements/pattern';
import { typeToplevelT } from '../core/elements/base';
import { typeToString } from './Highlight';

export const collectAnnotations = (tast: File, ctx: FullContext) => {
    const annotations: { loc: Loc; text: string }[] = [];
    const visitor: tt.Visitor<FullContext> = annotationVisitor(annotations);
    tt.transformFile(tast, visitor, ctx);
    // console.log(annotations);
    return annotations;
};

export function annotationVisitor(
    annotations: { loc: Loc; text: string }[],
): tt.Visitor<FullContext> {
    return {
        Toplevel(node, ctx) {
            return [
                null,
                ctx.toplevelConfig(typeToplevelT(node, ctx)) as FullContext,
            ];
        },
        TypeAbstraction(node, ctx) {
            return [null, ctx.withLocalTypes(node.items)];
        },
        Lambda(node, ctx) {
            const locals: Locals = [];
            node.args.map((arg) => {
                getLocals(arg.pat, arg.typ, locals, ctx);
            });
            return [null, ctx.withLocals(locals) as FullContext];
        },
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
            return node;
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
