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

export const grammar = `
If = "if" __ cond:Expression _ yes:Block no:(_ "else" _ Block)?
`;

export type If = {
    type: 'If';
    cond: t.Expression;
    yes: t.Block;
    no?: t.Block;
    loc: t.Loc;
};

export type IIf = {
    type: 'If';
    cond: t.IExpression;
    yes: t.IBlock;
    no?: t.IBlock;
    loc: t.Loc;
};

export const ToTast = {
    If(ast: p.If, ctx: TCtx): If {
        return {
            type: 'If',
            cond: ctx.ToTast.Expression(ast.cond, ctx),
            yes: ctx.ToTast.Block(ast.yes, ctx),
            no: ast.no ? ctx.ToTast.Block(ast.no, ctx) : undefined,
            loc: ast.loc,
        };
    },
    // Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
    // },
};

export const ToAst = {
    If(node: If, ctx: TACtx): p.If {
        return {
            type: 'If',
            cond: ctx.ToAst.Expression(node.cond, ctx),
            yes: ctx.ToAst.Block(node.yes, ctx),
            no: node.no ? ctx.ToAst.Block(node.no, ctx) : null,
            loc: node.loc,
        };
    },
};

export const ToPP = {
    If({ loc, cond, yes, no }: p.If, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('if ', loc),
                ctx.ToPP.Expression(cond, ctx),
                pp.text(' ', loc),
                ctx.ToPP.Block(yes, ctx),
                no ? pp.text(' else ', loc) : null,
                no ? ctx.ToPP.Block(no, ctx) : null,
            ],
            loc,
        );
    },
};

export const ToIR = {
    If(node: t.If, ctx: ICtx): t.IExpression {
        return iife(ctx.ToIR.IfSt(node, ctx), ctx);
    },
    IfSt({ loc, cond, yes, no }: t.If, ctx: ICtx): IIf {
        return {
            type: 'If',
            cond: ctx.ToIR.Expression(cond, ctx),
            yes: ctx.ToIR.BlockSt(yes, ctx),
            no: no ? ctx.ToIR.BlockSt(no, ctx) : undefined,
            loc,
        };
    },
};

export const ToJS = {
    If(node: IIf, ctx: JCtx): b.Statement {
        return b.ifStatement(
            ctx.ToJS.IExpression(node.cond, ctx),
            ctx.ToJS.Block(node.yes, ctx),
            node.no ? ctx.ToJS.Block(node.no, ctx) : null,
        );
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    Expression_If(node, { ctx, hit }) {
        const nu = node;
        // let {cond, no, yes} = node
        const ct = ctx.getType(node.cond);
        if (ct && !ctx.isBuiltinType(ct, 'bool')) {
            node = {
                ...node,
                cond: decorate(node.cond, 'argWrongType', hit, ctx),
            };
        }
        const yt = ctx.getType(node.yes);
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
    // Expression_Apply(node, { ctx, hit }) {
    // },
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
