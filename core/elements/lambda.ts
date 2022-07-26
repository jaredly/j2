import { Visitor } from '../transform-tast';
import { decorate, tdecorate } from '../typing/analyze';
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
    resInferred: boolean;
    body: t.Expression;
    loc: t.Loc;
};

export type LArg = {
    type: 'LArg';
    pat: t.Pattern;
    typ: t.Type;
    inferred: boolean;
    loc: t.Loc;
};

export type ILambda = {
    type: 'Lambda';
    args: LArg[];
    body: t.IExpression | t.IBlock;
    resInferred: boolean;
    res: t.Type | null;
    loc: t.Loc;
};

/*
((a, _): (int, float)) => ...
pattern comes back with 'a' is a thing
but we don't have a bound on it yet
and like
ok so maybe Pattern to-ast needs to be
...
accompanied by ...

so ... I've been thinking about
having a setup
where you can manipulate the tast
and then re-run the analyze stuff
and have it all work out.
also, getType isn't reifying anything,
it's just crawling the tree.
How does that change, when we have these
local variables and stuff.

*/

export const ToTast = {
    Lambda({ type, args, res, body, loc }: p.Lambda, ctx: TCtx): t.Lambda {
        const locals: Locals = [];
        const targs: Lambda['args'] =
            args?.items.map((arg) => {
                const pat = ctx.ToTast.Pattern(arg.pat, ctx);
                const typ = arg.typ
                    ? ctx.ToTast.Type(arg.typ, ctx)
                    : typeForPattern(pat, ctx);
                getLocals(pat, typ, locals, ctx);
                if (!arg.typ) {
                    ctx.addTypeConstraint(
                        (typ as t.TVbl).id,
                        typeForPattern(pat),
                    );
                }
                return {
                    type: 'LArg',
                    pat,
                    typ,
                    loc: arg.loc,
                    inferred: !arg.typ,
                };
            }) ?? [];
        ctx = ctx.withLocals(locals) as TCtx;
        const tbody = ctx.ToTast.Expression(body, ctx);
        // console.log(tbody);
        const tres =
            res && res.type !== 'TBlank' ? ctx.ToTast.Type(res, ctx) : null; //ctx.getType(tbody);
        return {
            type: 'Lambda',
            args: targs,
            body: tbody,
            res: tres?.type === 'TBlank' ? null : tres,
            resInferred: !res,
            loc,
        };
    },
};

export const ToAst = {
    Lambda(
        { type, args, res, resInferred, body, loc }: t.Lambda,
        ctx: TACtx,
    ): p.Lambda {
        return {
            type: 'Lambda',
            args: {
                type: 'LArgs',
                items: args.map((arg) => ({
                    type: 'LArg',
                    pat: ctx.ToAst.Pattern(arg.pat, ctx),
                    typ:
                        arg.typ && !arg.inferred
                            ? ctx.ToAst.Type(arg.typ, ctx)
                            : null,
                    loc: arg.loc,
                })),
                loc: args.length > 0 ? args[0].loc : loc,
            },
            body: ctx.ToAst.Expression(body, ctx),
            res: res && !resInferred ? ctx.ToAst.Type(res, ctx) : null,
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
    Lambda(
        { type, args, resInferred, res, body, loc }: t.Lambda,
        ctx: ICtx,
    ): t.ILambda {
        // hmm so if there are argssss
        return {
            type: 'Lambda',
            args,
            res,
            body:
                body.type === 'Block'
                    ? ctx.ToIR.BlockSt(body, ctx)
                    : body.type === 'Switch'
                    ? {
                          type: 'Block',
                          stmts: [ctx.ToIR.SwitchSt(body, ctx)],
                          loc: body.loc,
                      }
                    : ctx.ToIR.Expression(body, ctx),
            resInferred,
            loc,
        };
    },
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import {
    getLocals,
    Locals,
    typeForPattern,
    typeMatchesPattern,
} from './pattern';
import { dtype } from './ifs';

export const ToJS = {
    Lambda({ type, args, res, body, loc }: ILambda, ctx: JCtx): b.Expression {
        return b.arrowFunctionExpression(
            args?.map((arg) => ctx.ToJS.Pattern(arg.pat, ctx)) ?? [],
            body.type === 'Block'
                ? ctx.ToJS.Block(body, ctx)
                : ctx.ToJS.IExpression(body, ctx),
        );
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    Lambda(node, ctx) {
        // idk I'm sure there's stuff
        const locals: Locals = [];

        let changed = false;
        const args = node.args.map((arg) => {
            getLocals(arg.pat, arg.typ, locals, ctx.ctx);
            // console.log('check it', arg.pat, arg.typ);
            if (!typeMatchesPattern(arg.pat, arg.typ, ctx.ctx)) {
                // console.log('hup hit it');
                changed = true;
                return { ...arg, typ: tdecorate(arg.typ, 'argWrongType', ctx) };
            }
            return arg;
        });
        if (node.res) {
            const res = ctx.ctx.getType(node.body);
            if (res && !typeMatches(res, node.res, ctx.ctx)) {
                changed = true;
                node = {
                    ...node,
                    res: tdecorate(node.res, 'resMismatch', ctx, [
                        dtype('inferrred', res, node.res.loc),
                    ]),
                };
            }
        }
        return [
            changed ? { ...node, args } : null,
            { ...ctx, ctx: ctx.ctx.withLocals(locals) as ACtx },
        ];
    },
};
