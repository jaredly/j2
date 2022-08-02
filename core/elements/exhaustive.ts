import { Ctx } from '../typing/analyze';
import { expandEnumCases } from '../typing/typeMatches';
import { enumCaseMap } from './enums';
import { Pattern } from './pattern';
import { allRecordItems } from './records';
import { Type } from './type';

export const patternIsExhaustive = (
    pat: Pattern,
    typ: Type,
    ctx: Ctx,
): boolean => {
    switch (pat.type) {
        case 'PEnum': {
            if (typ.type !== 'TEnum') {
                return false;
            }
            const cases = expandEnumCases(typ, ctx);
            const map = cases ? enumCaseMap(cases.cases, ctx) || {} : {};
            if (
                // Can't account for type variables
                cases?.bounded.length ||
                Object.keys(map).length !== 1 ||
                map[pat.tag] == null
            ) {
                return false;
            }
            if (!!pat.payload !== !!map[pat.tag].payload) {
                return false;
            }
            return (
                !pat.payload ||
                patternIsExhaustive(pat.payload, map[pat.tag].payload!, ctx)
            );
        }
        case 'PBlank':
        case 'PName':
            return true;
        case 'PRecord':
            if (typ.type !== 'TRecord') {
                return false;
            }
            const items = allRecordItems(typ, ctx);
            if (!items) {
                return false;
            }
            return pat.items.every((item) => {
                const t = items[item.name];
                if (!t) {
                    return false;
                }
                return patternIsExhaustive(item.pat, t.value, ctx);
            });
        case 'PDecorated':
            return patternIsExhaustive(pat.inner, typ, ctx);
        case 'Number':
        case 'String':
            return false;
    }
};
