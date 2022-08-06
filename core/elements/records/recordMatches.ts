import { Constraints } from '../../typing/analyze';
import { addf, TDiffs, TMPaths, typeMatches } from '../../typing/typeMatches';
import * as t from '../../typed-ast';
import { Ctx as TMCtx } from '../../typing/typeMatches';
import { allRecordItems } from './allRecordItems';
import { TRecord } from './records';

export const recordMatches = (
    candidate: TRecord,
    expected: t.Type,
    ctx: TMCtx,
    path: TMPaths,
    constraints?: { [key: number]: Constraints },
    diffs?: TDiffs,
) => {
    if (expected.type !== 'TRecord') {
        return false;
    }
    if (candidate.open && !expected.open) {
        return false;
    }
    const citems = allRecordItems(candidate, ctx);
    const eitems = allRecordItems(expected, ctx);
    if (!citems || !eitems) {
        return false;
    }
    for (const key of Object.keys(eitems)) {
        if (!citems[key] && !eitems[key].default_) {
            // return false;
            return addf(diffs, candidate, expected, ctx, `missing key ${key}`);
        }
    }
    for (const key of Object.keys(citems)) {
        if (!eitems[key]) {
            if (expected.open) {
                continue;
            }
            // return false;
            return addf(diffs, candidate, expected, ctx, `extra key ${key}`);
        }
        if (
            !typeMatches(
                citems[key].value,
                eitems[key].value,
                ctx,
                path,
                constraints,
                diffs,
            )
        ) {
            return addf(diffs, candidate, expected, ctx, `record attr ${key}`);
        }
    }
    return true;
};
