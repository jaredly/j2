import { Ctx } from '.';
import * as p from './base.parser';
import { Apply, Expression, Int, Toplevel } from './typed-ast';

// do I even do builtins?
// or do I just assign them a hash based on something else?
// Library
//

export const ToTast = {
    File({ toplevels, loc }: p.File, ctx: Ctx) {
        return {
            type: 'File',
            loc,
            toplevels: toplevels.map((top) => ToTast.Toplevel(top, ctx)),
        };
    },
    Toplevel(top: p.Toplevel, ctx: Ctx): Toplevel {
        return {
            type: 'ToplevelExpression',
            expr: ToTast.Expression(top, ctx),
            loc: top.loc,
        };
    },
    Expression(expr: p.Expression, ctx: Ctx): Expression {
        return ToTast[expr.type](expr as any, ctx);
    },
    Int({ loc, contents }: p.Int, ctx: Ctx): Int {
        return { type: 'Int', loc, value: +contents };
    },
    Parens({ args }: p.Parens, ctx: Ctx) {
        return args ? ToTast[args.type](args, ctx) : [];
    },
    CommaExpr({ items }: p.CommaExpr, ctx: Ctx) {
        return items.map((item) => ToTast[item.type](item as any, ctx));
    },
    Identifier({ hash, loc, text }: p.Identifier, ctx: Ctx) {
        // ok so here's where rubber meets road, right?
        // like I need to know what Ctx is.
        // hmmmm what if we have a mapping of 'id to type'
        // that can be independent of ... whether it came
        // from builtlin or somethign else.
        //
        const resolved = ctx.resolve(text, hash);
    },
    Apply({ target, parens }: p.Apply_inner, ctx: Ctx): Apply {
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
                args: ToTast[next.type](next, ctx),
            };
        }
        return res as Apply;
    },
};

export const nodeToTast = (node: p.AllTaggedTypes, ctx: Ctx) => {
    return ToTast[node.type](node as any, ctx);
};
