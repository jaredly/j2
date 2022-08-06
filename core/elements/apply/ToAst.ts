import { typeMatches } from '../../typing/typeMatches';
import * as t from '../../typed-ast';
import * as p from '../../grammar/base.parser';
import { Ctx as TACtx } from '../../typing/to-ast';
import { autoTypeApply } from './autoTypeApply';
import { Apply } from './apply';
import { makeApply } from './makeApply';

export const ToAst = {
    Apply({ target, args, loc, arrow }: Apply, ctx: TACtx): p.Expression {
        if (target.type === 'TypeApplication' && target.inferred) {
            const ttype = ctx.actx.getType(target.target);
            const argTypes = args.map((arg) => ctx.actx.getType(arg));
            if (
                argTypes.every(Boolean) &&
                ttype?.type === 'TVars' &&
                ttype.inner.type === 'TLambda'
            ) {
                const auto = autoTypeApply(
                    {
                        type: 'Apply',
                        loc,
                        args,
                        target: target.target,
                        arrow: false,
                    },
                    ttype.args,
                    ttype.inner.args.map((t) => t.typ),
                    argTypes as t.Type[],
                    ctx.actx,
                );
                if (auto) {
                    const targs = (auto.apply.target as t.TypeApplication).args;
                    Object.keys(auto.constraints).forEach((key) => {
                        ctx.actx.addTypeConstraint(
                            +key,
                            auto.constraints[+key],
                        );
                    });
                    if (
                        targs.length === target.args.length &&
                        targs.every(
                            (targ, i) =>
                                typeMatches(targ, target.args[i], ctx.actx) &&
                                typeMatches(target.args[i], targ, ctx.actx),
                        )
                    ) {
                        // STOPSHIP(infer)
                        return makeApply(
                            ctx.ToAst.Expression(target.target, ctx),
                            {
                                type: 'CallSuffix',
                                args: {
                                    type: 'CommaExpr',
                                    items: args.map((a) =>
                                        ctx.ToAst.Expression(a, ctx),
                                    ),
                                    loc,
                                },
                                loc,
                            },
                            loc,
                            ctx.showIds,
                            arrow,
                        );
                    }
                }
            }
        }

        return makeApply(
            ctx.ToAst.Expression(target, ctx),
            {
                type: 'CallSuffix',
                args: {
                    type: 'CommaExpr',
                    items: args.map((a) => ctx.ToAst.Expression(a, ctx)),
                    loc,
                },
                loc,
            },
            loc,
            ctx.showIds,
            arrow,
        );
    },
};
