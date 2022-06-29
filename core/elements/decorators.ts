import { Ctx } from '..';
import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import { Ctx as PCtx } from '../printer/to-pp';
import * as pp from '../printer/pp';
import * as t from '../typed-ast';
import { Expression, Loc } from '../typed-ast';
import { Ctx as ACtx } from '../typing/to-ast';
import { filterUnresolved } from '../typing/to-tast';
import { Type } from './type';

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
        if (arg.type === 'DecExpr') {
            return {
                label,
                loc,
                arg: {
                    type: 'DExpr',
                    expr: ctx.ToTast[arg.expr.type](arg.expr as any, ctx),
                    loc: arg.loc,
                },
            };
        } else {
            return {
                label,
                loc,
                arg: {
                    type: 'DType',
                    typ: ctx.ToTast[arg.type_.type](arg.type_ as any, ctx),
                    loc: arg.loc,
                },
            };
        }
    },
};

export const ToAst = {
    DecoratedExpression(
        { type, decorators, expr, loc }: t.DecoratedExpression,
        ctx: ACtx,
    ): p.DecoratedExpression_inner {
        const inner = ctx.ToAst[expr.type](expr as any, ctx);
        if (inner.type === 'DecoratedExpression') {
            return {
                ...inner,
                decorators: decorators
                    .map((d) => ctx.ToAst[d.type](d, ctx))
                    .concat(inner.decorators),
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
                            arg:
                                arg.type === 'DExpr'
                                    ? {
                                          type: 'DecExpr',
                                          expr: ctx.ToAst[arg.expr.type](
                                              arg.expr as any,
                                              ctx,
                                          ),
                                          loc: arg.loc,
                                      }
                                    : {
                                          type: 'DecType',
                                          // @ts-ignore
                                          type_: ctx.ToAst[arg.typ.type](
                                              arg.typ as any,
                                              ctx,
                                          ),
                                          loc: arg.loc,
                                      },
                            loc,
                        };
                    },
                ),
                loc,
            },
            loc,
        };
    },
};

export const ToPP = {
    DecoratedExpression(
        { inner, decorators, loc }: p.DecoratedExpression_inner,
        ctx: PCtx,
    ): pp.PP {
        const inn = ctx.ToPP[inner.type](inner as any, ctx);
        return pp.items(
            [
                ...decorators.map((dec) => ctx.ToPP[dec.type](dec as any, ctx)),
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
                            ).concat([ctx.ToPP[a.arg.type](a.arg as any, ctx)]),
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
        return pp.items([ctx.ToPP[expr.type](expr as any, ctx)], loc);
    },
    DecType({ type, type_, loc }: p.DecType, ctx: PCtx): pp.PP {
        return pp.items(
            [pp.atom(':', loc), ctx.ToPP[type_.type](type_ as any, ctx)],
            loc,
        );
    },
};
