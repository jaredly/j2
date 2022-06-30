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
import { noloc } from '../ctx';

// type State:Effect = <T>[ `Get | `Set(T) ]
// type State:Full = <T, Final>[ State:Effect<T> | `Final(Final)]

export const grammar = `
TEnum = "[" _ cases:EnumCases? _ "]"
EnumCases = first:EnumCase rest:( _ "|" _ EnumCase)* _ "|"? _
EnumCase = TagDecl / Type // Star
TagDecl = "\`" text:$IdText payload:TagPayload?
// add '/ Record' here?
TagPayload = "(" _ inner:Type _ ")"

`;

export type TEnum = {
    type: 'TEnum';
    cases: Array<EnumCase | t.Type>;
    loc: t.Loc;
};

export type EnumCase = {
    type: 'EnumCase';
    tag: string;
    payload?: t.Type;
    loc: t.Loc;
};

export const ToTast = {
    TEnum(t: p.TEnum, ctx: TCtx): TEnum {
        return {
            type: 'TEnum',
            cases:
                t.cases?.items.map((c) => {
                    if (c.type === 'TagDecl') {
                        return {
                            type: 'EnumCase',
                            tag: c.text,
                            payload: c.payload
                                ? ctx.ToTast[c.payload.inner.type](
                                      c.payload.inner as any,
                                      ctx,
                                  )
                                : undefined,
                            loc: c.loc,
                        };
                    } else {
                        return ctx.ToTast[c.type](c as any, ctx);
                    }
                }) ?? [],
            loc: t.loc,
        };
    },
};

export const ToAst = {
    TEnum(t: TEnum, ctx: TACtx): p.TEnum {
        return {
            type: 'TEnum',
            cases: {
                type: 'EnumCases',
                loc: t.loc,
                items: t.cases.map((c): p.EnumCase | p.Type => {
                    if (c.type === 'EnumCase') {
                        return {
                            type: 'TagDecl',
                            text: c.tag,
                            payload: c.payload
                                ? {
                                      type: 'TagPayload',
                                      loc: c.loc,
                                      inner: ctx.ToAst[c.payload.type](
                                          c.payload as any,
                                          ctx,
                                      ),
                                  }
                                : null,
                            loc: c.loc,
                        };
                    } else {
                        return ctx.ToAst[c.type](c as any, ctx);
                    }
                }),
            },
            loc: t.loc,
        };
    },
};

export const ToPP = {
    TEnum(t: p.TEnum, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('[ ', noloc),
                ...pp.interleave(
                    t.cases?.items.map((c) => {
                        if (c.type === 'TagDecl') {
                            return pp.items(
                                [
                                    pp.text(`\`${c.text}`, noloc),
                                    c.payload
                                        ? pp.items(
                                              [
                                                  pp.text('(', noloc),
                                                  ctx.ToPP[
                                                      c.payload.inner.type
                                                  ](
                                                      c.payload.inner as any,
                                                      ctx,
                                                  ),
                                                  pp.text(')', noloc),
                                              ],
                                              c.loc,
                                          )
                                        : null,
                                    // pp.text(' | ', noloc),
                                ],
                                c.loc,
                            );
                        } else {
                            return ctx.ToPP[c.type](c as any, ctx);
                        }
                    }) || [],
                    ' | ',
                ),
                pp.text(' ]', noloc),
            ],
            t.loc,
        );
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {};
