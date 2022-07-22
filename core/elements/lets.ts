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
import { getLocals, typeForPattern } from './pattern';

export const grammar = `
Block = "{" _ stmts:Stmts? _ "}"
Stmts = first:Stmt rest:( _nonnewline ';'? '\n' _ Stmt)*
Stmt = Let / Expression
Let = "let" _ pat:Pattern _ "=" _ expr:Expression
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
export type IStmt = ILet | t.IExpression | IBlock;
export type ILet = {
    type: 'Let';
    pat: t.Pattern;
    expr: t.IExpression;
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
                      items: node.stmts.map((stmt) =>
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
    Block(node: t.Block, ctx: ICtx): IBlock {
        return {
            type: 'Block',
            stmts: node.stmts.map((stmt) => ctx.ToIR.Stmt(stmt, ctx)),
            loc: node.loc,
        };
    },
    Let(node: t.Let, ctx: ICtx): ILet {
        return {
            type: 'Let',
            pat: node.pat,
            expr: ctx.ToIR.Expression(node.expr, ctx),
            loc: node.loc,
        };
    },
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
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
                ctx.ToJS.IExpression(node.expr, ctx),
            ),
        ]);
    },
    IStmt(node: t.IStmt, ctx: JCtx): b.Statement {
        if (node.type === 'Let') {
            return ctx.ToJS.Let(node, ctx);
        }
        return b.expressionStatement(ctx.ToJS.IExpression(node, ctx));
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
