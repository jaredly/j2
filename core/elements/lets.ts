import * as p from '../grammar/base.parser';
import { Ctx as ICtx } from '../ir/ir';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { transformIBlock, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx as ACtx, decorate, pdecorate } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { getLocals, typeForPattern, typeMatchesPattern } from './pattern';

export const grammar = `
Block = "{" _ stmts:Stmts? _ "}"
Stmts = first:Stmt rest:( _nonnewline ';'? _nonnewline '\n' _ Stmt)* _ ';'?
Stmt = Let / Expression
Let = "let" _ pat:Pattern _ "=" _ expr:Expression

ToplevelLet = "let" _ first:LetPair rest:(__ "and" __ LetPair)*
LetPair = name:$IdText typ:(_ ":" _ Type)? _ "=" _ expr:Expression
`;

export type Block = {
    type: 'Block';
    stmts: Stmt[];
    loc: t.Loc;
};
export type Stmt = Let | t.Expression;
export type Let = {
    type: 'Let';
    pat: t.Pattern;
    expr: t.Expression;
    loc: t.Loc;
};

export type IBlock = {
    type: 'Block';
    stmts: IStmt[];
    loc: t.Loc;
};
export type IStmt =
    | ILet
    | IAssign
    | t.IExpression
    | IBlock
    | IReturn
    | IIf
    | ISwitch;
export type IReturn = { type: 'Return'; expr: t.IExpression; loc: t.Loc };
export type ILet = {
    type: 'Let';
    pat: t.Pattern;
    expr?: t.IExpression;
    typ: t.Type;
    loc: t.Loc;
};
export type IAssign = {
    type: 'Assign';
    pat: t.Pattern;
    expr: t.IExpression;
    typ: t.Type;
    loc: t.Loc;
};

export const ToTast = {
    Block(node: p.Block, ctx: TCtx): Block {
        return {
            type: 'Block',
            stmts:
                node.stmts?.items.map((stmt) => {
                    const res = ctx.ToTast.Stmt(stmt, ctx);
                    if (res.type === 'Let') {
                        const locals: t.Locals = [];
                        // ctx.debugger();
                        const typ =
                            ctx.getType(res.expr) ??
                            typeForPattern(res.pat, ctx, (loc) =>
                                ctx.newTypeVar(loc),
                            );
                        getLocals(res.pat, typ, locals, ctx);
                        ctx = ctx.withLocals(locals) as TCtx;
                    }
                    return res;
                }) ?? [],
            loc: node.loc,
        };
    },
    Let(node: p.Let, ctx: TCtx): Let {
        return {
            type: 'Let',
            pat: ctx.ToTast.Pattern(node.pat, ctx),
            expr: ctx.ToTast.Expression(node.expr, ctx),
            loc: node.loc,
        };
    },
};

export const ToAst = {
    Block(node: Block, ctx: TACtx): p.Block {
        return {
            type: 'Block',
            stmts: node.stmts.length
                ? {
                      type: 'Stmts',
                      items: node.stmts.map((stmt, i) => {
                          if (stmt.type === 'Let') {
                              const locals: t.Locals = [];
                              const typ =
                                  ctx.actx.getType(stmt.expr) ??
                                  typeForPattern(stmt.pat, ctx.actx);
                              getLocals(stmt.pat, typ, locals, ctx.actx);
                              ctx = {
                                  ...ctx,
                                  actx: ctx.actx.withLocals(locals) as TCtx,
                              };
                          }

                          return ctx.ToAst.Stmt(stmt, ctx);
                      }),
                      loc: node.loc,
                  }
                : null,
            loc: node.loc,
        };
    },
    Let(node: Let, ctx: TACtx): p.Let {
        return {
            type: 'Let',
            pat: ctx.ToAst.Pattern(node.pat, ctx),
            expr: ctx.ToAst.Expression(node.expr, ctx),
            loc: node.loc,
        };
    },
    ToplevelLet(top: t.ToplevelLet, ctx: TACtx): p.ToplevelLet {
        const tt = typeToplevelT(top, ctx.actx);
        ctx = ctx.withToplevel(tt);
        ctx.actx = ctx.actx.toplevelConfig(tt);
        return {
            type: 'ToplevelLet',
            items: top.elements.map((el) => ({
                type: 'LetPair',
                typ: el.typ ? ctx.ToAst.Type(el.typ, ctx) : null,
                name: el.name,
                expr: ctx.ToAst.Expression(el.expr, ctx),
                loc: el.loc,
            })),
            loc: top.loc,
        };
    },
};

