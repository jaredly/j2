import { transformType } from '../transform-tast';
import { Type } from '../typed-ast';
import { Ctx } from './typeMatches';

export const hasFunctions = (t: Type, ctx: Ctx): boolean => {
    let found = false;
    transformType(
        t,
        {
            TLambda(node, ctx) {
                found = true;
                return false;
            },
            TRef(node, _) {
                const resolved = ctx.resolveRefsAndApplies(node);
                // Probably still global
                if (resolved?.type === 'TRef') {
                    return false;
                }
                found =
                    found || (resolved ? hasFunctions(resolved, ctx) : true);
                return false;
            },
            TApply(node, _) {
                const resolved = ctx.resolveRefsAndApplies(node);
                found =
                    found || (resolved ? hasFunctions(resolved, ctx) : true);
                return false;
            },
        },
        null,
    );
    return found;
};
