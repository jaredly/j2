import * as t from '../../typed-ast';
import * as p from '../../grammar/base.parser';
import { Ctx as TCtx } from '../../typing/to-tast';
import { Apply } from './apply';
import { maybeAutoType } from './maybeAutoType';

export const ToTast = {
    Apply(apply: p.Apply_inner, ctx: TCtx): t.Expression {
        let res = ctx.ToTast.Expression(apply.target, ctx);
        const suffixes = apply.suffixes.slice();
        while (suffixes.length) {
            const next = suffixes.shift()!;
            res = ctx.ToTast.Suffix(next, res, ctx);
        }
        return res;
    },
    ArrowSuffix(suffix: p.ArrowSuffix, target: t.Expression, ctx: TCtx): Apply {
        // const
        let nt: t.Expression = ctx.ToTast.Identifier(suffix.name, ctx);
        if (suffix.types) {
            nt = ctx.ToTast.TypeApplicationSuffix(suffix.types, nt, ctx);
        }
        return maybeAutoType(
            {
                type: 'Apply',
                target: nt,
                args: [
                    target,
                    ...(suffix.args?.args?.items.map((arg) =>
                        ctx.ToTast.Expression(arg, ctx),
                    ) ?? []),
                ],
                loc: {
                    ...suffix.loc,
                    start: target.loc.start,
                },
                arrow: true,
            },
            ctx,
        );
    },
    CallSuffix(suffix: p.CallSuffix, target: t.Expression, ctx: TCtx): Apply {
        return maybeAutoType(
            {
                type: 'Apply',
                target,
                args:
                    suffix.args?.items.map((arg) =>
                        ctx.ToTast.Expression(arg, ctx),
                    ) ?? [],
                loc: {
                    ...suffix.loc,
                    start: target.loc.start,
                },
                arrow: false,
            },
            ctx,
        );
    },
};
