import { noloc } from '../consts';
import { transformType, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { applyType } from '../typing/getType';
import { Ctx as TMCtx, typeMatches } from '../typing/typeMatches';
import { TVars, TVar } from './type-vbls';

export const tvarsMatches = (
    candidate: TVars,
    expected: t.Type,
    ctx: TMCtx,
) => {
    if (
        expected.type !== 'TVars' ||
        expected.args.length !== candidate.args.length ||
        !expected.args.every(
            // True if the bounds align
            (arg, i) => {
                const carg: TVar = (candidate as TVars).args[i];
                if (!arg.bound) {
                    return !carg.bound;
                }
                if (!carg.bound) {
                    return true; // bounded is a subset of unbounded
                }

                // REVERSED! For Variance
                return typeMatches(arg.bound, carg.bound!, ctx);
            },
        )
    ) {
        // console.log('bad args');
        return false;
    }
    let maxSym = 0;
    const visit: Visitor<null> = {
        TRef(node) {
            if (node.ref.type === 'Local') {
                maxSym = Math.max(maxSym, node.ref.sym);
            }
            return null;
        },
        TVar(node, ctx) {
            maxSym = Math.max(maxSym, node.sym.id);
            return null;
        },
    };
    transformType(expected, visit, null);
    transformType(candidate, visit, null);
    const bounds: { [key: number]: { bound: t.Type | null; name: string } } =
        {};
    let newTypes: t.TRef[] = expected.args.map((arg, i) => {
        const sym = maxSym + i + 1;
        bounds[sym] = { bound: arg.bound, name: arg.sym.name };
        return {
            type: 'TRef',
            loc: noloc,
            ref: { type: 'Local', sym: sym },
        };
    });
    ctx = ctx.withBounds(bounds);
    const capp = applyType(newTypes, candidate, ctx);
    const eapp = applyType(newTypes, expected, ctx);
    // Ohhhhhhhh failed to find bound.
    // console.log(newTypes);
    // console.log('applied=in', capp, eapp);
    return capp != null && eapp != null && typeMatches(capp, eapp, ctx);
};
