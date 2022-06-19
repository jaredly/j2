import { ConstantsToTast } from '../elements/constants';
import * as p from '../grammar/base.parser';
import * as t from '../typed-ast';

export type Ctx = {
    resolve: (name: string, hash?: string | null) => Array<t.RefKind>;
    resolveType: (name: string, hash?: string | null) => t.RefKind | null;
    ToTast: ToTast;
};

export const makeToTast = (): ToTast => {
    return {
        ...GeneralToTast,
        ...ConstantsToTast,
    };
};

export const GeneralToTast = {
    File({ toplevels, loc, comments }: p.File, ctx: Ctx): t.File {
        // Do we forbid toplevel expressions from having a value?
        // I don't see why we would.
        // We might forbid them from having outstanding effects though.
        // deal with that when it comes
        return {
            type: 'File',
            toplevels: toplevels.map((top) => ctx.ToTast.Toplevel(top, ctx)),
            comments,
            loc,
        };
    },

    Toplevel(top: p.Toplevel, ctx: Ctx): t.Toplevel {
        return {
            type: 'ToplevelExpression',
            expr: ctx.ToTast[top.type](top as any, ctx),
            loc: top.loc,
        };
    },
    DecoratedExpression(
        expr: p.DecoratedExpression_inner,
        ctx: Ctx,
    ): t.Expression {
        const decorators = expr.decorators.map((d) =>
            ctx.ToTast.Decorator(d, ctx),
        );
        let inner = ctx.ToTast[expr.inner.type](expr.inner as any, ctx);
        // Collapse nested decorated expressions
        if (inner.type === 'DecoratedExpression') {
            decorators.push(...inner.decorators);
            inner = inner.expr;
        }
        return {
            type: 'DecoratedExpression',
            decorators,
            expr: inner,
            loc: expr.loc,
        };
    },
    ParenedExpression(expr: p.ParenedExpression, ctx: Ctx): t.Expression {
        return ctx.ToTast[expr.expr.type](expr.expr as any, ctx);
    },
    Decorator(decorator: p.Decorator, ctx: Ctx): t.Decorator {
        return {
            type: 'Decorator',
            id: {
                ref: {
                    type: 'Unresolved',
                    text: decorator.id.text,
                    hash: filterUnresolved(decorator.id.hash?.slice(2, -1)),
                },
                loc: decorator.loc,
            },
            args:
                decorator.args?.items.map((arg) =>
                    ctx.ToTast.LabeledDecoratorArg(arg, ctx),
                ) ?? [],
            loc: decorator.loc,
        };
    },
    LabeledDecoratorArg(
        { arg, label, loc }: p.LabeledDecoratorArg,
        ctx: Ctx,
    ): { loc: p.Loc; label: string | null; arg: t.DecoratorArg } {
        if (arg.type === 'DecExpr') {
            return {
                label,
                loc,
                arg: {
                    type: 'Expr',
                    expr: ctx.ToTast[arg.expr.type](arg.expr as any, ctx),
                    loc: arg.loc,
                },
            };
        } else {
            return {
                label,
                loc,
                arg: {
                    type: 'Type',
                    typ: ctx.ToTast.Type(arg.type_, ctx),
                    loc: arg.loc,
                },
            };
        }
    },
    Type(type: p.Type, ctx: Ctx): t.Type {
        const hash = filterUnresolved(type.hash?.slice(2, -1));
        const resolved = ctx.resolveType(type.text, hash);
        return {
            type: 'TRef',
            ref: resolved ?? {
                type: 'Unresolved',
                text: type.text,
                hash,
            },
            loc: type.loc,
        };
    },
    // Expression(expr: p.Expression, typ: Type | null, ctx: Ctx): Expression {
    //     return ctx.ToTast[expr.type](expr as any, typ, ctx);
    // },
    Identifier({ hash, loc, text }: p.Identifier, ctx: Ctx): t.Expression {
        // ok so here's where rubber meets road, right?
        // like I need to know what Ctx is.
        // hmmmm what if we have a mapping of 'id to type'
        // that can be independent of ... whether it came
        // from builtlin or somethign else.
        //
        hash = filterUnresolved(hash?.slice(2, -1));
        const resolved = ctx.resolve(text, hash);
        if (resolved.length === 1) {
            return { type: 'Ref', loc, kind: resolved[0] };
        }
        return {
            type: 'Ref',
            kind: { type: 'Unresolved', text, hash },
            loc,
        };
    },
    Apply(apply: p.Apply_inner, ctx: Ctx): t.Apply {
        let res = ctx.ToTast[apply.target.type](apply.target as any, ctx);
        while (apply.suffixes.length) {
            const next = apply.suffixes.shift()!;
            res = {
                type: 'Apply',
                args:
                    next.args?.items.map((arg) =>
                        ctx.ToTast[arg.type](arg as any, ctx),
                    ) ?? [],
                target: res,
                loc: {
                    start: apply.loc.start,
                    end: next.loc.end,
                    idx: next.loc.idx,
                },
            };
        }
        return res as t.Apply;
    },
};

export type ToTast = typeof ConstantsToTast & typeof GeneralToTast;

const filterUnresolved = (v: string | null | undefined) =>
    v == null || v === ':unresolved:' ? null : v;
