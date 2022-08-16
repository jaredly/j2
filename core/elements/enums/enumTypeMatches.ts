import * as t from '../../typed-ast';
import {
    addf,
    ConstraintMap,
    Ctx as TMCtx,
    payloadsEqual,
    TDiffs,
    TMPaths,
    typeMatches,
} from '../../typing/typeMatches';
import { expandEnumCases } from '../../typing/expandEnumCases';
import { refsEqual } from '../../refsEqual';
import { inferTaskType, tunit } from '../../typing/tasks';
import { TEnum, isWrappedEnum, enumCaseMap } from './enums';

export const enumTypeMatches = (
    candidate: TEnum,
    expected: t.Type,
    ctx: TMCtx,
    path: TMPaths,
    constraints?: ConstraintMap,
    diffs?: TDiffs,
) => {
    // [ `What ] matches [ `What | `Who ]
    // So everything in candidate needs to match something
    // in expected. And there need to not be any collisions name-wise
    if (expected.type === 'TRef' && isWrappedEnum(expected, candidate, ctx)) {
        return true;
    }
    if (
        expected.type === 'TApply' &&
        ctx.isBuiltinType(expected.target, 'Task')
    ) {
        let [a1, a2 = tunit] = expected.args;
        const inferred = inferTaskType(candidate, ctx);
        if (!inferred || !a1 || !a2) {
            return false;
        }
        return (
            typeMatches(inferred.args[0], a1, ctx, path, constraints, diffs) &&
            typeMatches(inferred.args[1], a2, ctx, path, constraints, diffs)
        );
    }
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
                        typeMatches(
                            inner,
                            b.inner,
                            ctx,
                            path,
                            constraints,
                            diffs,
                        ),
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
            // return false;
            return addf(
                diffs,
                candidate,
                expected,
                ctx,
                `extra payload ${kase.tag}`,
            );
        }
        if (
            !payloadsEqual(
                kase.payload,
                expMap[kase.tag].payload,
                ctx,
                false,
                constraints,
                path,
                diffs,
            )
        ) {
            // console.log(`Payload not equal ${kase.tag}`);
            // console.log(typeToString(kase.payload!, ctx as FullContext));
            // console.log(
            //     typeToString(expMap[kase.tag].payload!, ctx as FullContext),
            // );
            // console.log(kase.payload, expMap[kase.tag].payload);
            return addf(
                diffs,
                candidate,
                expected,
                ctx,
                `payload ${kase.tag} mismatch`,
            );
        }
    }
    if (candidate.open && !expected.open) {
        return false;
    }

    return true;
};