export const ToPP = {
    Block(node: p.Block, ctx: PCtx): pp.PP {
        return pp.block(
            node.stmts?.items.map((stmt) => ctx.ToPP.Stmt(stmt, ctx)) ?? [],
            node.loc,
        );
    },
    Let(node: p.Let, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('let ', node.loc),
                ctx.ToPP.Pattern(node.pat, ctx),
                pp.text(' = ', node.loc),
                ctx.ToPP.Expression(node.expr, ctx),
            ],
            node.loc,
        );
    },
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const ToIR = {
    BlockSt(expr: t.Expression, ctx: ICtx): IBlock {
        const node =
            expr.type === 'Block'
                ? expr
                : {
                      type: 'Block',
                      stmts: [expr],
                      loc: expr.loc,
                  };
        return {
            type: 'Block',
            stmts: node.stmts
                .map((stmt, i): t.IStmt[] => {
                    if (i < node.stmts.length - 1 || stmt.type === 'Let') {
                        return flatLet(ctx.ToIR.Stmt(stmt, ctx));
                    }
                    if (stmt.type === 'Block') {
                        return ctx.ToIR.BlockSt(stmt, ctx).stmts;
                    }
                    if (stmt.type === 'If') {
                        return [ctx.ToIR.IfSt(stmt, ctx)];
                    }

                    return [
                        {
                            type: 'Return',
                            expr: ctx.ToIR.Expression(stmt, ctx),
                            loc: stmt.loc,
                        },
                    ];
                })
                .flat(),
            loc: node.loc,
        };
    },
    Block(node: t.Block, ctx: ICtx): t.IExpression {
        return iife(ctx.ToIR.BlockSt(node, ctx), ctx);
    },
    Let(node: t.Let, ctx: ICtx): ILet {
        return {
            type: 'Let',
            pat: node.pat,
            expr: ctx.ToIR.Expression(node.expr, ctx),
            typ: ctx.actx.getType(node.expr) ?? {
                type: 'TBlank',
                loc: node.loc,
            },
            loc: node.loc,
        };
    },
};

export const unwrapiffe = (
    node: t.IExpression,
    pat: t.Pattern,
    typ: t.Type,
): t.IStmt[] | undefined => {
    if (
        node.type !== 'Apply' ||
        node.args.length !== 0 ||
        node.target.type !== 'Lambda' ||
        node.target.args.length !== 0 ||
        node.target.body.type !== 'Block'
    ) {
        return;
    }
    const body = node.target.body;
    return transformIBlock(
        body,
        {
            Lambda(node, ctx) {
                return false;
            },
            IStmt_Return(node: t.IReturn) {
                return {
                    type: 'Assign',
                    typ,
                    pat,
                    expr: node.expr,
                    loc: node.loc,
                };
            },
        },
        null,
    ).stmts;
};

export const flatLet = (ilet: t.IStmt): t.IStmt[] => {
    if (ilet.type !== 'Let') {
        return [ilet];
    }
    if (!ilet.expr) {
        return [ilet];
    }
    const unwrapped = unwrapiffe(ilet.expr, ilet.pat, ilet.typ);
    if (unwrapped) {
        return [{ ...ilet, expr: undefined }, ...unwrapped];
    }
    return [ilet];
};

