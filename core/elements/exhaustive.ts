import { Ctx } from '../typing/analyze';
import { arrayType } from '../typing/getType';
import { numOps } from '../typing/ops';
import { expandEnumCases } from '../typing/expandEnumCases';
import { enumCaseMap } from './enums/enums';
import { Pattern } from './pattern';
import { allRecordItems } from './records/allRecordItems';
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
        case 'PArray': {
            const t = arrayType(typ, ctx);
            if (!t) {
                return false;
            }
            if (
                pat.items.some(
                    (item) =>
                        item.type !== 'PSpread' &&
                        !patternIsExhaustive(item, t[0], ctx),
                )
            ) {
                return false;
            }
            if (pat.items.some((p) => p.type === 'PSpread')) {
                return true;
            }
            // HACK HACK HACK
            if (
                t[1].type !== 'TRef' &&
                t[1].type !== 'Number' &&
                t[1].type !== 'TOps'
            ) {
                return false;
            }
            const ops = numOps(t[1], ctx);
            return ops && ops.num <= pat.items.length && ops.mm.upperLimit;
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
