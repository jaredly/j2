import { FullContext, tref } from '../ctx';
import { extract, idToString } from '../ids';
import { transformType } from '../transform-tast';
import { Expression, Type, TVars, GlobalRef } from '../typed-ast';
import { typeMatches, Ctx } from './typeMatches';

export const applyType = (args: Type[], target: TVars, ctx: Ctx) => {
    let minArgs = target.args.findIndex((arg) => arg.default_);
    if (minArgs === -1) {
        minArgs = target.args.length;
    }

    const symbols: { [num: number]: Type } = {};
    // So, I'm kindof allowing them to apply more?
    if (args.length < minArgs) {
        return null;
    }
    let failed = false;

    target.args.forEach((targ, i) => {
        const arg = i < args.length ? args[i] : targ.default_;
        if (arg == null) {
            failed = true;
        }
        symbols[targ.sym.id] = arg!;
        if (targ.bound && !typeMatches(arg!, targ.bound, ctx)) {
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
                if (node.ref.type === 'Local' && symbols[node.ref.sym]) {
                    return symbols[node.ref.sym];
                }
                return null;
            },
        },
        null,
    );
};

const maybeTref = (ref: GlobalRef | null) => (ref ? tref(ref) : null);

// UMM So btw this will resolve all TRefs? Maybe? hmm maybe not..
export const getType = (expr: Expression, ctx: Ctx): Type | null => {
    switch (expr.type) {
        case 'TypeApplication': {
            const target = getType(expr.target, ctx);
            if (target?.type === 'TVars') {
                return applyType(expr.args, target, ctx);
            }
            // If they're trying to apply and they shouldn't,
            // I'll still let the type resolve.
            return target;
        }
        case 'TemplateString':
            if (expr.rest.length === 0) {
                return { type: 'String', loc: expr.loc, text: expr.first };
            }
            return maybeTref(ctx.getBuiltinRef('string'));
        case 'Ref':
            switch (expr.kind.type) {
                case 'Unresolved':
                    return null;
                case 'Global':
                    return ctx.getValueType(expr.kind.id);
                case 'Recur':
                    return null;
                case 'Local':
                    throw new Error('not yet');
            }
        case 'Apply':
            const typ = getType(expr.target, ctx);
            if (typ?.type !== 'TLambda') {
                return null;
            }
            return typ.result;
        case 'Boolean':
            return maybeTref(ctx.getBuiltinRef('bool'));
        case 'Number':
            return expr;
        case 'DecoratedExpression':
            return getType(expr.expr, ctx);
        case 'Enum': {
            return {
                type: 'TEnum',
                loc: expr.loc,
                open: false,
                cases: [
                    {
                        type: 'EnumCase',
                        tag: expr.tag,
                        loc: expr.loc,
                        decorators: [],
                        payload: expr.payload
                            ? getType(expr.payload, ctx) ?? undefined
                            : undefined,
                    },
                ],
            };
        }
        default:
            let _x: never = expr;
            return null;
    }
};
