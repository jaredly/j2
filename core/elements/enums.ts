import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx, tdecorate } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { expandEnumCases, payloadsEqual } from '../typing/typeMatches';

// type State:Effect = <T>[ `Get | `Set(T) ]
// type State:Full = <T, Final>[ State:Effect<T> | `Final(Final)]

export const grammar = `
TEnum = "[" _ cases:EnumCases? _ "]"
EnumCases = first:EnumCase rest:( _ "|" _ EnumCase)* _ "|"? _
EnumCase = TagDecl / Type / Star
TagDecl = "\`" text:$IdText payload:TagPayload?
// add '/ Record' here?
TagPayload = "(" _ inner:Type _ ")"
Star = pseudo:"*"

`;

export type TEnum = {
    type: 'TEnum';
    cases: Array<EnumCase | t.Type>;
    open: boolean;
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
            open: t.cases?.items.some((m) => m.type === 'Star') ?? false,
            cases:
                (t.cases?.items
                    .map((c) => {
                        if (c.type === 'Star') {
                            return null;
                        }
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
                    })
                    .filter(Boolean) as EnumCase[]) ?? [],
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
                items: t.cases
                    .map((c): p.EnumCase | p.Type => {
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
                    })
                    .concat(
                        t.open
                            ? [{ type: 'Star', pseudo: '*', loc: noloc }]
                            : [],
                    ),
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
                        if (c.type === 'Star') {
                            return pp.text('*', noloc);
                        }
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

const isValidEnumCase = (c: t.Type, ctx: Ctx): boolean => {
    // We'll special case 'recur ref that's applied'
    if (
        c.type === 'TApply' &&
        c.target.type === 'TRef' &&
        c.target.ref.type === 'Recur'
    ) {
        return ctx.getTopKind(c.target.ref.idx) === 'enum';
    }
    const resolved = ctx.resolveAnalyzeType(c);
    if (!resolved) {
        return false;
    }
    c = resolved;
    switch (c.type) {
        case 'Number':
        case 'String':
        case 'TOps':
        case 'TLambda':
        case 'TVars':
        // These are taken care of by resolveAnalyzeType
        case 'TDecorated':
        case 'TApply':
            return false;
        case 'TEnum':
            return true;
        case 'TRef':
            if (c.ref.type === 'Recur') {
                return ctx.getTopKind(c.ref.idx) === 'enum';
            }
            return false;
    }
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    TEnum(node, ctx): null | t.TEnum {
        let changed = false;
        const cases = node.cases.map((k) => {
            if (k.type !== 'EnumCase' && !isValidEnumCase(k, ctx.ctx)) {
                changed = true;
                return tdecorate(k, 'notAnEnum', ctx.hit, ctx.ctx);
            }
            return k;
        });
        return changed ? { ...node, cases } : null;
    },
    // Type_TEnum(node, ctx) {
    //     const enums = expandEnumCases(node, ctx.ctx);
    //     if (!enums) {
    //         return tdecorate(node, 'invalidEnum', ctx.hit, ctx.ctx);
    //     }
    //     const map: { [key: string]: EnumCase } = {};
    //     for (let kase of enums) {
    //         // Multiple cases with the same name
    //         if (
    //             map[kase.tag] &&
    //             !payloadsEqual(kase.payload, map[kase.tag].payload, ctx.ctx)
    //         ) {
    //             return tdecorate(node, 'invalidEnum', ctx.hit, ctx.ctx);
    //         }
    //         map[kase.tag] = kase;
    //     }
    //     return null;
    // },
};
