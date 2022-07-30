import { Visitor } from '../transform-tast';
import {
    caseLocals,
    decorate,
    ifLocals,
    letLocals,
    tdecorate,
} from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as ICtx } from '../ir/ir';
import { noloc } from '../consts';
import { makeApply } from './apply';
import { inferTaskType, tnever, tunit } from '../typing/tasks';
import { getType } from '../typing/getType';
import { unifyTypes } from '../typing/unifyTypes';

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

const tblank: t.TBlank = { type: 'TBlank', loc: noloc };
/*

what's my base case?
a lambda, with 

*/

// export const

export const awaitExpr = (expr: t.Expression, ctx: Ctx): AwaitChunk | null => {
    switch (expr.type) {
        case 'Await': {
            const res = getType(expr.target, ctx);
            if (!res) {
                return null;
            }
            const asTask = inferTaskType(res, ctx);
            if (asTask) {
                return {
                    expr: expr.target,
                    effects: asTask.args[0],
                    result: asTask.args[1],
                };
            }
            return null;
        }
        case 'Block':
            return awaitBlock(expr, ctx);
        case 'If':
            return awaitIf(expr, ctx);
        case 'Switch':
            return awaitSwitch(expr, ctx);
    }
    return null;
};

export const awaitSwitch = (expr: t.Switch, ctx: Ctx): AwaitChunk | null => {
    const result = ctx.getType(expr);
    if (!result) {
        return null;
    }
    let effects: t.Type[] = [];
    let found = false;
    const cases = expr.cases.map((kase, i) => {
        const ictx = ctx.withLocals(caseLocals(result, kase, ctx)) as Ctx;
        const inner = awaitExpr(kase.expr, ictx);
        if (!inner) {
            return null;
        }
        found = true;
        effects.push(inner.effects);
        return { ...kase, expr: inner.expr };
    });
    if (!found) {
        return null;
    }
    return {
        expr: {
            ...expr,
            cases: cases.map((kase, i) => {
                return (
                    kase ?? {
                        ...expr.cases[i],
                        expr: withReturn(expr.cases[i].expr, ctx),
                    }
                );
            }),
        },
        result,
        effects: {
            type: 'TEnum',
            cases: effects,
            loc: expr.loc,
            open: false,
        },
    };
};

export const awaitIf = (expr: t.If, ctx: Ctx): AwaitChunk | null => {
    const yes = awaitBlock(
        expr.yes.block,
        ctx.withLocals(ifLocals(expr.yes, ctx)) as Ctx,
    );
    const no = expr.no ? awaitExpr(expr.no, ctx) : null;
    if (!yes && !no) {
        return null;
    }
    const result = ctx.getType(expr);
    if (!result) {
        return null;
    }
    if (yes) {
        if (no) {
            // const un = unifyTypes(yes.result, no.result, ctx);
            // if (!un) {
            //     return null;
            // }
            return {
                expr: {
                    ...expr,
                    yes: { ...expr.yes, block: yes.expr as t.Block },
                    no: no.expr as t.If['no'],
                },
                result,
                effects: {
                    type: 'TEnum',
                    loc: expr.loc,
                    cases: [yes.effects, no.effects],
                    open: false,
                },
            };
        }
        return {
            result, // : yes.result,
            effects: yes.effects,
            expr: {
                ...expr,
                yes: {
                    ...expr.yes,
                    block: yes.expr as t.Block,
                },
                no: withReturn(expr.no, ctx) as t.If['no'],
            },
        };
    }
    return {
        result, //: no!.result,
        effects: no!.effects,
        expr: {
            ...expr,
            yes: {
                ...expr.yes,
                block: withReturn(expr.yes.block, ctx) as t.Block,
            },
            no: no!.expr as t.If['no'],
        },
    };
};

