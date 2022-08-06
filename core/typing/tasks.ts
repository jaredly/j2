import { noloc } from '../consts';
import { enumCaseMap } from '../elements/enums/enums';
import { enumTypeMatches } from '../elements/enums/enumTypeMatches';
import { recordAsTuple, TRecord } from '../elements/records/records';
import { transformExpression } from '../transform-tast';
import { Loc, TApply, TEnum, Type, EnumCase, Expression } from '../typed-ast';
import { initVerify, verifyVisitor } from './verify';
import { localTrackingVisitor } from './localTrackingVisitor';
import { isUnit, getType } from './getType';
import { Ctx } from './typeMatches';
import { expandEnumCases, LocalUnexpandable } from './expandEnumCases';
import { unifyTypes } from './unifyTypes';
import { collapseConstraints, Ctx as ACtx } from './analyze';

export const isTaskable = (t: Type, ctx: Ctx): boolean => {
    if (ctx.isBuiltinType(t, 'task')) {
        return true;
    }
    if (t.type === 'TVbl') {
        t = collapseConstraints(ctx.currentConstraints(t.id), ctx) ?? t;
    }
    if (t.type === 'TRef' && t.ref.type === 'Local') {
        const bound = ctx.getBound(t.ref.sym);
        if (bound && ctx.isBuiltinType(bound, 'task')) {
            return true;
        }
    }
    if (t.type !== 'TEnum' || t.open) {
        return false;
    }
    const cases = expandEnumCases(t, ctx);
    return (
        cases != null &&
        cases.cases.every((kase) => {
            return (
                kase.payload != null &&
                kase.payload.type === 'TRecord' &&
                kase.payload.items.length === 2 &&
                !kase.payload.spreads.length &&
                !kase.payload.open &&
                kase.payload.items[0].key === '0' &&
                kase.payload.items[1].key === '1'
            );
        }) &&
        cases.bounded.every((bound) => {
            return bound.type === 'local' && isTaskable(bound.bound, ctx);
        })
    );
};

export const tnever: TEnum = {
    type: 'TEnum',
    loc: noloc,
    open: false,
    cases: [],
};

export const tunit: Type = {
    type: 'TRecord',
    spreads: [],
    items: [],
    loc: {
        start: { line: 0, column: 0, offset: -1 },
        end: { line: 0, column: 0, offset: -1 },
        idx: -1,
    },
    open: false,
};

export const asTwopul = (t: Type | undefined): [Type, Type] | null => {
    if (
        t?.type !== 'TRecord' ||
        t.open ||
        t.spreads.length ||
        t.items.length !== 2 ||
        t.items[0].key !== '0' ||
        t.items[1].key !== '1'
    ) {
        return null;
    }
    return [t.items[0].value, t.items[1].value];
};

export const taskType = (args: Type[], ctx: Ctx, loc: Loc): Type => {
    return {
        type: 'TApply',
        loc,
        args,
        target: {
            type: 'TRef',
            ref: ctx.getBuiltinRef('Task')!,
            loc,
        },
    };
};