export const iife = (st: t.IStmt, ctx: ICtx): t.IExpression => {
    return {
        type: 'Apply',
        target: {
            type: 'Lambda',
            loc: st.loc,
            args: [],
            res: null,
            resInferred: true,
            body:
                st.type === 'Block'
                    ? st
                    : { type: 'Block', stmts: [st], loc: st.loc },
        },
        args: [],
        loc: st.loc,
    };
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { typeToplevelT } from './base';
import { patternIsExhaustive } from './exhaustive';
import { dtype, IIf } from './ifs';
import { ISwitch } from './switchs';
import { typeMatches } from '../typing/typeMatches';
export const ToJS = {
    Block(node: t.IBlock, ctx: JCtx): b.BlockStatement {
        return b.blockStatement(
            node.stmts.map((stmt) => {
                node.stmts?.forEach((stmt) => {
                    if (stmt.type === 'Let') {
                        const locals: t.Locals = [];
                        const typ = stmt.typ;
                        getLocals(stmt.pat, typ, locals, ctx.actx);
                        ctx = {
                            ...ctx,
                            actx: ctx.actx.withLocals(locals) as ACtx,
                        };
                    }
                });

                return ctx.ToJS.IStmt(stmt, ctx);
            }),
        );
    },
    Let(node: t.ILet, ctx: JCtx): b.Statement {
        if (!node.expr) {
            const locals: t.Locals = [];
            getLocals(node.pat, node.typ, locals, ctx.actx);
            return b.variableDeclaration(
                'let',
                locals.map((l) =>
                    b.variableDeclarator(b.identifier(l.sym.name)),
                ),
            );
        }
        const pat = ctx.ToJS.Pattern(node.pat, ctx);
        if (!pat) {
            return b.expressionStatement(b.stringLiteral('no-op pattern'));
        }
        return b.variableDeclaration('let', [
            b.variableDeclarator(
                pat,
                node.expr ? ctx.ToJS.IExpression(node.expr, ctx) : null,
            ),
        ]);
    },
    Assign(node: IAssign, ctx: JCtx): b.Statement {
        const pat = ctx.ToJS.Pattern(node.pat, ctx);
        const expr = ctx.ToJS.IExpression(node.expr, ctx);
        if (!pat) {
            // return b.expressionStatement(expr)
            return b.expressionStatement(b.stringLiteral('no-op pattern'));
        }
        return b.expressionStatement(b.assignmentExpression('=', pat, expr));
    },
    IStmt(node: t.IStmt, ctx: JCtx): b.Statement {
        if (node.type === 'Let') {
            return ctx.ToJS.Let(node, ctx);
        }
        if (node.type === 'If') {
            return ctx.ToJS.If(node, ctx);
        }
        if (node.type === 'Block') {
            return ctx.ToJS.Block(node, ctx);
        }
        if (node.type === 'Return') {
            return b.returnStatement(ctx.ToJS.IExpression(node.expr, ctx));
        }
        if (node.type === 'Assign') {
            return ctx.ToJS.Assign(node, ctx);
        }
        if (node.type === 'Switch') {
            return ctx.ToJS.Switch(node, ctx);
        }
        return b.expressionStatement(ctx.ToJS.IExpression(node, ctx));
    },
};

const checkLet = (node: t.Let, ctx: { ctx: ACtx; hit: {} }) => {
    let t = ctx.ctx.getType(node.expr);
    if (t) {
        t = ctx.ctx.resolveAnalyzeType(t);
    }
    if (t && !typeMatchesPattern(node.pat, t, ctx.ctx)) {
        ctx.ctx.debugger();
        return {
            ...node,
            expr: decorate(node.expr, 'patternMismatch', ctx.hit, ctx.ctx),
        };
    }
    if (t && !patternIsExhaustive(node.pat, t, ctx.ctx)) {
        return {
            ...node,
            pat: pdecorate(node.pat, 'notExhaustive', ctx, [
                dtype('type', t, node.pat.loc),
            ]),
        };
    }
    return null;
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    Block(node, ctx) {
        let changed = false;
        const stmts: t.Stmt[] = node.stmts.map((stmt) => {
            if (stmt.type === 'Let') {
                const locals: t.Locals = [];
                const typ =
                    ctx.ctx.getType(stmt.expr) ??
                    typeForPattern(stmt.pat, ctx.ctx);
                getLocals(stmt.pat, typ, locals, ctx.ctx);
                ctx = { ...ctx, ctx: ctx.ctx.withLocals(locals) as ACtx };
                const res = checkLet(stmt, ctx);
                if (res) {
                    changed = true;
                    return res;
                }
            }
            return stmt;
        });
        return [changed ? { ...node, stmts } : null, ctx];
    },
    ToplevelLet(node, ctx) {
        let changed = false;
        const items = node.elements.map((el) => {
            if (el.typ) {
                const t = ctx.ctx.getType(el.expr);
                if (t && !typeMatches(t, el.typ, ctx.ctx)) {
                    changed = true;
                    return {
                        ...el,
                        expr: decorate(
                            el.expr,
                            'resMismatch',
                            ctx.hit,
                            ctx.ctx,
                            [dtype('inferred', t, el.expr.loc)],
                        ),
                    };
                }
            }
            return el;
        });
        return changed ? { ...node, elements: items } : null;
    },
};
