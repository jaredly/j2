import { noloc } from '../consts';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { addDecorator, Constraints, Ctx, tdecorate } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import {
    ConstraintMap,
    Ctx as TMCtx,
    expandEnumCases,
    payloadsEqual,
    typeMatches,
    unifyPayloads,
} from '../typing/typeMatches';
import { recordAsTuple } from './records';

// type State:Effect = <T>[ `Get | `Set(T) ]
// type State:Full = <T, Final>[ State:Effect<T> | `Final(Final)]

export const grammar = `
TEnum = "[" _ cases:EnumCases? _ "]"
EnumCases = first:EnumCase rest:( _ "|" _ EnumCase)* _ "|"?
EnumCase = TagDecl / Type / Star
TagDecl = decorators:(Decorator _)* "\`" text:$IdText payload:TagPayload?
// add '/ Record' here?
TagPayload = "(" _ items:TComma? _ ")"
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
                                    ? c.payload.items?.items.length === 1
                                        ? ctx.ToTast.Type(
                                              c.payload.items.items[0],
                                              ctx,
                                          )
                                        : {
                                              type: 'TRecord',
                                              loc: noloc,
                                              spreads: [],
                                              open: false,
                                              items:
                                                  c.payload.items?.items.map(
                                                      (p, i) => ({
                                                          type: 'TRecordKeyValue',
                                                          loc: noloc,
                                                          key: i.toString(),
                                                          value: ctx.ToTast.Type(
                                                              p,
                                                              ctx,
                                                          ),
                                                      }),
                                                  ) ?? [],
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
                                          items: {
                                              type: 'TComma',
                                              items: enumPayload(
                                                  c.payload,
                                                  ctx,
                                                  c.loc,
                                              ),
                                              loc: c.loc,
                                          },
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
        return pp.args(
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
                                      c.payload.items?.items.map((item) =>
                                          ctx.ToPP.Type(item, ctx),
                                      ) ?? [],
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
            }) ?? [],
            t.loc,
            '[',
            ']',
            false,
            ' |',
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

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { refsEqual } from '../refsEqual';
import { unifyTypes } from '../typing/unifyTypes';
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

export const isValidEnumCase = (c: t.Type, ctx: TMCtx): boolean => {
    // We'll special case 'recur ref that's applied'
    if (
        c.type === 'TApply' &&
        c.target.type === 'TRef' &&
        c.target.ref.type === 'Recur'
    ) {
        return ctx.getTopKind(c.target.ref.idx) === 'enum';
    }
    if (
        c.type === 'TApply' &&
        c.target.type === 'TRef' &&
        c.target.ref.type === 'Global' &&
        ctx.isBuiltinType(c.target, 'Task')
    ) {
        return true;
    }
    const resolved = ctx.resolveAnalyzeType(c);
    if (!resolved) {
        return false;
    }
    c = resolved;
    switch (c.type) {
        case 'TConst':
            return isValidEnumCase(c.inner, ctx);
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
            if (c.ref.type === 'Local') {
                const bound = ctx.getBound(c.ref.sym);
                if (bound) {
                    return isValidEnumCase(bound, ctx);
                }
            }
            if (c.ref.type === 'Global') {
                return ctx.isBuiltinType(c, 'task');
            }
            return false;
    }
};

export const payloadsUnify = (
    one: t.Type | undefined,
    two: t.Type | undefined,
    ctx: Ctx,
) => {
    if (!one || !two) {
        return !one === !two;
    }
    return unifyTypes(one, two, ctx) != false;
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    TEnum(node, ctx): null | t.TEnum {
        let changed = false;
        let used: { [key: string]: EnumCase } = {};
        const cases = node.cases.map((k) => {
            if (k.type === 'EnumCase') {
                if (
                    used[k.tag] &&
                    !payloadsUnify(used[k.tag].payload, k.payload, ctx.ctx)
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
                // ctx.ctx.debugger();
                const res = ctx.ctx.resolveRefsAndApplies(k);
                // console.log('resolving', k, res);
                if (res?.type === 'TEnum') {
                    const expanded = expandEnumCases(res, ctx.ctx);
                    if (!expanded) {
                        changed = true;
                        return tdecorate(k, 'invalidEnum', ctx);
                    }
                    for (let kase of expanded.cases) {
                        if (
                            used[kase.tag] &&
                            !payloadsUnify(
                                kase.payload,
                                used[kase.tag].payload,
                                ctx.ctx,
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

export const isWrappedEnum = (one: t.TRef, two: TEnum, ctx: TMCtx): boolean => {
    if (two.open) {
        return false;
    }
    if (
        two.cases.length >= 1 &&
        two.cases.every((k) => k.type === 'TRef' && refsEqual(k.ref, one.ref))
    ) {
        return true;
    }
    const cases = expandEnumCases(two, ctx);
    if (
        cases &&
        cases.cases.length === 0 &&
        cases.bounded.length === 1 &&
        cases.bounded[0].type === 'local'
    ) {
        return refsEqual(cases.bounded[0].local.ref, one.ref);
    }
    return false;
};

export const enumTypeMatches = (
    candidate: TEnum,
    expected: t.Type,
    ctx: TMCtx,
    path?: string[],
    constraints?: ConstraintMap,
) => {
    // [ `What ] matches [ `What | `Who ]
    // So everything in candidate needs to match something
    // in expected. And there need to not be any collisions name-wise
    if (expected.type === 'TRef' && isWrappedEnum(expected, candidate, ctx)) {
        return true;
    }
    if (expected.type !== 'TEnum') {
        return false;
    }
    const canEnums = expandEnumCases(candidate, ctx, path);
    const expEnums = expandEnumCases(expected, ctx, path);
    if (!canEnums || !expEnums) {
        return false;
    }
    const canMap = enumCaseMap(canEnums.cases, ctx);
    if (!canMap) {
        return false;
    }
    const expMap = enumCaseMap(expEnums.cases, ctx);
    if (!expMap) {
        return false;
    }

    for (let bound of canEnums.bounded) {
        if (bound.type === 'local') {
            const ref = bound.local.ref;
            if (
                !expEnums.bounded.some(
                    (b) => b.type === 'local' && refsEqual(ref, b.local.ref),
                )
            ) {
                return false;
            }
        } else {
            const inner = bound.inner;
            if (
                !expEnums.bounded.some(
                    (b) =>
                        b.type === 'task' &&
                        typeMatches(inner, b.inner, ctx, [], constraints),
                )
            ) {
                return false;
            }
        }
    }

    for (let kase of canEnums.cases) {
        if (!expMap[kase.tag]) {
            if (expected.open) {
                continue;
            }
            // console.log('no extra', kase.tag, expected.open, candidate.open);
            return false;
        }
        if (
            !payloadsEqual(
                kase.payload,
                expMap[kase.tag].payload,
                ctx,
                false,
                constraints,
            )
        ) {
            // console.log(`Payload not equal ${kase.tag}`);
            // console.log(typeToString(kase.payload!, ctx as FullContext));
            // console.log(
            //     typeToString(expMap[kase.tag].payload!, ctx as FullContext),
            // );
            // console.log(kase.payload, expMap[kase.tag].payload);
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
    const canMap = enumCaseMap(canEnums.cases, ctx);
    if (!canMap) {
        return false;
    }
    const expMap = enumCaseMap(expEnums.cases, ctx);
    if (!expMap) {
        return false;
    }

    for (let kase of canEnums.cases) {
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

    const others: t.Type[] = [];

    canEnums.bounded.forEach((item) => {
        const t = item.type === 'local' ? item.local : item.inner;
        for (let i = 0; i < others.length; i++) {
            const un = unifyTypes(t, others[i], ctx);
            if (un !== false) {
                others[i] = un;
                return;
            }
        }
        others.push(t);
    });

    expEnums.bounded.forEach((item) => {
        const t = item.type === 'local' ? item.local : item.inner;
        for (let i = 0; i < others.length; i++) {
            const un = unifyTypes(t, others[i], ctx);
            if (un !== false) {
                others[i] = un;
                return;
            }
        }
        others.push(t);
    });

    return {
        ...candidate,
        open: candidate.open || expected.open,
        cases: [
            ...Object.values(expMap),
            // TODO: dedup?
            ...others,
            // ...canEnums.bounded.map((m) =>
            //     m.type === 'local' ? m.local : m.inner,
            // ),
            // ...expEnums.bounded.map((m) =>
            //     m.type === 'local' ? m.local : m.inner,
            // ),
        ],
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
