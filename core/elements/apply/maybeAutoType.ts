import { ConstraintMap, typeMatches } from '../../typing/typeMatches';
import * as t from '../../typed-ast';
import { Ctx as TCtx } from '../../typing/to-tast';
import { autoTypeApply } from './autoTypeApply';
import { chooseAutoTypable } from './apply';

export const maybeAutoType = (node: t.Apply, ctx: TCtx): t.Apply => {
    if (node.target.type === 'Ref' && node.target.kind.type === 'Unresolved') {
        const resolved = ctx.resolve(node.target.kind.text, null);
        const auto = chooseAutoTypable(node, node.target, resolved, ctx);
        if (auto) {
            return auto;
        }
    }
    const ttype = ctx.getType(node.target);
    if (ttype?.type === 'TVars' && ttype.inner.type === 'TLambda') {
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (argTypes.every(Boolean)) {
            const auto = autoTypeApply(
                node,
                ttype.args,
                ttype.inner.args.map((t) => t.typ),
                argTypes as t.Type[],
                ctx,
            );
            if (auto) {
                // STOPSHIP(infer)
                Object.keys(auto.constraints).forEach((key) => {
                    ctx.addTypeConstraint(+key, auto.constraints[+key]);
                });
                return auto.apply;
            }
        }
    }

    const inner = ctx.getType(node.target);
    if (inner) {
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        const constraints: ConstraintMap = {};
        if (inner.type === 'TLambda') {
            inner.args.forEach((arg, i) => {
                const at = argTypes[i];
                if (at) {
                    typeMatches(at, arg.typ, ctx, undefined, constraints);
                }
            });
        } else {
            if (argTypes.every(Boolean)) {
                const res = ctx.newTypeVar(node.loc);
                typeMatches(
                    inner,
                    {
                        type: 'TLambda',
                        args: argTypes.map((t) => ({
                            typ: t!,
                            label: '',
                            loc: t!.loc,
                        })),
                        loc: node.loc,
                        result: res,
                    },
                    ctx,
                    undefined,
                    constraints,
                );
            }
        }
        Object.keys(constraints).forEach((key) => {
            ctx.addTypeConstraint(+key, constraints[+key]);
        });
    }

    return node;
};
