import { unifyTypes } from '../../typing/unifyTypes';
import * as t from '../../typed-ast';
import { Ctx as TMCtx } from '../../typing/typeMatches';
import { allRecordItems } from './allRecordItems';
import { TRecord } from './records';

export const unifyRecords = (
    candidate: TRecord,
    expected: t.Type,
    ctx: TMCtx,
): false | t.Type => {
    if (expected.type !== 'TRecord') {
        return false;
    }
    if (candidate.open !== expected.open) {
        return false;
    }
    const citems = allRecordItems(candidate, ctx);
    const eitems = allRecordItems(expected, ctx);
    if (!citems || !eitems) {
        return false;
    }
    const cnum = Object.keys(citems).length;
    const eenum = Object.keys(eitems).length;
    if (cnum !== eenum) {
        return false;
    }
    for (const key of Object.keys(citems)) {
        if (!eitems[key]) {
            return false;
        }
        const un = unifyTypes(citems[key].value, eitems[key].value, ctx);
        if (un === false) {
            return false;
        }
        citems[key] = { ...citems[key], value: un };
    }
    return {
        ...candidate,
        spreads: [],
        items: Object.keys(citems).map((k) => citems[k]),
    };
};
