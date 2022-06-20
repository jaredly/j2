import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typesEqual';

export const analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    Expression_Apply(node, { ctx, hit }) {
        if (
            node.target.type === 'Ref' &&
            node.target.kind.type === 'Unresolved'
        ) {
            // Check if there are multiples
        }
        // Otherwise, try to get the type of the target & compare to the args
        const ttype = ctx.getType(node.target);
        if (!ttype) {
            // Something deeper has an error.
            // Huh I should probably do a transformFile checking that all expressions
            // have types before signing off.
            return null;
        }
        if (ttype?.type !== 'TLambda') {
            return decorate(node, 'Not a function', hit);
        }
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (ttype.args.length !== argTypes.length) {
            return decorate(node, 'Wrong number of arguments', hit);
        }
        let changed = false;
        const args = node.args.map((arg, i) => {
            const at = ctx.getType(arg);
            if (at == null) {
                return arg;
            }
            if (!typeMatches(at, ttype.args[i].typ, ctx._full)) {
                changed = true;
                return decorate(arg, 'Wrong type', hit);
            }
            return arg;
        });
        // iffff target is resolved, we check the args
        // if it's not resolved, then
        return changed ? { ...node, args } : null;
    },
};
