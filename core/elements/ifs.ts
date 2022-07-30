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
import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { iife } from './lets';
import { unifyTypes } from '../typing/unifyTypes';
import { isUnit } from '../typing/getType';
import { getLocals, typeForPattern } from './pattern';

export const grammar = `
If = "if" __ yes:IfYes no:(_ "else" _ Else)?
IfYes = conds:IfConds _ block:Block
IfConds = first:IfCond rest:(_ "," _ IfCond)*
IfCond = Let / Expression
Else = Block / If
`;

export type If = {
    type: 'If';
    yes: IfYes;
    no?: t.Block | If;
    loc: t.Loc;
};

export type IfYes = {
    type: 'IfYes';
    conds: IfCond[];
    block: t.Block;
    loc: t.Loc;
};
export type IfCond = t.Let | t.Expression;

export type IIf = {
    type: 'If';
    // cond: t.IExpression;
    yes: IIfYes;
    no?: t.IBlock | IIf;
    loc: t.Loc;
};
export type IIfYes = {
    type: 'IfYes';
    conds: (t.IExpression | t.ILet)[];
    block: t.IBlock;
    loc: t.Loc;
};

export const ToTast = {
    If(ast: p.If, ctx: TCtx): If {
        const locals: t.Locals = [];

        return {
            type: 'If',
            yes: {
                type: 'IfYes',
                conds: ast.yes.conds.items.map((cond) => {
                    const c = ctx.ToTast.IfCond(cond, ctx);
                    if (c.type === 'Let') {
                        const typ =
                            ctx.getType(c.expr) ?? typeForPattern(c.pat);
                        getLocals(c.pat, typ, locals, ctx);
                    }
                    return c;
                }),
                block: ctx.ToTast.Block(
                    ast.yes.block,
                    ctx.withLocals(locals) as TCtx,
                ),
                loc: ast.loc,
            },
            no: ast.no
                ? ast.no.type === 'Block'
                    ? ctx.ToTast.Block(ast.no, ctx)
                    : ctx.ToTast.If(ast.no, ctx)
                : undefined,
            loc: ast.loc,
        };
    },
    IfCond(ast: p.IfCond, ctx: TCtx): t.Let | t.Expression {
        if (ast.type === 'Let') {
            return ctx.ToTast.Let(ast, ctx);
        }
        return ctx.ToTast.Expression(ast, ctx);
    },
};

export const ToAst = {
    If(node: If, ctx: TACtx): p.If {
        const locals: t.Locals = [];
        return {
            type: 'If',
            yes: {
                type: 'IfYes',
                conds: {
                    type: 'IfConds',
                    items: node.yes.conds.map((cond) => {
                        if (cond.type === 'Let') {
                            const typ =
                                ctx.actx.getType(cond.expr) ??
                                typeForPattern(cond.pat);
                            getLocals(cond.pat, typ, locals, ctx.actx);
                        }
                        return ctx.ToAst.IfCond(cond, ctx);
                    }),
                    loc: node.yes.loc,
                },
                block: ctx.ToAst.Block(node.yes.block, {
                    ...ctx,
                    actx: ctx.actx.withLocals(locals) as ACtx,
                }),
                loc: node.yes.loc,
            },
            no: node.no
                ? node.no.type === 'Block'
                    ? ctx.ToAst.Block(node.no, ctx)
                    : ctx.ToAst.If(node.no, ctx)
                : null,
            loc: node.loc,
        };
    },
    IfCond(ast: t.Let | t.Expression, ctx: TACtx): p.IfCond {
        if (ast.type === 'Let') {
            return ctx.ToAst.Let(ast, ctx);
        }
        return ctx.ToAst.Expression(ast, ctx);
    },
};

export const ToPP = {
    If({ loc, yes, no }: p.If, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('if ', loc),
                // ctx.ToPP.Expression(cond, ctx),
                pp.items(
                    pp.interleave(
                        yes.conds.items.map((cond) =>
                            ctx.ToPP.IfCond(cond, ctx),
                        ),
                        ', ',
                    ),
                    yes.loc,
                ),
                pp.text(' ', loc),
                ctx.ToPP.Block(yes.block, ctx),
                no ? pp.text(' else ', loc) : null,
                no
                    ? no.type === 'Block'
                        ? ctx.ToPP.Block(no, ctx)
                        : ctx.ToPP.If(no, ctx)
                    : null,
            ],
            loc,
        );
    },
    IfCond(ast: p.IfCond, ctx: PCtx): pp.PP {
        if (ast.type === 'Let') {
            return ctx.ToPP.Let(ast, ctx);
        }
        return ctx.ToPP.Expression(ast, ctx);
    },
};