export const withReturn = (
    expr: t.Expression | undefined,
    ctx: Ctx,
): t.Expression => {
    if (!expr) {
        return ereturn(noloc);
    }
    switch (expr.type) {
        case 'Block': {
            const stmts = expr.stmts.slice();
            if (stmts.length) {
                const last = stmts[stmts.length - 1];
                if (last.type !== 'Let') {
                    stmts.pop();
                    stmts.push(ereturn(last.loc, last));
                } else {
                    stmts.push(ereturn(last.loc));
                }
            } else {
                stmts.push(ereturn(expr.loc));
            }
            return { ...expr, stmts };
        }
        case 'If': {
            return {
                ...expr,
                yes: {
                    ...expr.yes,
                    block: withReturn(expr.yes.block, ctx) as t.Block,
                },
                no: expr.no
                    ? (withReturn(expr.no, ctx) as t.If['no'])
                    : {
                          type: 'Block',
                          stmts: [ereturn(expr.loc)],
                          loc: expr.loc,
                      },
            };
        }
        case 'Switch': {
            return {
                ...expr,
                cases: expr.cases.map((c) => ({
                    ...c,
                    expr: withReturn(c.expr, ctx),
                })),
            };
        }
    }
    return ereturn(expr.loc, expr);
};

export const ereturn = (loc: t.Loc, payload?: t.Expression | null): t.Enum => ({
    type: 'Enum',
    tag: 'Return',
    payload: payload ?? unit(loc),
    loc: loc,
});

type AwaitChunk = {
    expr: t.Expression;
    effects: t.Type;
    result: t.Type;
};

export const awaitBlock = (expr: t.Block, ctx: Ctx): AwaitChunk | null => {
    const chunks: {
        stmts: t.Stmt[];
        effect: AwaitChunk;
        pattern?: t.Pattern | null;
    }[] = [];
    let stmts: t.Stmt[] = [];

    for (let stmt of expr.stmts) {
        const [expr, pat] =
            stmt.type === 'Let' ? [stmt.expr, stmt.pat] : [stmt, null];
        const res = awaitExpr(expr, ctx);
        if (res) {
            chunks.push({
                stmts,
                effect: res,
                pattern: pat,
            });
            stmts = [];
        } else {
            stmts.push(stmt);
        }
        if (stmt.type === 'Let') {
            ctx = ctx.withLocals(letLocals(stmt, ctx)) as Ctx;
        }
    }

    // Nothing had an await
    if (!chunks.length) {
        return null;
    }

    let inner: AwaitChunk;
    if (!stmts.length && chunks[chunks.length - 1].pattern == null) {
        const { stmts, effect } = chunks.pop()!;
        inner = {
            expr: {
                type: 'Block',
                stmts: [...stmts, effect.expr],
                loc: expr.loc,
            },
            effects: effect.effects,
            result: effect.result,
        };
    } else {
        const body = stmts.slice();
        let result: t.Type;
        if (body.length) {
            const last = body[body.length - 1];
            if (last.type !== 'Let') {
                body.pop();
                body.push(ereturn(last.loc, last));
                result = ctx.getType(last) ?? tblank;
            } else {
                body.push(ereturn(last.loc));
                result = tunit;
            }
        } else {
            body.push(ereturn(expr.loc));
            result = tunit;
        }
        inner = {
            expr: {
                type: 'Block',
                stmts: body,
                loc: expr.loc,
            },
            result,
            effects: tnever,
        };
    }
    while (chunks.length) {
        const {
            stmts,
            effect: { expr, result, effects },
            pattern,
        } = chunks.pop()!;
        // Current inner is B & R2
        inner = {
            result: inner.result,
            effects: {
                type: 'TEnum',
                cases: [effects, inner.effects],
                open: false,
                loc: noloc,
            },
            expr: {
                type: 'Block',
                stmts: [
                    ...stmts,
                    {
                        type: 'Apply',
                        target: {
                            type: 'TypeApplication',
                            target: {
                                type: 'Ref',
                                kind: ctx.getBuiltinRef('andThen')!,
                                loc: noloc,
                            },
                            args: [
                                effects,
                                inner.effects,
                                result,
                                inner.result,
                            ],
                            loc: noloc,
                        },
                        loc: noloc,
                        args: [
                            expr,
                            {
                                type: 'Lambda',
                                args: [
                                    {
                                        type: 'LArg',
                                        pat: pattern || {
                                            type: 'PBlank',
                                            loc: noloc,
                                        },
                                        typ: result,
                                        inferred: true,
                                        loc: noloc,
                                    },
                                ],
                                body: inner.expr,
                                loc: noloc,
                                res: null,
                                resInferred: false,
                            },
                        ],
                    }, //as t.Apply
                ],
                loc: noloc,
            },
        };
    }
    // debugger;
    return inner;
};

