import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { maybeTuple } from './base';

export const grammar = `
Enum = "\`" text:$IdText payload:("(" _ CommaExpr? _ ")")?
`;

export type Enum = {
    type: 'Enum';
    tag: string;
    payload?: t.Expression;
    loc: t.Loc;
};

export type IEnum = {
    type: 'IEnum';
    tag: string;
    payload?: t.IExpression;
    loc: t.Loc;
};

export const ToTast = {
    Enum(t: p.Enum, ctx: TCtx): t.Enum {
        return {
            type: 'Enum',
            tag: t.text,
            payload: t.payload ? maybeTuple(t.payload, t.loc, ctx) : undefined,
            loc: t.loc,
        };
    },
};

export const ToAst = {
    Enum(t: t.Enum, ctx: TACtx): p.Enum {
        const inner = t.payload
            ? ctx.ToAst.Expression(t.payload, ctx)
            : undefined;
        return {
            type: 'Enum',
            text: t.tag,
            payload:
                inner?.type === 'ParenedExpression'
                    ? inner.items
                    : inner
                    ? {
                          type: 'CommaExpr',
                          items: [inner],
                          loc: t.loc,
                      }
                    : null,
            loc: t.loc,
        };
    },
};

export const ToPP = {
    Enum(t: p.Enum, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('`', t.loc),
                pp.text(t.text, t.loc),
                t.payload
                    ? pp.args(
                          t.payload.items.map((item) =>
                              ctx.ToPP.Expression(item, ctx),
                          ),
                          t.payload.loc,
                      )
                    : null,
            ],
            t.loc,
        );
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {};
