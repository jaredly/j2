import { FullContext, tref } from '../ctx';
import { extract, idToString } from '../ids';
import { transformType } from '../transform-tast';
import { Expression, Type } from '../typed-ast';
import { typeMatches } from './typesEqual';

// UMM So btw this will resolve all TRefs.
export const getType = (expr: Expression, ctx: FullContext): Type | null => {
    switch (expr.type) {
        case 'TypeApplication': {
            const target = getType(expr.target, ctx);
            if (target?.type === 'TVars') {
                const symbols: { [num: number]: Type } = {};
                // So, I'm kindof allowing them to apply more?
                if (expr.args.length < target.args.length) {
                    return null;
                }
                let failed = false;
                expr.args.forEach((arg, i) => {
                    const targ = target.args[i];
                    if (!targ) {
                        return;
                    }
                    symbols[targ.sym.id] = arg;
                    if (targ.bound && !typeMatches(arg, targ.bound, ctx)) {
                        failed = true;
                    }
                });
                if (failed) {
                    return null;
                }
                // ok we need to transform the inner
                // target.args
                return transformType(
                    target.inner,
                    {
                        Type_TRef(node, ctx) {
                            if (
                                node.ref.type === 'Local' &&
                                symbols[node.ref.sym]
                            ) {
                                return symbols[node.ref.sym];
                                // const name = idToString(node.ref.id);
                                // const type = ctx.types.names[name];
                                // if (type) {
                                //     return type;
                                // }
                            }
                            return null;
                        },
                    },
                    null,
                );
            }
            // If they're trying to apply and they shouldn't,
            // I'll still let the type resolve.
            return target;
        }
        case 'TemplateString':
            if (expr.rest.length === 0) {
                return { type: 'String', loc: expr.loc, text: expr.first };
            }
            return tref(ctx.types.names['string']);
        case 'Ref':
            switch (expr.kind.type) {
                case 'Unresolved':
                    return null;
                case 'Global':
                    const { hash, idx } = extract(expr.kind.id);
                    return ctx.values.hashed[hash][idx].typ;
                case 'Local':
                    throw new Error('not yet');
                // return ctx.locals[expr.kind.sym].typ;
            }
        case 'Apply':
            const typ = getType(expr.target, ctx);
            if (typ?.type !== 'TLambda') {
                return null;
            }
            return typ.result;
        case 'Boolean':
            return tref(ctx.types.names['bool']);
        case 'Number':
            return expr;
        // return tref(
        //     ctx.types.names[expr.kind === 'Float' ? 'float' : 'int'],
        // );
        case 'DecoratedExpression':
            return getType(expr.expr, ctx);
    }
};
