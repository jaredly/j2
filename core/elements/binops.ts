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

export const grammar = `
BinOp = first:WithUnary rest_drop:BinOpRight* 
BinOpRight = __ op:binopWithHash __ right:WithUnary
WithUnary = op_drop:UnaryOpWithHash? inner:DecoratedExpression
UnaryOpWithHash = op:UnaryOp hash:IdHash?
UnaryOp = "-" / "!"

binopWithHash = op:binop hash:IdHash?
binop = $(!"//" [+*^/<>=|&-]+)

ParenedOp = "(" _ inner:binopWithHash _ ")"

Binop = Expression

`;

export const ToTast = {
    ParenedOp(ast: p.ParenedOp, ctx: TCtx): t.Expression {
        return ctx.ToTast.Identifier(
            {
                ...ast.inner,
                text: ast.inner.op,
                type: 'Identifier',
            },
            ctx,
        );
    },
    WithUnary(ast: p.WithUnary_inner, ctx: TCtx): t.Expression {
        const inner = ctx.ToTast.Expression(ast.inner, ctx);
        // ast.op.op
        return inner;
    },
    BinOp(ast: p.BinOp_inner, ctx: TCtx): t.Expression {
        let inner = ctx.ToTast.Expression(ast.first, ctx);
        ast.rest.forEach((right) => {
            right.op;
            right.right;
            const target = ctx.ToTast.Identifier(
                {
                    ...right.op,
                    text: right.op.op,
                    type: 'Identifier',
                },
                ctx,
            );
            inner = {
                type: 'Apply',
                target,
                args: [inner, ctx.ToTast.Expression(right.right, ctx)],
                loc: right.loc,
            };
        });

        /*
        OK steps here:
        - make a tree of the binop elements, by precendence
        - do normal resolution
        */
        return inner;
    },
    // Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
    // },
};

export const ToAst = {
    // Apply({ type, target, args, loc }: t.Apply, ctx: TACtx): p.Apply {
    // },
};

export const ToPP = {
    ParenedOp(ast: p.ParenedOp, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('(', ast.loc),
                pp.text(ast.inner.op + (ast.inner.hash ?? ''), ast.loc),
                // ctx.ToPP.Expression(ast.inner, ctx),
                pp.text(')', ast.loc),
            ],
            ast.loc,
        );
    },
    WithUnary(ast: p.WithUnary_inner, ctx: PCtx): pp.PP {
        const inner = ctx.ToPP.Expression(ast.inner, ctx);
        return inner;
    },
    BinOp(ast: p.BinOp_inner, ctx: PCtx): pp.PP {
        const inner = ctx.ToPP.Expression(ast.first, ctx);
        return inner;
    },
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
