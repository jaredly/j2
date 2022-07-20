import { tref } from '../ctx';
import { getLocals, Locals } from '../elements/pattern';
import { allRecordItems, TRecordKeyValue } from '../elements/records';
import { transformType } from '../transform-tast';
import { Expression, GlobalRef, TVars, Type } from '../typed-ast';
import { collapseOps } from './ops';
import { Ctx, typeMatches } from './typeMatches';

export const applyType = (args: Type[], target: TVars, ctx: Ctx) => {
    let minArgs = target.args.findIndex((arg) => arg.default_);
    if (minArgs === -1) {
        minArgs = target.args.length;
    }

    const symbols: { [num: number]: Type } = {};
    // So, I'm kindof allowing them to apply more?
    if (args.length < minArgs) {
        console.log('len');
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
            TypePost(node, _) {
                if (node.type === 'TOps') {
                    return collapseOps(node, ctx);
                }
                return null;
            },
        },
        null,
    );
};

const maybeTref = (ref: GlobalRef | null) => (ref ? tref(ref) : null);

// UMM So btw this will resolve all TRefs? Maybe? hmm maybe not..

// ok so anyway
// this could maybe do a ...visitor kind of thing as well.
export const getType = (expr: Expression, ctx: Ctx): Type | null => {
    switch (expr.type) {
        case 'Lambda': {
            // TODO Args! Got to ... make type variables,
            // and then figure things out.
            const locals: Locals = [];
            expr.args.forEach((arg) =>
                getLocals(arg.pat, arg.typ, locals, ctx),
            );
            ctx = ctx.withLocals(locals);
            const res = getType(expr.body, ctx);
            if (!res) {
                // ctx.debugger();
                return null;
            }
            return {
                type: 'TLambda',
                loc: expr.loc,
                args: expr.args.map((arg) => ({
                    label: '',
                    typ: arg.typ,
                    loc: arg.loc,
                })),
                result: res,
            };
        }
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
                    return ctx.localType(expr.kind.sym);
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
        case 'Record': {
            let alls: { [key: string]: TRecordKeyValue } = {};
            for (let spread of expr.spreads) {
                const t = getType(spread, ctx);
                if (!t || t.type !== 'TRecord') {
                    return null;
                }
                const items = allRecordItems(t, ctx);
                Object.assign(alls, items);
            }
            for (let item of expr.items) {
                const t = getType(item.value, ctx);
                if (!t) {
                    return null;
                }
                alls[item.key] = {
                    type: 'TRecordKeyValue',
                    value: t,
                    key: item.key,
                    loc: item.loc,
                    default_: null,
                };
            }
            return {
                type: 'TRecord',
                loc: expr.loc,
                spreads: [],
                items: Object.values(alls),
                open: false,
            };
        }
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
