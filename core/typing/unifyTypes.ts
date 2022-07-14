import { Type } from '../typed-ast';
import { Ctx, typeMatches } from './typeMatches';

// For now, just take the greater of the two.
// To do this right, we need to allow enums to unify. [`A] [`B] -> [`A | `B]

export const unifyTypes = (candidate: Type, expected: Type, ctx: Ctx) => {
    // What do we delve into?
    // Lambdas
    // Enums
    // Records
    if (typeMatches(candidate, expected, ctx)) {
        return expected;
    }
    if (typeMatches(expected, candidate, ctx)) {
        return candidate;
    }
    return null;
};
