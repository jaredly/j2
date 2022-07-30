import { noloc } from '../ctx';
import { enumTypeMatches } from '../elements/enums';
import { recordAsTuple, TRecord } from '../elements/records';
import { transformExpression } from '../transform-tast';
import { Loc, TApply, TEnum, Type, EnumCase, Expression } from '../typed-ast';
import { initVerify, localTrackingVisitor, verifyVisitor } from './analyze';
import { isUnit, getType } from './getType';
import { Ctx, expandEnumCases } from './typeMatches';
import { unifyTypes } from './unifyTypes';
import { Ctx as ACtx } from './analyze';

export const isTaskable = (t: Type, ctx: Ctx): boolean => {
    if (t.type !== 'TEnum' || t.open) {
        return false;
    }
    const cases = expandEnumCases(t, ctx);
    return (
        cases != null &&
        cases.every((kase) => {
            return (
                kase.payload != null &&
                kase.payload.type === 'TRecord' &&
                kase.payload.items.length === 2 &&
                !kase.payload.spreads.length &&
                !kase.payload.open &&
                kase.payload.items[0].key === '0' &&
                kase.payload.items[1].key === '1'
            );
        })
    );
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
    let cases: TEnum['cases'] = [
        {
            type: 'EnumCase',
            decorators: [],
            loc,
            tag: 'Return',
            payload: targs.length > 1 ? targs[1] : tunit,
        },
    ];
    if (targs[0].type !== 'TEnum') {
        return null;
    }
    const expanded = expandEnumCases(targs[0], ctx);
    if (!expanded) {
        return null;
    }
    for (let one of expanded) {
        const two = asTwopul(one.payload);
        if (!two) {
            return null;
        }
        const [value, karg] = two;
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
                        value: {
                            type: 'TLambda',
                            loc: one.loc,
                            args: isUnit(karg)
                                ? []
                                : [{ label: 'arg', typ: karg, loc: karg.loc }],
                            result: taskType(targs, ctx, loc),
                        },
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
        cases,
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
    if (res.type !== 'TEnum') {
        return null;
    }
    const cases = expandEnumCases(res, ctx);
    if (!cases) {
        return null;
    }
    let result: null | Type = null;
    const effects: { [key: string]: { input: Type; output: Type } } = {};
    const subs: TApply[] = [];
    for (let kase of cases) {
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
                const iu = unifyTypes(effects[kase.tag].input, input, ctx);
                const ou = unifyTypes(effects[kase.tag].output, output, ctx);
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
                                    value: output,
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

export const matchesTask = (
    t: TEnum,
    loc: Loc,
    targs: Type[],
    ctx: Ctx,
): boolean => {
    if (t.open) {
        return false;
    }
    const expandedTask = expandTask(loc, targs, ctx);
    return expandedTask != null && enumTypeMatches(t, expandedTask, ctx);
};

export type TaskEffect = { tag: string; input: Type; output: Type };
export type TaskArgs = {
    effects: Array<TaskEffect>;
    result: Type;
};

export const makeTaskType = (
    effects: TaskEffect[],
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
                cases: effects.map(
                    ({ input, output, tag }): EnumCase | Type => ({
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
                                    value: output,
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

export const collectEffects = (t: Expression, ctx: Ctx): TaskEffect[] => {
    const collected: TaskEffect[] = [];
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
                    collected.push(
                        ...(effects as TEnum).cases.map((kase) => {
                            const [{ value: input }, { value: output }] = (
                                (kase as EnumCase).payload! as TRecord
                            ).items;
                            return {
                                tag: (kase as EnumCase).tag,
                                input,
                                output,
                            };
                        }),
                    );
                }
                return null;
            },
            Lambda(node, ctx) {
                return false;
            },
        },
        ctx,
    );
    return collected;
};
