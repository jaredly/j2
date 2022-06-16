import { FullContext, tref } from '../ctx';
import { extract, idToString } from '../ids';
import { Expression, Type } from '../typed-ast';

// UMM So btw this will resolve all TRefs.
export const getType = (expr: Expression, ctx: FullContext): Type | null => {
    switch (expr.type) {
        case 'TemplateString':
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
            return tref(
                ctx.types.names[expr.kind === 'Float' ? 'float' : 'int'],
            );
        case 'DecoratedExpression':
            return getType(expr.expr, ctx);
    }
};
