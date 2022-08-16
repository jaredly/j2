import * as t from '../../typed-ast';
import { Ctx as TMCtx, unifyPayloads } from '../../typing/typeMatches';
import { expandEnumCases } from '../../typing/expandEnumCases';
import { unifyTypes } from '../../typing/unifyTypes';
import { TEnum, enumCaseMap } from './enums';

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
