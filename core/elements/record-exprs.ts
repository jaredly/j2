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
import { allRecordItems } from './records';

export const grammar = `
Record = "{" _ items:RecordItems? _ "}"
RecordItems = first:RecordItem rest:(_ "," _ RecordItem)* _ ","?
RecordItem = RecordSpread / RecordKeyValue
RecordSpread = "..." _ inner:Expression
RecordKeyValue = key:$AttrText _ ":" _ value:Expression
`;

export type Record = {
    type: 'Record';
    items: RecordKeyValue[];
    spreads: t.Expression[];
    loc: t.Loc;
};

export type RecordKeyValue = {
    type: 'RecordKeyValue';
    key: string;
    value: t.Expression;
    loc: t.Loc;
};

export type IRecord = {
    type: 'IRecord';
    items: IRecordKeyValue[];
    spreads: t.IExpression[];
    loc: t.Loc;
};

export type IRecordKeyValue = {
    type: 'IRecordKeyValue';
    key: string;
    value: t.IExpression;
    loc: t.Loc;
};

export const ToTast = {
    Record(ast: p.Record, ctx: TCtx): Record {
        const spreads: Record['spreads'] = [];
        const items: Record['items'] = [];
        ast.items?.items.forEach((item) => {
            if (item.type === 'RecordSpread') {
                spreads.push(
                    ctx.ToTast[item.inner.type](item.inner as any, ctx),
                );
            } else if (item.type === 'RecordKeyValue') {
                items.push({
                    type: 'RecordKeyValue',
                    key: item.key,
                    value: ctx.ToTast[item.value.type](item.value as any, ctx),
                    loc: item.loc,
                });
            }
        });
        return {
            type: 'Record',
            items,
            spreads,
            loc: ast.loc,
        };
    },
};

const recordExprAsTuple = (t: Record) => {
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
    Record(record: Record, ctx: TACtx): p.Atom {
        const nums = recordExprAsTuple(record);
        if (nums) {
            return {
                type: 'ParenedExpression',
                items: {
                    type: 'CommaExpr',
                    items: nums.map((item) =>
                        ctx.ToAst[item.type](item as any, ctx),
                    ),
                    loc: record.loc,
                },
                loc: record.loc,
            };
        }
        return {
            type: 'Record',
            loc: record.loc,
            items: {
                type: 'RecordItems',
                items: [
                    ...record.spreads.map(
                        (spread): p.RecordItem => ({
                            type: 'RecordSpread',
                            inner: ctx.ToAst[spread.type](spread as any, ctx),
                            loc: spread.loc,
                        }),
                    ),
                    ...record.items.map(
                        (item): p.RecordItem => ({
                            type: 'RecordKeyValue',
                            key: item.key,
                            loc: item.loc,
                            value: ctx.ToAst[item.value.type](
                                item.value as any,
                                ctx,
                            ),
                        }),
                    ),
                ],
                loc: record.loc,
            },
        };
    },
    // Apply({ type, target, args, loc }: t.Apply, ctx: TACtx): p.Apply {
    // },
};

export const ToPP = {
    Record(ast: p.Record, ctx: PCtx): pp.PP {
        return pp.args(
            ast.items?.items.map((item) => {
                switch (item.type) {
                    case 'RecordKeyValue':
                        return pp.items(
                            [
                                pp.text(item.key, item.loc),
                                pp.text(': ', item.loc),
                                ctx.ToPP[item.value.type](
                                    item.value as any,
                                    ctx,
                                ),
                            ],
                            item.loc,
                        );
                    case 'RecordSpread':
                        return pp.items(
                            [
                                pp.text('...', item.loc),
                                ctx.ToPP[item.inner.type](
                                    item.inner as any,
                                    ctx,
                                ),
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
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    Record(node, ctx) {
        let changed = false;
        const spreads = node.spreads.map((spread) => {
            const t = ctx.ctx.getType(spread);
            if (!t || t?.type !== 'TRecord') {
                changed = true;
                return decorate(spread, 'notARecord', ctx.hit, ctx.ctx);
            }
            if (allRecordItems(t, ctx.ctx) == null) {
                changed = true;
                return decorate(spread, 'invalidRecord', ctx.hit, ctx.ctx);
            }
            return spread;
        });
        return changed ? { ...node, spreads } : null;
    },
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
