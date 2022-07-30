import { Visitor } from '../transform-tast';
import { decorate, tdecorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as ICtx } from '../ir/ir';
import { noloc } from '../ctx';
import { makeApply } from './apply';

export const grammar = `
AwaitSuffix = pseudo:"!"
`;

// hello!
export type Await = {
    type: 'Await';
    target: t.Expression;
    loc: t.Loc;
};

export const ToTast = {
    AwaitSuffix(
        suffix: p.AwaitSuffix,
        target: t.Expression,
        ctx: TCtx,
    ): t.Expression {
        return {
            type: 'Await',
            target,
            loc: { ...suffix.loc, start: target.loc.start },
        };
    },
};

export const ToAst = {
    Await({ target, loc }: Await, ctx: TACtx): p.Expression {
        return makeApply(
            ctx.ToAst.Expression(target, ctx),
            {
                type: 'AwaitSuffix',
                pseudo: '!',
                loc,
            },
            loc,
        );
    },
};

export const ToPP = {
    AwaitSuffix(suffix: p.AwaitSuffix, ctx: PCtx): pp.PP {
        return pp.text('!', suffix.loc);
    },
};

export const ToIR = {
    Await({ target, loc }: Await, ctx: ICtx): t.IExpression {
        return {
            type: 'TemplateString',
            loc,
            first: 'no awaits in ir',
            rest: [],
        };
        // return ctx.ToIR.Expression(target, ctx);
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {};

/*

what's my base case?
a lambda, with 

*/

export const reduceAwaits = (expr: t.Lambda, ctx: Ctx): t.Lambda => {
    // console.log('hi', expr.body.type);
    if (expr.body.type === 'Block') {
        if (!expr.body.stmts.some((n) => n.type === 'Await')) {
            return expr;
        }
        console.log(expr.body.stmts.filter((s) => s.type === 'Await'));
        const chunks: {
            stmts: t.Stmt[];
            expr: t.Await;
            pattern?: t.Pattern;
        }[] = [];
        let res: t.Stmt[] = [];
        for (let stmt of expr.body.stmts) {
            if (stmt.type === 'Await') {
                chunks.push({
                    stmts: res,
                    expr: stmt,
                });
                res = [];
                continue;
            }
            if (stmt.type === 'Let' && stmt.expr.type === 'Await') {
                chunks.push({
                    stmts: res,
                    expr: stmt.expr,
                    pattern: stmt.pat,
                });
                res = [];
                continue;
            }
            res.push(stmt);
        }
        console.log('chunks', chunks.slice());
        let inner: t.Block;
        if (
            !res.length &&
            chunks.length &&
            chunks[chunks.length - 1].pattern == null
        ) {
            inner = {
                type: 'Block',
                stmts: [
                    ...chunks[chunks.length - 1].stmts,
                    chunks[chunks.length - 1].expr.target,
                ],
                loc: expr.loc,
            };
            chunks.pop();
        } else {
            const body = res.slice();
            if (body.length) {
                const last = body[body.length - 1];
                if (last.type !== 'Let') {
                    body.pop();
                    body.push({
                        type: 'Enum',
                        tag: 'Return',
                        payload: last,
                        loc: last.loc,
                    });
                } else {
                    body.push({
                        type: 'Enum',
                        tag: 'Return',
                        payload: unit(last.loc),
                        loc: last.loc,
                    });
                }
            } else {
                body.push({
                    type: 'Enum',
                    tag: 'Return',
                    payload: unit(expr.loc),
                    loc: expr.loc,
                });
            }
            inner = {
                type: 'Block',
                stmts: body,
                loc: expr.loc,
            };
        }
        while (chunks.length) {
            const next = chunks.pop()!;
            inner = {
                type: 'Block',
                stmts: [
                    ...next.stmts,
                    {
                        type: 'Apply',
                        target: {
                            type: 'TypeApplication',
                            target: {
                                type: 'Ref',
                                kind: ctx.getBuiltinRef('andThen')!,
                                loc: noloc,
                            },
                            args: [],
                            loc: noloc,
                        },
                        loc: noloc,
                        args: [
                            next.expr.target,
                            {
                                type: 'Lambda',
                                args: [
                                    {
                                        type: 'LArg',
                                        pat: next.pattern || {
                                            type: 'PBlank',
                                            loc: noloc,
                                        },
                                        typ: { type: 'TBlank', loc: noloc },
                                        inferred: true,
                                        loc: noloc,
                                    },
                                ],
                                body: inner,
                                loc: noloc,
                                res: null,
                                resInferred: false,
                            },
                        ],
                    }, //as t.Apply
                ],
                loc: noloc,
            };
        }
        console.log('did', inner);
        // debugger;
        return { ...expr, body: inner };
    }
    return expr;
};

const unit = (loc: t.Loc): t.Record => ({
    type: 'Record',
    items: [],
    loc: loc,
    spreads: [],
});
