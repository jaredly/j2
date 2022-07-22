import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { addDecorator, Ctx, tdecorate } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TMCtx, unifyPayloads } from '../typing/typeMatches';
import { unifyTypes } from '../typing/unifyTypes';
import { expandEnumCases, payloadsEqual } from '../typing/typeMatches';
import { recordAsTuple } from './records';

// type State:Effect = <T>[ `Get | `Set(T) ]
// type State:Full = <T, Final>[ State:Effect<T> | `Final(Final)]

export const grammar = `
TEnum = "[" _ cases:EnumCases? _ "]"
EnumCases = first:EnumCase rest:( _ "|" _ EnumCase)* _ "|"?
EnumCase = TagDecl / Type / Star
TagDecl = decorators:(Decorator _)* "\`" text:$IdText payload:TagPayload?
// add '/ Record' here?
TagPayload = "(" _ first:Type rest:(_ "," _ Type)* _ ","? _ ")"
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
    decorators: Array<t.Decorator>;
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
                                decorators: c.decorators.map((d) =>
                                    ctx.ToTast.Decorator(d, ctx),
                                ),
                                payload: c.payload
                                    ? c.payload.items.length === 1
                                        ? ctx.ToTast.Type(
                                              c.payload.items[0],
                                              ctx,
                                          )
                                        : {
                                              type: 'TRecord',
                                              loc: noloc,
                                              spreads: [],
                                              open: false,
                                              items: c.payload.items.map(
                                                  (p, i) => ({
                                                      type: 'TRecordKeyValue',
                                                      loc: noloc,
                                                      key: i.toString(),
                                                      value: ctx.ToTast.Type(
                                                          p,
                                                          ctx,
                                                      ),
                                                  }),
                                              ),
                                          }
                                    : undefined,
                                loc: c.loc,
                            };
                        } else {
                            return ctx.ToTast.Type(c, ctx);
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
                                decorators: c.decorators.map((d) =>
                                    ctx.ToAst[d.type](d, ctx),
                                ),
                                payload: c.payload
                                    ? {
                                          type: 'TagPayload',
                                          loc: c.loc,
                                          items: enumPayload(
                                              c.payload,
                                              ctx,
                                              c.loc,
                                          ),
                                      }
                                    : null,
                                loc: c.loc,
                            };
                        } else {
                            return ctx.ToAst.Type(c, ctx);
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
                pp.text('[' + (t.cases?.items.length ? ' ' : ''), noloc),
                ...pp.interleave(
                    t.cases?.items.map((c) => {
                        if (c.type === 'Star') {
                            return pp.text('*', noloc);
                        }
                        if (c.type === 'TagDecl') {
                            return pp.items(
                                [
                                    ...c.decorators.map((d) =>
                                        ctx.ToPP[d.type](d, ctx),
                                    ),
                                    pp.text(`\`${c.text}`, noloc),
                                    c.payload
                                        ? pp.args(
                                              c.payload.items.map((item) =>
                                                  ctx.ToPP.Type(item, ctx),
                                              ),
                                              c.payload.loc,
                                          )
                                        : // pp.items(
                                          //       [
                                          //           pp.text('(', noloc),
                                          //           ctx.ToPP[
                                          //               c.payload.inner.type
                                          //           ](
                                          //               c.payload.inner ,
                                          //               ctx,
                                          //           ),
                                          //           pp.text(')', noloc),
                                          //       ],
                                          //       c.loc,
                                          //   )
                                          null,
                                ],
                                c.loc,
                            );
                        } else {
                            return ctx.ToPP.Type(c, ctx);
                        }
                    }) || [],
                    ' | ',
                ),
                pp.text((t.cases?.items.length ? ' ' : '') + ']', noloc),
            ],
            t.loc,
        );
    },
};

import { Ctx as ICtx } from '../ir/ir';
export const ToIR = {
    Enum({ loc, tag, payload }: t.Enum, ctx: ICtx): t.IEnum {
        return {
            type: 'Enum',
            loc,
            tag,
            payload: payload ? ctx.ToIR.Expression(payload, ctx) : undefined,
        };
    },
};

