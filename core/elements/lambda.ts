import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';
import { Ctx as ICtx } from '../ir/ir';

export const grammar = `
Lambda = "(" _ args:LArgs? _ ")" _ res:(":" _ Type)? _ "=>" _ body:Expression
LArgs = first:LArg rest:(_ "," _ LArg)*
LArg = pat:Pattern typ:(_ ":" _ Type)?
`;

export type Lambda = {
    type: 'Lambda';
    args: LArg[];
    res: t.Type | null;
    body: t.Expression;
    loc: t.Loc;
};

export type LArg = {
    type: 'LArg';
    pat: t.Pattern;
    typ: t.Type | null;
    loc: t.Loc;
};

export type ILambda = {
    type: 'Lambda';
    args: LArg[];
    body: t.IExpression;
    res: t.Type | null;
    loc: t.Loc;
};

export const ToTast = {
    Lambda({ type, args, res, body, loc }: p.Lambda, ctx: TCtx): t.Lambda {
        return {
            type: 'Lambda',
            args:
                args?.items.map((arg) => ({
                    type: 'LArg',
                    pat: ctx.ToTast.Pattern(arg.pat, ctx),
                    typ: arg.typ ? ctx.ToTast.Type(arg.typ, ctx) : null,
                    loc: arg.loc,
                })) ?? [],
            body: ctx.ToTast.Expression(body, ctx),
            res: res ? ctx.ToTast.Type(res, ctx) : null,
            loc,
        };
    },
    // Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
    // },
};

export const ToAst = {
    Lambda({ type, args, res, body, loc }: t.Lambda, ctx: TACtx): p.Lambda {
        return {
            type: 'Lambda',
            args: {
                type: 'LArgs',
                items: args.map((arg) => ({
                    type: 'LArg',
                    pat: ctx.ToAst.Pattern(arg.pat, ctx),
                    typ: arg.typ ? ctx.ToAst.Type(arg.typ, ctx) : null,
                    loc: arg.loc,
                })),
                loc: args.length > 0 ? args[0].loc : loc,
            },
            body: ctx.ToAst.Expression(body, ctx),
            res: res ? ctx.ToAst.Type(res, ctx) : null,
            loc,
        };
    },
};

export const ToPP = {
    Lambda({ type, args, res, body, loc }: p.Lambda, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.args(
                    args?.items.map((arg) =>
                        pp.items(
                            [
                                ctx.ToPP.Pattern(arg.pat, ctx),
                                arg.typ
                                    ? pp.items(
                                          [
                                              pp.atom(': ', arg.loc),
                                              ctx.ToPP.Type(arg.typ, ctx),
                                          ],
                                          arg.loc,
                                      )
                                    : null,
                            ],
                            arg.loc,
                        ),
                    ) ?? [],
                    args?.loc ?? loc,
                ),
                res
                    ? pp.items(
                          [pp.text(':', res.loc), ctx.ToPP.Type(res, ctx)],
                          res.loc,
                      )
                    : null,
                pp.text(' => ', loc),
                ctx.ToPP.Expression(body, ctx),
            ],
            loc,
        );
    },
};

export const ToIR = {
    Lambda({ type, args, res, body, loc }: t.Lambda, ctx: ICtx): t.ILambda {
        return {
            type: 'Lambda',
            args,
            res,
            body: ctx.ToIR.Expression(body, ctx),
            loc,
        };
    },
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
export const ToJS = {
    Lambda({ type, args, res, body, loc }: ILambda, ctx: JCtx): b.Expression {
        return b.arrowFunctionExpression(
            args?.map((arg) => ctx.ToJS.Pattern(arg.pat, ctx)) ?? [],
            ctx.ToJS.IExpression(body, ctx),
        );
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