export const expandTask = (loc: Loc, targs: Type[], ctx: Ctx): TEnum | null => {
    let cases: TEnum['cases'] = [];
    if (targs.length == 1 || targs[1].type !== 'TBlank') {
        cases.push({
            type: 'EnumCase',
            decorators: [],
            loc,
            tag: 'Return',
            payload: targs.length > 1 ? targs[1] : tunit,
        });
    }
    const extraInner =
        targs.length > 2 && targs[2].type === 'TEnum'
            ? expandEnumCases(targs[2], ctx)
            : null;
    const first = ctx.resolveRefsAndApplies(targs[0]) ?? targs[0];
    let expanded: ReturnType<typeof expandEnumCases>;
    if (first.type === 'TRef' && first.ref.type === 'Local') {
        const bound = ctx.getBound(first.ref.sym);
        if (!bound) {
            return null;
        }
        expanded = {
            cases: [],
            bounded: [{ type: 'local', local: first, bound }],
        };
    } else if (first.type !== 'TEnum') {
        return null;
    } else {
        const result = expandEnumCases(first, ctx);
        if (!result) {
            return null;
        }
        expanded = result;
    }

    if (
        expanded.bounded.some((s) => s.type === 'task') ||
        extraInner?.bounded.some((s) => s.type === 'task')
    ) {
        return null;
    }
    const innerTask = taskType(
        [
            {
                type: 'TEnum',
                cases: [
                    ...expanded.cases,
                    ...(extraInner?.cases ?? []),
                    ...expanded.bounded.map(
                        (m) => (m as LocalUnexpandable).local,
                    ),
                    ...(extraInner?.bounded.map(
                        (m) => (m as LocalUnexpandable).local,
                    ) ?? []),
                ],
                loc: loc,
                open: false,
            },
            targs.length > 1 ? targs[1] : tunit,
        ],
        ctx,
        loc,
    );
    for (let one of expanded.cases) {
        const two = asTwopul(one.payload);
        if (!two) {
            return null;
        }
        const [value, karg] = two;
        const k: Type =
            karg.type === 'TEnum' && !karg.open && !karg.cases.length
                ? tunit
                : {
                      type: 'TLambda',
                      loc: one.loc,
                      args: [{ label: 'arg', typ: karg, loc: karg.loc }],
                      result: innerTask,
                  };
        cases.push({
            type: 'EnumCase',
            decorators: [],
            loc: one.loc,
            tag: one.tag,
            payload: {
                type: 'TRecord',
                spreads: [],
                open: false,
                loc: one.loc,
                items: [
                    {
                        key: '0',
                        value,
                        type: 'TRecordKeyValue',
                        default_: null,
                        loc: value.loc,
                    },
                    {
                        key: '1',
                        value: k,
                        type: 'TRecordKeyValue',
                        default_: null,
                        loc: value.loc,
                    },
                ],
            },
        });
    }

    return {
        type: 'TEnum',
        open: false,
        cases: [
            ...cases,
            ...(expanded.bounded.length
                ? [
                      taskType(
                          [
                              {
                                  type: 'TEnum',
                                  cases: expanded.bounded.map(
                                      (m) => (m as LocalUnexpandable).local,
                                  ),
                                  open: false,
                                  loc,
                              },
                              targs[1] ?? tunit,
                          ],
                          ctx,
                          loc,
                      ),
                  ]
                : []),
        ],
        loc,
    };
};

// [ `Print(string, () => `Return(int)) | `Read((), (v: string) => `Return(int)) | `Return(int) ]
// ->
// Task<[`Print(string, ()), `Read((), string)], int>
export const inferTaskType = (t: Type, ctx: Ctx): TApply | null => {
    // ctx.debugger();
    const res = ctx.resolveRefsAndApplies(t) ?? t;
    if (
        res.type === 'TApply' &&
        ctx.isBuiltinType(res.target, 'Task') &&
        res.args.length === 2
    ) {
        return t as TApply;
    }
    let cases: ReturnType<typeof expandEnumCases>;
    if (res.type === 'TRef' && res.ref.type === 'Local') {
        const bound = ctx.getBound(res.ref.sym);
        if (!bound) {
            return null;
        }
        cases = { cases: [], bounded: [{ type: 'local', local: res, bound }] };
    } else if (res.type !== 'TEnum') {
        return null;
    } else {
        const expanded = expandEnumCases(res, ctx);
        if (!expanded) {
            return null;
        }
        cases = expanded;
    }
    let result: null | Type = null;
    const effects: { [key: string]: { input: Type; output: Type | null } } = {};
    const subs: TApply[] = [];
    for (let kase of cases.cases) {
        if (!kase.payload) {
            return null;
        }
        if (kase.tag === 'Return') {
            if (result) {
                const un = unifyTypes(result, kase.payload, ctx);
                if (un === false) {
                    return null;
                }
                result = un;
            } else {
                result = kase.payload;
            }
        } else {
            if (kase.payload.type !== 'TRecord') {
                return null;
            }
            const items = recordAsTuple(kase.payload);
            if (!items || items.length !== 2) {
                return null;
            }
            let [input, fn] = items;
            fn = ctx.resolveRefsAndApplies(fn) ?? fn;
            if (
                fn.type === 'TRecord' &&
                fn.items.length === 0 &&
                !fn.open &&
                fn.spreads.length === 0
            ) {
                if (result == null) {
                    result = { type: 'TBlank', loc: fn.loc };
                }
                // no result
                // continue
                if (effects[kase.tag]) {
                    if (effects[kase.tag].output) {
                        return null;
                    }
                    const un = unifyTypes(effects[kase.tag].input, input, ctx);
                    if (un === false) {
                        return null;
                    }
                    effects[kase.tag] = { input: un, output: null };
                } else {
                    effects[kase.tag] = { input, output: null };
                }
                continue;
            }
            if (fn.type !== 'TLambda' || fn.args.length !== 1) {
                return null;
            }
            const output = fn.args[0].typ;
            // TODO: can this get me into recursion trouble?
            const sub = inferTaskType(fn.result, ctx);
            if (!sub) {
                return null;
            }
            const ru: false | Type = result
                ? unifyTypes(result, sub.args[1], ctx)
                : sub.args[1];
            if (ru === false) {
                return null;
            }
            result = ru;
            subs.push(sub);
            if (effects[kase.tag]) {
                const current = effects[kase.tag];
                if (!current.output) {
                    return null;
                }
                const iu = unifyTypes(current.input, input, ctx);
                const ou = unifyTypes(current.output, output, ctx);
                if (!iu || !ou) {
                    return null;
                }
                effects[kase.tag] = { input: iu, output: ou };
            } else {
                effects[kase.tag] = { input, output: output };
            }
        }
    }
    if (!result) {
        return null;
    }
    return {
        type: 'TApply',
        target: {
            type: 'TRef',
            ref: ctx.getBuiltinRef('Task')!,
            loc: noloc,
        },
        args: [
            {
                type: 'TEnum',
                open: false,
                cases: Object.entries(effects).map(
                    ([tag, { input, output }]): EnumCase | Type => ({
                        type: 'EnumCase',
                        decorators: [],
                        loc: noloc,
                        tag,
                        payload: {
                            type: 'TRecord',
                            spreads: [],
                            open: false,
                            loc: noloc,
                            items: [
                                {
                                    type: 'TRecordKeyValue',
                                    key: '0',
                                    value: input,
                                    default_: null,
                                    loc: noloc,
                                },
                                {
                                    type: 'TRecordKeyValue',
                                    key: '1',
                                    value: output == null ? tnever : output,
                                    default_: null,
                                    loc: noloc,
                                },
                            ],
                        },
                    }),
                ),
                loc: noloc,
            },
            result,
        ],
        loc: noloc,
    };
};

