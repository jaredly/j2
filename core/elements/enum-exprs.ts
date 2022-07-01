import { Visitor } from '../transform-tast';
import { decorate, tdecorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';

export const grammar = `
Enum = "\`" text:$IdText payload:("(" _ Expression? _ ")")?
`;

export type Enum = {
    type: 'Enum';
    tag: string;
    payload?: t.Expression;
    loc: t.Loc;
};

export const ToTast = {
    Enum(t: p.Enum, ctx: TCtx): t.Enum {
        return {
            type: 'Enum',
            tag: t.text,
            payload: t.payload
                ? ctx.ToTast[t.payload.type](t.payload as any, ctx)
                : undefined,
            loc: t.loc,
        };
    },
};

export const ToAst = {
    Enum(t: t.Enum, ctx: TACtx): p.Enum {
        return {
            type: 'Enum',
            text: t.tag,
            payload: t.payload
                ? ctx.ToAst[t.payload.type](t.payload as any, ctx)
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
                    ? pp.items(
                          [
                              pp.text('(', t.loc),
                              ctx.ToPP[t.payload.type](t.payload as any, ctx),
                              pp.text(')', t.loc),
                          ],
                          t.loc,
                      )
                    : null,
            ],
            t.loc,
        );
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {};
