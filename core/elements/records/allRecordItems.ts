import { getRef } from '../../typing/typeMatches';
import * as t from '../../typed-ast';
import { Ctx as TMCtx } from '../../typing/typeMatches';
import { TRecord } from './records';

export const allRecordItems = (
    record: TRecord,
    ctx: TMCtx,
    path: string[] = [],
): null | { [key: string]: t.TRecordKeyValue } => {
    const items: { [key: string]: t.TRecordKeyValue } = {};
    for (const spread of record.spreads) {
        const resolved = ctx.resolveRefsAndApplies(spread);
        if (!resolved || resolved.type !== 'TRecord') {
            return null;
        }

        const r = getRef(spread);
        if (r) {
            const k = t.refHash(r.ref);
            if (path.includes(k)) {
                return null;
            }
            path = path.concat([k]);
        }

        const inner = allRecordItems(resolved, ctx, path);
        if (!inner) {
            return null;
        }
        for (let k of Object.keys(inner)) {
            items[k] = inner[k];
        }
    }
    for (const item of record.items) {
        items[item.key] = item;
    }
    return items;
};
