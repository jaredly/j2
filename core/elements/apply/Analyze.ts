import { Visitor } from '../../transform-tast';
import * as t from '../../typed-ast';
import { collapseConstraints, Ctx, decorate } from '../../typing/analyze';
import { chooseAutoTypable } from './apply';
import { autoTypeApply } from './autoTypeApply';

import { noloc } from '../../consts';
import { Constraints } from '../../typing/analyze';
import { expandTask } from '../../typing/tasks';
import { TDiffs, typeMatches } from '../../typing/typeMatches';

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    ApplyPost(node, { ctx, hit }) {
        if (
            node.target.type === 'Ref' &&
            node.target.kind.type === 'Unresolved'
        ) {
            const resolved = ctx.resolve(node.target.kind.text, null);
            if (resolved.length > 1) {
                const auto = chooseAutoTypable(
                    node,
                    node.target,
                    resolved,
                    ctx,
                );
                if (auto) {
                    const ttype = ctx.getType(auto.target);
                    if (!ttype || ttype.type !== 'TLambda') {
                        return auto;
                    }
                    let { args } = analyzeArgs(node, ctx, ttype, hit);
                    return { ...auto, args };
                }
            }
            // Check if there are multiples
            return null;
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
                    Object.keys(auto.constraints).forEach((key) => {
                        ctx.addTypeConstraint(+key, auto.constraints[+key]);
                    });
                    const ttype = ctx.getType(auto.apply.target);
                    if (!ttype || ttype.type !== 'TLambda') {
                        return auto.apply;
                    }
                    let { args } = analyzeArgs(node, ctx, ttype, hit);
                    return { ...auto.apply, args };
                }
            }
        }

        return null;
    },
    ExpressionPost_Apply(node, { ctx, hit }) {
        // Otherwise, try to get the type of the target & compare to the args
        let ttype = ctx.getType(node.target);
        if (!ttype) {
            return null;
        }
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (ttype.type === 'TVbl') {
            ttype = collapseConstraints(ctx.currentConstraints(ttype.id), ctx);
        }
        if (ttype.type !== 'TLambda') {
            if (ttype.type === 'TVars') {
                return {
                    ...node,
                    target: decorate(
                        node.target,
                        'needsTypeVariables',
                        hit,
                        ctx,
                    ),
                };
            }
            return decorate(node, 'notAFunction', hit, ctx);
        }
        if (ttype.args.length !== argTypes.length) {
            return decorate(node, 'wrongNumberOfArgs', hit, ctx);
        }
        const atype = ttype;
        const { changed, args } = analyzeArgs(node, ctx, atype, hit);
        return changed ? { ...node, args } : null;
    },
};

export function analyzeArgs(
    node: t.Apply,
    ctx: Ctx,
    atype: t.TLambda,
    hit: {},
) {
    let changed = false;
    const args = node.args.map((arg, i) => {
        let at = ctx.getType(arg);
        if (at == null) {
            return arg;
        }
        // STOPSHIP(infer)
        // if (at.type === 'TVbl') {
        //     at = ctx.addTypeConstraint(at.id, atype.args[i].typ);
        // }
        const constraints: { [key: number]: Constraints } = {};
        const expected = atype.args[i].typ;
        // hmm so 'unconstrained' would be a thing.
        if (!typeMatches(at, expected, ctx, undefined, constraints)) {
            changed = true;
            const taskEnum =
                expected.type === 'TApply' &&
                ctx.isBuiltinType(expected.target, 'Task')
                    ? expandTask(expected.loc, expected.args, ctx)
                    : null;
            // ctx.debugger();
            const diffs: TDiffs = [];
            typeMatches(at, expected, ctx, undefined, undefined, diffs);
            // console.log(`Ok arg ${i}`);
            // console.log(diffs);

            return decorate(arg, 'argWrongType', hit, ctx, [
                {
                    label: 'expected',
                    arg: {
                        type: 'DType',
                        loc: noloc,
                        typ: atype.args[i].typ,
                    },
                    loc: noloc,
                } as t.Decorator['args'][0],
                {
                    label: 'got',
                    arg: {
                        type: 'DType',
                        loc: noloc,
                        typ: at,
                    },
                    loc: noloc,
                } as t.Decorator['args'][0],
                ...(taskEnum
                    ? [
                          {
                              label: 'task',
                              arg: {
                                  type: 'DType',
                                  loc: noloc,
                                  typ: taskEnum,
                              },
                              loc: noloc,
                          } as t.Decorator['args'][0],
                      ]
                    : []),
            ]);
        }
        Object.keys(constraints).forEach((k) => {
            ctx.addTypeConstraint(+k, constraints[+k]);
        });
        return arg;
    });
    return { changed, args };
}
