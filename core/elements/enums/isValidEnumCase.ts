import * as t from '../../typed-ast';
import { Ctx as TMCtx } from '../../typing/typeMatches';

export const isValidEnumCase = (c: t.Type, ctx: TMCtx): boolean => {
    // We'll special case 'recur ref that's applied'
    if (
        c.type === 'TApply' &&
        c.target.type === 'TRef' &&
        c.target.ref.type === 'Recur'
    ) {
        return ctx.getTopKind(c.target.ref.idx) === 'enum';
    }
    if (
        c.type === 'TApply' &&
        c.target.type === 'TRef' &&
        c.target.ref.type === 'Global' &&
        ctx.isBuiltinType(c.target, 'Task')
    ) {
        return true;
    }
    const resolved = ctx.resolveAnalyzeType(c);
    if (!resolved) {
        return false;
    }
    c = resolved;
    switch (c.type) {
        case 'TConst':
            return isValidEnumCase(c.inner, ctx);
        case 'Number':
        case 'String':
        case 'TOps':
        case 'TLambda':
        case 'TVbl':
        case 'TVars':
        // These are taken care of by resolveAnalyzeType
        case 'TDecorated':
        case 'TApply':
        case 'TRecord':
            return false;
        case 'TBlank':
        case 'TEnum':
            return true;
        case 'TRef':
            if (c.ref.type === 'Recur') {
                return ctx.getTopKind(c.ref.idx) === 'enum';
            }
            if (c.ref.type === 'Local') {
                const bound = ctx.getBound(c.ref.sym);
                if (bound) {
                    return isValidEnumCase(bound, ctx);
                }
            }
            if (c.ref.type === 'Global') {
                return ctx.isBuiltinType(c, 'task');
            }
            return false;
    }
};
