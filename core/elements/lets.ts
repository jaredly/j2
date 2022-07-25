import * as p from '../grammar/base.parser';
import { Ctx as ICtx } from '../ir/ir';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { transformIBlock, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx as ACtx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { getLocals, typeForPattern } from './pattern';

export const grammar = `
Block = "{" _ stmts:Stmts? _ "}"
Stmts = first:Stmt rest:( _nonnewline ';'? '\n' _ Stmt)* _ ';'?
Stmt = Let / Expression
Let = "let" _ pat:Pattern _ "=" _ expr:Expression

ToplevelLet = "let" _ first:LetPair rest:(__ "and" __ LetPair)*
LetPair = name:$IdText _ "=" _ expr:Expression
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
export type IStmt = ILet | IAssign | t.IExpression | IBlock | IReturn | IIf;
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
                        const typ =
                            ctx.getType(res.expr) ??
                            typeForPattern(res.pat, ctx);
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
                      items: node.stmts.map((stmt, i) =>
                          ctx.ToAst.Stmt(stmt, ctx),
                      ),
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
        return {
            type: 'ToplevelLet',
            items: top.elements.map((el) => ({
                type: 'LetPair',
                name: el.name,
                expr: ctx.ToAst.Expression(el.expr, ctx),
                loc: el.loc,
            })),
            loc: top.loc,
        };
    },
    // Apply({ type, target, args, loc }: t.Apply, ctx: TACtx): p.Apply {
    // },
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
    BlockSt(node: t.Block, ctx: ICtx): IBlock {
        return {
            type: 'Block',
            stmts: node.stmts
                .map((stmt, i): t.IStmt[] => {
                    if (i < node.stmts.length - 1 || stmt.type === 'Let') {
                        return flatLet(ctx.ToIR.Stmt(stmt, ctx));
                    }
                    if (stmt.type === 'Block') {
                        return [ctx.ToIR.BlockSt(stmt, ctx)];
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
    // Stmt(node: t.Stmt, ctx: ICtx): IStmt {
    // },
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
import { IIf } from './ifs';
export const ToJS = {
    Block(node: t.IBlock, ctx: JCtx): b.BlockStatement {
        return b.blockStatement(
            node.stmts.map((stmt) => ctx.ToJS.IStmt(stmt, ctx)),
        );
    },
    Let(node: t.ILet, ctx: JCtx): b.Statement {
        return b.variableDeclaration('let', [
            b.variableDeclarator(
                ctx.ToJS.Pattern(node.pat, ctx),
                node.expr ? ctx.ToJS.IExpression(node.expr, ctx) : null,
            ),
        ]);
    },
    Assign(node: IAssign, ctx: JCtx): b.Statement {
        return b.expressionStatement(
            b.assignmentExpression(
                '=',
                ctx.ToJS.Pattern(node.pat, ctx),
                ctx.ToJS.IExpression(node.expr, ctx),
            ),
        );
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
        return b.expressionStatement(ctx.ToJS.IExpression(node, ctx));
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
