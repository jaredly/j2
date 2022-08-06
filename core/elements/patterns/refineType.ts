import * as t from '../../typed-ast';
import { Ctx as ACtx } from '../../typing/analyze';
import { ConstraintMap } from '../../typing/typeMatches';
import { expandEnumCases } from '../../typing/expandEnumCases';
import { allRecordItems } from '../records/allRecordItems';
import { maybeExpandTask } from '../../typing/tasks';
import { patternIsExhaustive } from '../exhaustive';
import { Pattern } from '../pattern';

// export type PPath =
//     | { type: 'Tuple'; idx: number }
//     | {
//           type: 'Enum';
//           tag: string;
//       };
/*

can we bring this back?

// the arg is a vbl, right?
// orr can we do like a `type from pattern`?
// hmm maybe I can do that.
((a, b)) => a + b

*/
// export const typeFromPattern = (pat: Pattern, ctx: TCtx): t.Type => {
//     switch (pat.type) {
//         case 'PName':
//             return ctx.symType(pat.sym);
//         // case 'PTuple':
//         //     return {
//         //         type: 'T'
//         //     }
//     }
// };

export const refineType = (
    pat: Pattern,
    type: t.Type,
    ctx: ACtx,
    constraints?: ConstraintMap,
): t.Type | null => {
    if (constraints && type.type === 'TVbl') {
        // 🤔 waittt hmmmmm
        // const pt = typeForPattern(pat, ctx);
        // const current = addNewConstraint(
        //     type.id,
        //     { outer: pt },
        //     constraints,
        //     ctx,
        // );
        // if (current) {
        //     constraints[type.id] = current;
        //     return type;
        // }
    }
    switch (pat.type) {
        case 'PBlank':
        case 'PName':
            return null;
        case 'PArray':
            if (patternIsExhaustive(pat, type, ctx)) {
                return null;
            }
            return type;
        case 'PRecord': {
            if (type.type !== 'TRecord') {
                return type;
            }
            const items = allRecordItems(type, ctx);
            if (!items) {
                return type;
            }
            // let res: t.RecordKeyValue = [];
            // const byName: {[key: string]: Pattern} = {}
            // pat.items.forEach(({name, pat}) => byName[name] = pat)
            // for (let [name, value] of Object.entries(items)) {
            //     if (byName[name]) {
            //     }
            // }
            let remaining = false;

            for (let { name, pat: cpat } of pat.items) {
                if (!items[name]) {
                    return type;
                }
                const res = refineType(
                    cpat,
                    items[name].value,
                    ctx,
                    constraints,
                );
                if (res != null) {
                    remaining = true;
                    items[name] = { ...items[name], value: res };
                }
            }
            return remaining
                ? {
                      ...type,
                      spreads: [],
                      items: Object.values(items),
                  }
                : null;
        }
        case 'PDecorated': {
            return refineType(pat.inner, type, ctx, constraints);
        }
        case 'PEnum': {
            type = maybeExpandTask(type, ctx) ?? type;
            if (type.type !== 'TEnum') {
                return type;
            }
            const cases = expandEnumCases(type, ctx);
            if (!cases) {
                return { ...type, cases: [] }; // all out of cases!
            }
            const res: (t.Type | t.EnumCase)[] = [];
            for (let kase of cases.cases) {
                if (kase.tag === pat.tag) {
                    if (!pat.payload) {
                        // return {
                        //     ...type,
                        //     cases: cases.filter(k => k.tag !== pat.tag)
                        // };
                        continue;
                    }
                    if (kase.payload) {
                        const inner = refineType(
                            pat.payload,
                            kase.payload,
                            ctx,
                            constraints,
                        );
                        if (inner == null) {
                            continue;
                        }
                        res.push({ ...kase, payload: inner });
                    }
                    // return (
                    //     kase.payload != null &&
                    //     typeMatchesPattern(pat.payload, kase.payload, ctx)
                    // );
                } else {
                    res.push(kase);
                }
            }
            return {
                ...type,
                cases: res.concat(
                    cases.bounded.map((m) =>
                        m.type === 'local' ? m.local : m.inner,
                    ),
                ),
            };
        }
        // TODO: Records and such
    }
    return type;
};