export const ToIR = {
    If(node: t.If, ctx: ICtx): t.IExpression {
        return iife(ctx.ToIR.IfSt(node, ctx), ctx);
    },
    IfSt({ loc, yes, no }: t.If, ctx: ICtx): IIf {
        const locals: t.Locals = [];
        return {
            type: 'If',
            yes: {
                type: 'IfYes',
                conds: yes.conds.map((cond) => {
                    if (cond.type === 'Let') {
                        const typ =
                            ctx.actx.getType(cond.expr) ??
                            typeForPattern(cond.pat);
                        getLocals(cond.pat, typ, locals, ctx.actx);
                    }
                    const c = ctx.ToIR.IfCond(cond, ctx);
                    return c;
                }),
                block: ctx.ToIR.BlockSt(yes.block, {
                    ...ctx,
                    actx: ctx.actx.withLocals(locals) as ACtx,
                }),
                loc: yes.loc,
            },
            no: no
                ? no.type === 'Block'
                    ? ctx.ToIR.BlockSt(no, ctx)
                    : ctx.ToIR.IfSt(no, ctx)
                : undefined,
            loc,
        };
    },
    IfCond(ast: t.Let | t.Expression, ctx: ICtx): t.ILet | t.IExpression {
        if (ast.type === 'Let') {
            return ctx.ToIR.Let(ast, ctx);
        }
        return ctx.ToIR.Expression(ast, ctx);
    },
};

export const and = (conds: b.Expression[]) => {
    let cond: b.Expression = conds.shift()!;
    while (conds.length > 0) {
        cond = b.logicalExpression('&&', cond, conds.shift()!);
    }
    return cond;
};

export const ToJS = {
    IfYes(node: IIfYes, ctx: JCtx): [b.Expression | null, b.Statement] {
        const locals: t.Locals = [];
        const conds = node.conds
            .map((cond) => ctx.ToJS.IfCond(cond, ctx))
            .filter(Boolean) as b.Expression[];
        const lets: t.ILet[] = node.conds.filter(
            (b) => b.type === 'Let',
        ) as t.ILet[];
        lets.forEach((ilet) => {
            getLocals(ilet.pat, ilet.typ, locals, ctx.actx);
        });
        const yes = ctx.ToJS.Block(
            { ...node.block, stmts: [...lets, ...node.block.stmts] },
            { ...ctx, actx: ctx.actx.withLocals(locals) as ACtx },
        );
        if (!conds.length) {
            return [null, yes];
        }
        const cond = and(conds);
        return [cond, yes];
    },
    If(node: IIf, ctx: JCtx): b.Statement {
        const [cond, yes] = ctx.ToJS.IfYes(node.yes, ctx);
        if (!cond) {
            return yes;
        }
        return b.ifStatement(
            cond,
            yes,
            node.no
                ? node.no.type === 'Block'
                    ? ctx.ToJS.Block(node.no, ctx)
                    : ctx.ToJS.If(node.no, ctx)
                : null,
        );
    },
    IfCond(ast: t.ILet | t.IExpression, ctx: JCtx): b.Expression | null {
        if (ast.type === 'Let') {
            return ast.expr
                ? ctx.ToJS.PatternCond(
                      ast.pat,
                      ctx.ToJS.IExpression(ast.expr, ctx),
                      ast.typ,
                      ctx,
                  )
                : null;
        }
        return ctx.ToJS.IExpression(ast, ctx);
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    IfYes(node, ctx) {
        const locals: t.Locals = [];
        node.conds.map((cond) => {
            if (cond.type === 'Let') {
                getLocals(
                    cond.pat,
                    ctx.ctx.getType(cond.expr) ?? typeForPattern(cond.pat),
                    locals,
                    ctx.ctx,
                );
            }
            return cond;
        });
        return [null, { ...ctx, actx: ctx.ctx.withLocals(locals) as ACtx }];
    },
    Expression_If(node, { ctx, hit }) {
        const nu = node;
        let changed = false;
        const locals: t.Locals = [];
        const conds = nu.yes.conds.map((cond) => {
            if (cond.type !== 'Let') {
                const ct = ctx.getType(cond);
                if (ct && !ctx.isBuiltinType(ct, 'bool')) {
                    changed = true;
                    return decorate(cond, 'conditionNotBoolean', hit, ctx, [
                        dtype('found', ct, cond.loc),
                    ]);
                }
            } else {
                getLocals(
                    cond.pat,
                    ctx.getType(cond.expr) ?? typeForPattern(cond.pat),
                    locals,
                    ctx,
                );
            }
            return cond;
        });
        if (changed) {
            node = { ...node, yes: { ...node.yes, conds } };
        }
        const yt = ctx.withLocals(locals).getType(node.yes.block);
        if (yt) {
            if (node.no) {
                const nt = ctx.getType(node.no);
                if (nt && unifyTypes(yt, nt, ctx) === false) {
                    return decorate(node, 'ifBranchesDisagree', hit, ctx, [
                        dtype('yes', yt, node.loc),
                        dtype('no', nt, node.loc),
                    ]);
                }
            } else {
                if (!isUnit(yt)) {
                    return decorate(node, 'argWrongType', hit, ctx);
                }
            }
        }
        return node === nu ? null : node;
    },
};

export function dtype(
    label: string,
    yt: t.Type,
    loc: t.Loc,
): { label: string | null; arg: t.DecoratorArg; loc: t.Loc } {
    return {
        label,
        arg: {
            type: 'DType',
            loc: loc,
            typ: yt,
        },
        loc: loc,
    };
}
