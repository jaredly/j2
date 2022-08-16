import { transformType, Visitor } from '../../transform-tast';
import { addNewConstraint } from '../../typing/analyze';
import { Ctx } from '../../typing/analyze';
import { ConstraintMap, TDiffs, typeMatches } from '../../typing/typeMatches';
import * as t from '../../typed-ast';
import { inferVarsFromArgs, unifiedTypes } from './apply';

/*

We have a lambda type
<_, _, _> (with bounds)
we have arg types, which reference the type vbls
and we have the types of the args actually passed in.

SO

a vbl for each vbl (with bounds added as constraints, potentially)
and then `applyType` to fill in the type vbls into the expected arg types.
And then do `typeMatches`, collecting constraints on the new vbls.

and there you go! I think?

*/

export const autoTypeApply = (
    node: t.Apply,
    // <A: int, B, C>
    vars: t.TVar[],
    // (a: A, b: B) =>
    args: t.Type[],
    // the args that were passed in
    passedInArgs: t.Type[],
    ctx: Ctx,
): null | { apply: t.Apply; constraints: ConstraintMap } => {
    // Simple version
    const mapping = inferVarsFromArgs(vars, args, ctx);

    if (!mapping) {
        // if (true) {
        //     return null;
        // }
        const symbols: { [num: number]: t.Type } = {};

        const visitor: Visitor<null> = {
            Type_TRef(node, ctx) {
                // Already applied
                if (node.ref.type === 'Local' && symbols[node.ref.sym]) {
                    return symbols[node.ref.sym];
                }
                return null;
            },
        };

        const constraints: ConstraintMap = {};
        const vbls = vars.map((v) => {
            let vbl = ctx.newTypeVar(v.loc);
            if (v.bound) {
                const nc = addNewConstraint(
                    vbl.id,
                    {
                        outer: transformType(v.bound, visitor, null),
                    },
                    constraints,
                    ctx,
                );
                if (nc) {
                    constraints[vbl.id] = nc;
                }
            }
            symbols[v.sym.id] = vbl;
            return vbl;
        });

        // ughhhhh hm ok so,
        // <A, B: A>(a: A, b: B) =>
        // in this case, we've got some transitive constraint dependencies....
        const ok = args.every((arg, i) => {
            if (!passedInArgs[i]) {
                return false;
            }
            const tt = transformType(arg, visitor, null);
            const diffs: TDiffs = [];
            const match = typeMatches(
                passedInArgs[i],
                tt,
                ctx,
                undefined,
                constraints,
                diffs,
            );
            if (!match) {
                console.log(`arg fail ${i}`);
                console.log(diffs);
            }
            return match;
        });
        if (!ok) {
            return null;
        }
        return {
            apply: {
                ...node,
                target: {
                    type: 'TypeApplication',
                    target: node.target,
                    inferred: true,
                    args: vbls,
                    // .map(
                    //     (v) =>
                    //         collapseConstraints(constraints[v.id] ?? {}, ctx),
                    //     // collapseConstraints(ctx.currentConstraints(v.id), ctx),
                    // ),
                    loc: node.target.loc,
                },
            },
            constraints,
        };
    }

    let constraints: ConstraintMap = {};
    for (let arg of vars) {
        if (!arg.bound) {
            continue;
        }
        const idxs = mapping[arg.sym.id];
        if (idxs.length === 1) {
            const argType = passedInArgs[idxs[0]];
        }
        if (
            !typeMatches(
                unifiedTypes(passedInArgs, mapping[arg.sym.id], ctx),
                arg.bound,
                ctx,
                undefined,
                constraints,
            )
        ) {
            return null;
        }
    }
    return {
        apply: {
            ...node,
            target: {
                type: 'TypeApplication',
                target: node.target,
                inferred: true,
                args: vars.map((arg) =>
                    unifiedTypes(passedInArgs, mapping[arg.sym.id], ctx),
                ),
                loc: node.target.loc,
            },
        },
        constraints,
    };
};
