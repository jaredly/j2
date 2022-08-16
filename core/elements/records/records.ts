import { Visitor } from '../../transform-tast';
import { decorate, tdecorate } from '../../typing/analyze';
import { Ctx } from '../../typing/analyze';
import * as t from '../../typed-ast';
import * as p from '../../grammar/base.parser';
import * as pp from '../../printer/pp';
import { Ctx as PCtx } from '../../printer/to-pp';
import { Ctx as TCtx } from '../../typing/to-tast';
import { Ctx as TACtx } from '../../typing/to-ast';
import { noloc } from '../../consts';

export const grammar = `
TRecord = "{" _ items:TRecordItems? _ "}"
TRecordItems = first:TRecordItem rest:(_ "," _ TRecordItem)* _ ","?
TRecordItem = TRecordSpread / TRecordKeyValue / Star
TRecordSpread = "..." _ inner:Type
TRecordKeyValue = key:$AttrText _ ":" _ value:Type default_:(_ "=" _ Expression)?

`;

export type TRecord = {
    type: 'TRecord';
    items: TRecordKeyValue[];
    spreads: t.Type[];
    open: boolean;
    loc: t.Loc;
};

export type TRecordKeyValue = {
    type: 'TRecordKeyValue';
    key: string;
    value: t.Type;
    default_: t.Expression | null;
    loc: t.Loc;
};

export const ToTast = {
    TRecord: (ast: p.TRecord, ctx: TCtx): TRecord => {
        const items: TRecord['items'] = [];
        const spreads: TRecord['spreads'] = [];
        let open = false;
        ast.items?.items.forEach((item) => {
            if (item.type === 'TRecordSpread') {
                spreads.push(ctx.ToTast.Type(item.inner, ctx));
            } else if (item.type === 'TRecordKeyValue') {
                items.push({
                    type: 'TRecordKeyValue',
                    key: item.key,
                    value: ctx.ToTast.Type(item.value, ctx),
                    default_: item.default_
                        ? ctx.ToTast.Expression(item.default_, ctx)
                        : null,
                    loc: item.loc,
                });
            } else {
                open = true;
            }
        });
        return {
            type: 'TRecord',
            items,
            spreads,
            open,
            loc: ast.loc,
        };
    },
};

export const recordAsTuple = (t: TRecord) => {
    if (t.spreads.length == 0) {
        let nums = [];
        for (let item of t.items) {
            const i = parseInt(item.key);
            if (i.toString() === item.key && !isNaN(i)) {
                nums[i] = item.value;
            }
        }

        let good = true;
        for (let i = 0; i < t.items.length; i++) {
            if (!nums[i]) {
                good = false;
                break;
            }
        }

        if (good) {
            return nums;
        }
    }
    return null;
};

export const irecordAsTuple = (t: t.IRecord) => {
    if (t.spreads.length == 0) {
        let nums = [];
        for (let item of t.items) {
            const i = parseInt(item.key);
            if (i.toString() === item.key && !isNaN(i)) {
                nums[i] = item.value;
            }
        }

        let good = true;
        for (let i = 0; i < t.items.length; i++) {
            if (!nums[i]) {
                good = false;
                break;
            }
        }

        if (good) {
            return nums;
        }
    }
    return null;
};

export const ToAst = {
    TRecord: (t: TRecord, ctx: TACtx): p.Type => {
        const tup = recordAsTuple(t);
        if (tup) {
            return {
                type: 'TParens',
                loc: t.loc,
                items: {
                    type: 'TComma',
                    items: tup.map((v) => ctx.ToAst.Type(v, ctx)),
                    loc: t.loc,
                },
                open: t.open ? '*' : null,
            };
        }
        return {
            type: 'TRecord',
            loc: t.loc,
            items: {
                type: 'TRecordItems',
                loc: t.loc,
                items: [
                    ...t.spreads.map(
                        (spread): p.TRecordItem => ({
                            type: 'TRecordSpread',
                            loc: spread.loc,
                            inner: ctx.ToAst.Type(spread, ctx),
                        }),
                    ),
                    ...t.items.map(
                        (item): p.TRecordItem => ({
                            type: 'TRecordKeyValue',
                            loc: item.loc,
                            key: item.key,
                            default_: item.default_
                                ? ctx.ToAst.Expression(item.default_, ctx)
                                : null,
                            value: ctx.ToAst.Type(item.value, ctx),
                        }),
                    ),
                    ...(t.open
                        ? [{ type: 'Star', pseudo: '*' } as p.TRecordItem]
                        : []),
                ],
            },
        };
    },
};

export const ToPP = {
    TRecord: (ast: p.TRecord, ctx: PCtx): pp.PP => {
        return pp.args(
            ast.items?.items.map((item) => {
                switch (item.type) {
                    case 'Star':
                        return pp.text('*', noloc);
                    case 'TRecordKeyValue':
                        return pp.items(
                            [
                                pp.text(item.key, item.loc),
                                pp.text(': ', item.loc),
                                ctx.ToPP.Type(item.value, ctx),
                                item.default_
                                    ? pp.items(
                                          [
                                              pp.text(' = ', item.loc),
                                              ctx.ToPP.Expression(
                                                  item.default_,
                                                  ctx,
                                              ),
                                          ],
                                          item.loc,
                                      )
                                    : null,
                            ],
                            item.loc,
                        );
                    case 'TRecordSpread':
                        return pp.items(
                            [
                                pp.text('...', item.loc),
                                ctx.ToPP.Type(item.inner, ctx),
                            ],
                            item.loc,
                        );
                }
            }) ?? [],
            ast.loc,
            '{',
            '}',
        );
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    TRecord(node, ctx) {
        let changed = false;

        const spreads = node.spreads.map((spread) => {
            const res = ctx.ctx.resolveRefsAndApplies(spread);
            if (!res || res.type !== 'TRecord') {
                changed = true;
                return tdecorate(spread, 'notARecord', ctx);
            }
            const all = allRecordItems(res, ctx.ctx);
            if (!all) {
                changed = true;
                return tdecorate(spread, 'invalidRecord', ctx);
            }
            return spread;
        });

        return changed ? { ...node, spreads } : node;
    },
};

import { Ctx as ICtx } from '../../ir/ir';
export const ToIR = {
    Record({ items, loc, spreads }: t.Record, ctx: ICtx): t.IRecord {
        return {
            type: 'Record',
            loc,
            items: items.map((item) => ({
                ...item,
                value: ctx.ToIR.Expression(item.value, ctx),
            })),
            spreads: spreads.map((spread) => ctx.ToIR.Expression(spread, ctx)),
        };
    },
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../../ir/to-js';
import { allRecordItems } from './allRecordItems';
export const ToJS = {
    Record({ items, spreads, loc }: t.IRecord, ctx: JCtx): b.Expression {
        const nums = irecordAsTuple({ items, spreads, loc, type: 'Record' });
        if (nums) {
            if (!nums.length) {
                return b.nullLiteral();
            }
            return b.arrayExpression(
                nums.map((num) => ctx.ToJS.IExpression(num, ctx)),
            );
        }
        return b.objectExpression(
            spreads
                .map((spread): b.ObjectProperty | b.SpreadElement =>
                    b.spreadElement(ctx.ToJS.IExpression(spread, ctx)),
                )
                .concat(
                    items.map((item): b.ObjectProperty | b.SpreadElement => {
                        return b.objectProperty(
                            b.identifier(item.key),
                            ctx.ToJS.IExpression(item.value, ctx),
                        );
                    }),
                ),
        );
    },
};