export const maybeExpandTask = (t: Type, ctx: Ctx): Type | null => {
    if (t.type === 'TApply' && ctx.isBuiltinType(t.target, 'Task')) {
        return expandTask(t.loc, t.args, ctx);
    }
    return t;
};

// export const matchesTask = (
//     t: TEnum,
//     loc: Loc,
//     targs: Type[],
//     ctx: Ctx,
// ): boolean => {
//     if (t.open) {
//         return false;
//     }
//     const expandedTask = expandTask(loc, targs, ctx);
//     return expandedTask != null && enumTypeMatches(t, expandedTask, ctx);
// };

export type TaskEffect = { tag: string; input: Type; output: Type };
export type TaskArgs = {
    effects: Array<TaskEffect>;
    result: Type;
};

export const makeTaskType = (
    effects: (EnumCase | Type)[],
    result: Type,
    ctx: Ctx,
): Type => {
    return {
        type: 'TApply',
        target: {
            type: 'TRef',
            ref: ctx.getBuiltinRef('Task')!,
            loc: noloc,
        },
        args: [
            {
                type: 'TEnum',
                open: false,
                cases: effects,
                loc: noloc,
            },
            result,
        ],
        loc: noloc,
    };
};

export const collectEffects = (
    t: Expression,
    ctx: Ctx,
): (EnumCase | Type)[] => {
    const cases: EnumCase[] = [];
    const others: Type[] = [];
    // const collected: (EnumCase | Type)[] = [];
    transformExpression(
        t,
        {
            ...localTrackingVisitor,
            // umm so gettype is likely going to fail here.
            // need something like the verifyvisitor if I want this to work
            Await(node, ctx) {
                const res = getType(node.target, ctx);
                if (!res) {
                    return null;
                }
                const asTask = inferTaskType(res, ctx);
                if (asTask) {
                    const [effects, result] = asTask.args;
                    if (effects.type === 'TEnum') {
                        effects.cases.forEach((kase) => {
                            if (kase.type === 'EnumCase') {
                                cases.push(kase);
                            } else {
                                others.push(kase);
                            }
                        });
                    } else {
                        others.push(effects);
                    }
                }
                return null;
            },
            Lambda(node, ctx) {
                return false;
            },
        },
        ctx,
    );
    const map = enumCaseMap(cases, ctx);
    if (!map) {
        return [...cases, ...others];
    }
    return [...Object.values(map), ...others];
};
