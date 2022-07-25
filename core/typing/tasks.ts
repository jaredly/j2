import { enumTypeMatches } from '../elements/enums';
import { Loc, TEnum, Type } from '../typed-ast';
import { isUnit } from './getType';
import { Ctx, expandEnumCases } from './typeMatches';

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
