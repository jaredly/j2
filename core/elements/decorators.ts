import { Ctx } from '..';
import { noloc } from '../consts';
import * as p from '../grammar/base.parser';
import { Ctx as PCtx } from '../printer/to-pp';
import * as pp from '../printer/pp';
import * as t from '../typed-ast';
import { Expression, Loc } from '../typed-ast';
import { Ctx as ACtx } from '../typing/to-ast';
import { Type } from './type';
import { filterUnresolved } from './base';

export const grammar = `
DecoratedExpression = decorators_drop:(Decorator _)* inner:Apply

Decorator = '@' id:DecoratorId _ '(' _ args:DecoratorArgs? _ ')'
DecoratorId = text:$NamespacedIdText hash:($HashRef / $UnresolvedHash)?
DecoratorArgs = first:LabeledDecoratorArg rest:(_ "," _ LabeledDecoratorArg)* _ ","? 
DecoratorArg = DecType / DecExpr
// DecoratorArg = DecType / DecPat / DecExpr
LabeledDecoratorArg = label:($IdText ":" _)? arg:DecoratorArg 

DecType = ":" _ type_:Type 
// DecPat = "?" __ pattern:Pattern 
DecExpr = expr:Expression 
`;

export type DecoratorDecl = {
    type: 'DecoratorDecl';
    loc: Loc;
};

export type Decorator = {
    type: 'Decorator';
    id: { ref: t.RefKind | t.UnresolvedRef; loc: Loc };
    args: Array<{ label: string | null; arg: DecoratorArg; loc: Loc }>;
    loc: Loc;
};
export type DType = {
    type: 'DType';
    typ: Type;
    loc: Loc;
};

export type DExpr = {
    type: 'DExpr';
    expr: Expression;
    loc: Loc;
};

export type DecoratorArg = DExpr | DType;

export type DecoratedExpression = {
    type: 'DecoratedExpression';
    decorators: Array<Decorator>;
    expr: Expression;
    loc: Loc;
};

export const ToTast = {
    DecoratedExpression(
        expr: p.DecoratedExpression_inner,
        ctx: Ctx,
    ): t.Expression {
        const decorators = expr.decorators.map((d) =>
            ctx.ToTast.Decorator(d, ctx),
        );
        let inner = ctx.ToTast.Expression(expr.inner, ctx);
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
    Decorator(decorator: p.Decorator, ctx: Ctx): Decorator {
        const hash = filterUnresolved(decorator.id.hash?.slice(2, -1));
        const resolved = ctx.resolveDecorator(decorator.id.text, hash);
        return {
            type: 'Decorator',
            id: {
                ref:
                    resolved.length === 1
                        ? resolved[0]
                        : {
                              type: 'Unresolved',
                              text: decorator.id.text,
                              hash,
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
        return {
            label,
            loc,
            arg: ctx.ToTast.DecoratorArg(arg, ctx),
        };
    },
    DecExpr({ expr, loc }: p.DecExpr, ctx: Ctx): t.DExpr {
        return {
            type: 'DExpr',
            expr: ctx.ToTast.Expression(expr, ctx),
            loc: loc,
        };
    },
    DecType({ type_, loc }: p.DecType, ctx: Ctx): t.DType {
        return {
            type: 'DType',
            typ: ctx.ToTast.Type(type_, ctx),
            loc: loc,
        };
    },
};

export const ToAst = {
    DecoratedExpression(
        { type, decorators, expr, loc }: t.DecoratedExpression,
        ctx: ACtx,
    ): p.DecoratedExpression_inner {
        let inner = ctx.ToAst.Expression(expr, ctx);
        if (inner.type === 'DecoratedExpression') {
            return {
                ...inner,
                decorators: decorators
                    .map((d) => ctx.ToAst[d.type](d, ctx))
                    .concat(inner.decorators),
            };
        }
        if (
            inner.type === 'BinOp' ||
            inner.type === 'WithUnary' ||
            inner.type === 'Lambda'
        ) {
            inner = {
                type: 'ParenedExpression',
                items: { type: 'CommaExpr', items: [inner], loc: inner.loc },
                loc: inner.loc,
            };
        }
        return {
            type: 'DecoratedExpression',
            inner,
            loc,
            decorators: decorators.map((d) => ctx.ToAst[d.type](d, ctx)),
        };
    },
    Decorator({ type, id, args, loc }: t.Decorator, ctx: ACtx): p.Decorator {
        return {
            type,
            id:
                id.ref.type === 'Unresolved'
                    ? {
                          type: 'DecoratorId',
                          text: id.ref.text,
                          hash: id.ref.hash ?? '#[:unresolved:]',
                          loc: id.loc,
                      }
                    : {
                          ...ctx.printRef(id.ref, id.loc, 'decorator'),
                          type: 'DecoratorId',
                      },
            args: {
                type: 'DecoratorArgs',
                items: args.map(
                    ({ arg, loc, label }): p.LabeledDecoratorArg => {
                        return {
                            type: 'LabeledDecoratorArg',
                            label,
                            arg: ctx.ToAst.DecoratorArg(arg, ctx),
                            loc,
                        };
                    },
                ),
                loc,
            },
            loc,
        };
    },
    DExpr({ type, expr, loc }: t.DExpr, ctx: ACtx): p.DecExpr {
        return {
            type: 'DecExpr',
            expr: ctx.ToAst.Expression(expr, ctx),
            loc: loc,
        };
    },
    DType({ type, typ, loc }: t.DType, ctx: ACtx): p.DecType {
        return {
            type: 'DecType',
            // @ts-ignore
            type_: ctx.ToAst.Type(typ, ctx),
            loc: loc,
        };
    },
};

export const ToPP = {
    DecoratedExpression(
        { inner, decorators, loc }: p.DecoratedExpression_inner,
        ctx: PCtx,
    ): pp.PP {
        const inn = ctx.ToPP.Expression(inner, ctx);
        return pp.items(
            [
                pp.items(
                    decorators.map((dec) => ctx.ToPP[dec.type](dec, ctx)),
                    loc,
                ),
                inn,
            ],
            loc,
        );
    },
    Decorator({ args, id, loc }: p.Decorator, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.atom('@', loc),
                pp.atom(id.text + (id.hash ?? ''), loc),
                pp.args(
                    args?.items.map((a) => {
                        return pp.items(
                            (a.label
                                ? [
                                      pp.atom(a.label, a.loc),
                                      pp.atom(': ', a.loc),
                                  ]
                                : []
                            ).concat([ctx.ToPP.DecoratorArg(a.arg, ctx)]),
                            a.loc,
                        );
                    }) ?? [],
                    loc,
                ),
                pp.atom(' ', loc),
            ],
            loc,
        );
    },
    DecExpr({ expr, loc }: p.DecExpr, ctx: PCtx): pp.PP {
        return pp.items([ctx.ToPP.Expression(expr, ctx)], loc);
    },
    DecType({ type, type_, loc }: p.DecType, ctx: PCtx): pp.PP {
        return pp.items([pp.atom(':', loc), ctx.ToPP.Type(type_, ctx)], loc);
    },
};
