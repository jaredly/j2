import { unifyEnums } from '../elements/enums';
import { unifyRecords } from '../elements/records';
import { Type } from '../typed-ast';
import { Ctx, typeMatches } from './typeMatches';

// For now, just take the greater of the two.
// To do this right, we need to allow enums to unify. [`A] [`B] -> [`A | `B]

export const unifyTypes = (one: Type, two: Type, ctx: Ctx): false | Type => {
    const c2 = ctx.resolveRefsAndApplies(one)!;
    const e2 = ctx.resolveRefsAndApplies(two);
    if (c2 != null) {
        one = c2;
    }
    if (e2 != null) {
        two = e2;
    }

    while (two.type === 'TDecorated') {
        two = two.inner;
    }
    while (one.type === 'TDecorated') {
        one = one.inner;
    }

    if (one.type === 'TEnum') {
        return unifyEnums(one, two, ctx);
    }
    if (one.type === 'TRecord') {
        return unifyRecords(one, two, ctx);
    }

    // What do we delve into?
    // Lambdas
    // Enums
    // Records
    if (typeMatches(one, two, ctx)) {
        return two;
    }
    if (typeMatches(two, one, ctx)) {
        return one;
    }
    return false;
};