import { Ctx as JCtx } from '../ir/to-js';
import * as b from '@babel/types';
export const ToJS = {
    Enum({ loc, tag, payload }: t.IEnum, ctx: JCtx): b.Expression {
        if (!payload) {
            return b.stringLiteral(tag);
        }
        return b.objectExpression([
            b.objectProperty(b.identifier('tag'), b.stringLiteral(tag)),
            b.objectProperty(
                b.identifier('payload'),
                ctx.ToJS.IExpression(payload, ctx),
            ),
        ]);
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
        case 'TVbl':
        case 'TVars':
        // These are taken care of by resolveAnalyzeType
        case 'TDecorated':
        case 'TApply':
        case 'TRecord':
            return false;
        case 'TBlank':
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
        let used: { [key: string]: EnumCase } = {};
        const cases = node.cases.map((k) => {
            if (k.type === 'EnumCase') {
                if (
                    used[k.tag] &&
                    !payloadsEqual(
                        used[k.tag].payload,
                        k.payload,
                        ctx.ctx,
                        true,
                    )
                ) {
                    // console.log('found it?', k.tag, k.loc.idx, ctx.hit);
                    changed = true;
                    return {
                        ...k,
                        decorators: addDecorator(
                            k.loc,
                            k.decorators,
                            'conflictingEnumTag',
                            ctx,
                        ),
                    };
                    // return tdecorate(
                    //     k,
                    //     'conflictingEnumTag',
                    //     ctx.hit,
                    //     ctx.ctx
                    // )
                }
                used[k.tag] = k;
                return k;
            } else {
                const res = ctx.ctx.resolveRefsAndApplies(k);
                if (res?.type === 'TEnum') {
                    const expanded = expandEnumCases(res, ctx.ctx);
                    if (!expanded) {
                        changed = true;
                        return tdecorate(k, 'invalidEnum', ctx);
                    }
                    for (let kase of expanded) {
                        if (
                            used[kase.tag] &&
                            !payloadsEqual(
                                kase.payload,
                                used[kase.tag].payload,
                                ctx.ctx,
                                true,
                            )
                        ) {
                            changed = true;
                            return tdecorate(k, 'conflictingEnumTag', ctx, [
                                {
                                    label: 'tag',
                                    arg: {
                                        type: 'DExpr',
                                        loc: k.loc,
                                        expr: {
                                            type: 'TemplateString',
                                            first: kase.tag,
                                            rest: [],
                                            loc: k.loc,
                                        },
                                    },
                                    loc: k.loc,
                                },
                            ]);
                        }
                        if (!used[kase.tag]) {
                            used[kase.tag] = kase;
                        }
                    }
                } else {
                    // console.log('no resolve?', k);
                }
            }
            if (!isValidEnumCase(k, ctx.ctx)) {
                changed = true;
                return tdecorate(k, 'notAnEnum', ctx);
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

export const enumCaseMap = (canEnums: EnumCase[], ctx: TMCtx) => {
    const canMap: { [key: string]: EnumCase } = {};
    for (let kase of canEnums) {
        if (canMap[kase.tag]) {
            const un = unifyPayloads(
                kase.payload,
                canMap[kase.tag].payload,
                ctx,
            );
            if (un == false) {
                return false;
            }
            canMap[kase.tag] = { ...kase, payload: un ?? undefined };
        } else {
            canMap[kase.tag] = kase;
        }
    }
    return canMap;
};

export const enumTypeMatches = (
    candidate: TEnum,
    expected: t.Type,
    ctx: TMCtx,
) => {
    // [ `What ] matches [ `What | `Who ]
    // So everything in candidate needs to match something
    // in expected. And there need to not be any collisions name-wise
    if (expected.type !== 'TEnum') {
        return false;
    }
    const canEnums = expandEnumCases(candidate, ctx);
    const expEnums = expandEnumCases(expected, ctx);
    if (!canEnums || !expEnums) {
        return false;
    }
    const canMap = enumCaseMap(canEnums, ctx);
    if (!canMap) {
        return false;
    }
    const expMap = enumCaseMap(expEnums, ctx);
    if (!expMap) {
        return false;
    }

    for (let kase of canEnums) {
        if (!expMap[kase.tag]) {
            if (expected.open) {
                continue;
            }
            // console.log('no extra', kase.tag, expected.open, candidate.open);
            return false;
        }
        if (
            !payloadsEqual(kase.payload, expMap[kase.tag].payload, ctx, false)
        ) {
            return false;
        }
    }
    if (candidate.open && !expected.open) {
        return false;
    }

    return true;
};

export const unifyEnums = (
    candidate: TEnum,
    expected: t.Type,
    ctx: TMCtx,
): false | t.Type => {
    // [ `What ] matches [ `What | `Who ]
    // So everything in candidate needs to match something
    // in expected. And there need to not be any collisions name-wise
    if (expected.type !== 'TEnum') {
        return false;
    }
    const canEnums = expandEnumCases(candidate, ctx);
    const expEnums = expandEnumCases(expected, ctx);
    if (!canEnums || !expEnums) {
        return false;
    }
    const canMap = enumCaseMap(canEnums, ctx);
    if (!canMap) {
        return false;
    }
    const expMap = enumCaseMap(expEnums, ctx);
    if (!expMap) {
        return false;
    }

    for (let kase of canEnums) {
        if (!expMap[kase.tag]) {
            expMap[kase.tag] = kase;
        } else {
            const unified = unifyPayloads(
                kase.payload,
                expMap[kase.tag].payload,
                ctx,
            );
            if (unified === false) {
                return false;
            }
            expMap[kase.tag] = { ...kase, payload: unified ?? undefined };
        }
    }

    return {
        ...candidate,
        open: candidate.open || expected.open,
        cases: Object.values(expMap),
    };
};

function enumPayload(payload: t.Type, ctx: TACtx, loc: t.Loc): p.TOps[] {
    if (payload.type === 'TRecord') {
        const tuple = recordAsTuple(payload);
        if (tuple) {
            return tuple.map((t) => ctx.ToAst.Type(t, ctx));
        }
    }
    return [ctx.ToAst.Type(payload, ctx)];
}
