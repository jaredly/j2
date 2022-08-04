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
import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { arrayType } from '../typing/getType';
import { unifyTypes } from '../typing/unifyTypes';
import { dtype } from './ifs';

export const grammar = `
ArrayExpr = "[" _ items:ArrayItems? _ "]"
ArrayItems = first:ArrayItem rest:( _ "," _ ArrayItem)* _ ","? _
ArrayItem = Expression / SpreadExpr
`;

export type ArrayExpr = {
    type: 'ArrayExpr';
    items: ArrayItem[];
    loc: t.Loc;
};
export type ArrayItem = t.Expression | SpreadExpr;
export type SpreadExpr = {
    type: 'SpreadExpr';
    inner: t.Expression;
    loc: t.Loc;
};
export type IArrayExpr = {
    type: 'ArrayExpr';
    items: IArrayItem[];
    loc: t.Loc;
};
export type IArrayItem = ISpreadExpr | t.IExpression;
export type ISpreadExpr = {
    type: 'SpreadExpr';
    inner: t.IExpression;
    loc: t.Loc;
};

export const ToTast = {
    ArrayExpr(ast: p.ArrayExpr, ctx: TCtx): ArrayExpr {
        return {
            type: 'ArrayExpr',
            items:
                ast.items?.items.map((item) =>
                    ctx.ToTast.ArrayItem(item, ctx),
                ) ?? [],
            loc: ast.loc,
        };
    },
    SpreadExpr({ type, loc, inner }: p.SpreadExpr, ctx: TCtx): SpreadExpr {
        return { type, loc, inner: ctx.ToTast.Expression(inner, ctx) };
    },
};

export const ToAst = {
    ArrayExpr({ type, items, loc }: ArrayExpr, ctx: TACtx): p.ArrayExpr {
        return {
            type,
            items: {
                type: 'ArrayItems',
                items: items.map((item) => ctx.ToAst.ArrayItem(item, ctx)),
                loc,
            },
            loc,
        };
    },
    SpreadExpr({ type, loc, inner }: SpreadExpr, ctx: TACtx): p.SpreadExpr {
        return { type, loc, inner: ctx.ToAst.Expression(inner, ctx) };
    },
};

export const ToPP = {
    ArrayExpr(apply: p.ArrayExpr, ctx: PCtx): pp.PP {
        return pp.args(
            apply.items?.items.map((item) => ctx.ToPP.ArrayItem(item, ctx)) ??
                [],
            apply.loc,
            '[',
            ']',
        );
    },
    SpreadExpr({ loc, inner }: p.SpreadExpr, ctx: PCtx): pp.PP {
        return pp.items(
            [pp.text('...', loc), ctx.ToPP.Expression(inner, ctx)],
            loc,
        );
    },
};

export const ToIR = {
    ArrayExpr({ type, items, loc }: t.ArrayExpr, ctx: ICtx): IArrayExpr {
        return {
            type,
            items: items.map((item) => ctx.ToIR.ArrayItem(item, ctx)),
            loc,
        };
    },
    SpreadExpr({ type, loc, inner }: t.SpreadExpr, ctx: ICtx): ISpreadExpr {
        return { type, loc, inner: ctx.ToIR.Expression(inner, ctx) };
    },
};

export const ToJS = {
    IArrayItem(node: t.IArrayItem, ctx: JCtx): b.Expression | b.SpreadElement {
        switch (node.type) {
            case 'SpreadExpr':
                return ctx.ToJS.SpreadExpr(node, ctx);
            default:
                return ctx.ToJS.IExpression(node, ctx);
        }
    },

    ArrayExpr({ type, items, loc }: IArrayExpr, ctx: JCtx): b.ArrayExpression {
        return b.arrayExpression(
            items.map((item) => ctx.ToJS.IArrayItem(item, ctx)),
        );
    },
    SpreadExpr({ type, loc, inner }: ISpreadExpr, ctx: JCtx): b.SpreadElement {
        return b.spreadElement(ctx.ToJS.IExpression(inner, ctx));
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    ArrayExpr(node, ctx) {
        let changed = false;
        let element: t.Type = { type: 'TBlank', loc: node.loc };
        const items = node.items.map((item) => {
            let t: t.Type;
            if (item.type === 'SpreadExpr') {
                let got = arrayType(ctx.ctx.getType(item.inner), ctx.ctx);
                if (!got) {
                    return item;
                }
                t = got[0];
            } else {
                let el = ctx.ctx.getType(item);
                if (!el) {
                    return item;
                }
                t = el;
            }
            const un = unifyTypes(t, element, ctx.ctx);
            if (!un) {
                changed = true;
                const args = [
                    dtype('expected', element, item.loc),
                    dtype('found', t, item.loc),
                ];
                return item.type === 'SpreadExpr'
                    ? {
                          ...item,
                          inner: decorate(
                              item.inner,
                              'argWrongType',
                              ctx.hit,
                              ctx.ctx,
                              args,
                          ),
                      }
                    : decorate(item, 'argWrongType', ctx.hit, ctx.ctx, args);
            }
            element = un;
            return item;
        });
        return changed ? { ...node, items } : null;
    },
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
