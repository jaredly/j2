import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { addDecorator, Ctx, tdecorate } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { expandEnumCases, payloadsEqual } from '../typing/typeMatches';

// type State:Effect = <T>[ `Get | `Set(T) ]
// type State:Full = <T, Final>[ State:Effect<T> | `Final(Final)]

export const grammar = `
TEnum = "[" _ cases:EnumCases? _ "]"
EnumCases = first:EnumCase rest:( _ "|" _ EnumCase)* _ "|"? _
EnumCase = TagDecl / Type / Star
TagDecl = decorators:(Decorator _)* "\`" text:$IdText payload:TagPayload?
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
                                    ctx.ToTast[d.type](d as any, ctx),
                                ),
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
                                decorators: c.decorators.map((d) =>
                                    ctx.ToAst[d.type](d, ctx),
                                ),
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
                                    ...c.decorators.map((d) =>
                                        ctx.ToPP[d.type](d as any, ctx),
                                    ),
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
                    console.log('found it?', k.tag, k.loc.idx, ctx.hit);
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
                        return tdecorate(k, 'invalidEnum', ctx.hit, ctx.ctx);
                    }
                    for (let kase of expanded) {
                        console.log(kase, used);
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
                            return tdecorate(
                                k,
                                'conflictingEnumTag',
                                ctx.hit,
                                ctx.ctx,
                                [
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
                                ],
                            );
                        }
                        if (!used[kase.tag]) {
                            used[kase.tag] = kase;
                        }
                    }
                } else {
                    console.log('no resolve?', k);
                }
            }
            if (!isValidEnumCase(k, ctx.ctx)) {
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