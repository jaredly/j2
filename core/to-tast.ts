import {
    Apply_inner,
    P_Apply,
    P_Expression,
    P_File,
    P_Int,
    P_Toplevel,
} from './base.parser';
import { Apply, Expression, Int, Toplevel } from './typed-ast';

export type Ctx = {
    scopes: [];
};

export const ToTast = {
    File: ({ toplevels, loc }: P_File, ctx: Ctx) => {
        return {
            type: 'File',
            loc,
            toplevels: toplevels.map((top) => ToTast.Toplevel(top, ctx)),
        };
    },
    Toplevel(top: P_Toplevel, ctx: Ctx): Toplevel {
        return {
            type: 'ToplevelExpression',
            expr: ToTast.Expression(top, ctx),
            loc: top.loc,
        };
    },
    Expression(expr: P_Expression, ctx: Ctx): Expression {
        return ToTast[expr.type](expr as any, ctx);
    },
    Int({ loc, contents }: P_Int, ctx: Ctx): Int {
        return { type: 'Int', loc, value: +contents };
    },
    Apply({ target, parens }: Apply_inner, ctx: Ctx): Apply {
        let res: Expression = ToTast[target.type](target, ctx);
        while (parens.length) {
            const next = parens.shift()!;
            res = {
                type: 'Apply',
                target: res,
                loc: {
                    start: target.loc.start,
                    end: next.loc.end,
                    idx: next.loc.idx,
                },
                args:
                    next.args?.items.map((item) =>
                        ToTast[item.type](item as any, ctx),
                    ) ?? [],
            };
        }
        return res as Apply;
    },
};