// export const reduceAwaits = (expr: t.Lambda, ctx: Ctx): t.Lambda => {
//     // console.log('hi', expr.body.type);
//     if (expr.body.type === 'Block') {
//         if (!expr.body.stmts.some((n) => n.type === 'Await')) {
//             return expr;
//         }
//         console.log(expr.body.stmts.filter((s) => s.type === 'Await'));
//         const chunks: {
//             stmts: t.Stmt[];
//             expr: t.Await;
//             pattern?: t.Pattern;
//         }[] = [];
//         let res: t.Stmt[] = [];
//         for (let stmt of expr.body.stmts) {
//             if (stmt.type === 'Await') {
//                 chunks.push({
//                     stmts: res,
//                     expr: stmt,
//                 });
//                 res = [];
//                 continue;
//             }
//             if (stmt.type === 'Let' && stmt.expr.type === 'Await') {
//                 chunks.push({
//                     stmts: res,
//                     expr: stmt.expr,
//                     pattern: stmt.pat,
//                 });
//                 res = [];
//                 continue;
//             }
//             res.push(stmt);
//         }
//         console.log('chunks', chunks.slice());

//         let inner: t.Block;
//         if (
//             !res.length &&
//             chunks.length &&
//             chunks[chunks.length - 1].pattern == null
//         ) {
//             inner = {
//                 type: 'Block',
//                 stmts: [
//                     ...chunks[chunks.length - 1].stmts,
//                     chunks[chunks.length - 1].expr.target,
//                 ],
//                 loc: expr.loc,
//             };
//             chunks.pop();
//         } else {
//             const body = res.slice();
//             if (body.length) {
//                 const last = body[body.length - 1];
//                 if (last.type !== 'Let') {
//                     body.pop();
//                     body.push({
//                         type: 'Enum',
//                         tag: 'Return',
//                         payload: last,
//                         loc: last.loc,
//                     });
//                 } else {
//                     body.push({
//                         type: 'Enum',
//                         tag: 'Return',
//                         payload: unit(last.loc),
//                         loc: last.loc,
//                     });
//                 }
//             } else {
//                 body.push({
//                     type: 'Enum',
//                     tag: 'Return',
//                     payload: unit(expr.loc),
//                     loc: expr.loc,
//                 });
//             }
//             inner = {
//                 type: 'Block',
//                 stmts: body,
//                 loc: expr.loc,
//             };
//         }
//         while (chunks.length) {
//             const next = chunks.pop()!;
//             inner = {
//                 type: 'Block',
//                 stmts: [
//                     ...next.stmts,
//                     {
//                         type: 'Apply',
//                         target: {
//                             type: 'TypeApplication',
//                             target: {
//                                 type: 'Ref',
//                                 kind: ctx.getBuiltinRef('andThen')!,
//                                 loc: noloc,
//                             },
//                             args: [],
//                             loc: noloc,
//                         },
//                         loc: noloc,
//                         args: [
//                             next.expr.target,
//                             {
//                                 type: 'Lambda',
//                                 args: [
//                                     {
//                                         type: 'LArg',
//                                         pat: next.pattern || {
//                                             type: 'PBlank',
//                                             loc: noloc,
//                                         },
//                                         typ: { type: 'TBlank', loc: noloc },
//                                         inferred: true,
//                                         loc: noloc,
//                                     },
//                                 ],
//                                 body: inner,
//                                 loc: noloc,
//                                 res: null,
//                                 resInferred: false,
//                             },
//                         ],
//                     }, //as t.Apply
//                 ],
//                 loc: noloc,
//             };
//         }
//         console.log('did', inner);
//         // debugger;
//         return { ...expr, body: inner };
//     }
//     return expr;
// };

const unit = (loc: t.Loc): t.Record => ({
    type: 'Record',
    items: [],
    loc: loc,
    spreads: [],
});
