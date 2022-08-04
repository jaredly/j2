import { tref } from '../consts';
import { unifiedTypes } from '../elements/apply';
import { matchesBound } from '../elements/generics';
import { getLocals, Locals, typeForPattern } from '../elements/pattern';
import { allRecordItems, TRecord, TRecordKeyValue } from '../elements/records';
import { transformType } from '../transform-tast';
import { Expression, GlobalRef, Loc, TVars, Type } from '../typed-ast';
import { collapseConstraints, ifLocals } from './analyze';
import { collapseOps } from './ops';
import { collectEffects, inferTaskType, makeTaskType } from './tasks';
import { Ctx, expandEnumCases, typeMatches } from './typeMatches';
import { unifyTypes } from './unifyTypes';

export const isConst = (type: Type, ctx: Ctx, path?: string[]): boolean => {
    if (type.type === 'TVbl') {
        type = collapseConstraints(ctx.currentConstraints(type.id), ctx);
    }
    switch (type.type) {
        case 'Number':
        case 'String':
            return true;
        case 'TDecorated':
            return isConst(type.inner, ctx);
        case 'TRecord':
            if (type.open) {
                return false;
            }
            const items = allRecordItems(type, ctx, path);
            return (
                items != null &&
                Object.values(items).every((item) =>
                    isConst(item.value, ctx, path),
                )
            );
        case 'TEnum':
            if (type.open) {
                return false;
            }
            const cases = expandEnumCases(type, ctx, path);
            return (
                cases != null &&
                cases.bounded.length === 0 &&
                cases.cases.every(
                    (kase) => !kase.payload || isConst(kase.payload, ctx, path),
                )
            );
        case 'TApply':
        case 'TVbl':
        default:
            return false;
    }
};

export const applyType = (
    args: Type[],
    target: TVars,
    ctx: Ctx,
    path?: string[],
) => {
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

    const replacers: Type[] = [];

    target.args.forEach((targ, i) => {
        const arg = i < args.length ? args[i] : targ.default_;
        if (arg == null) {
            failed = true;
            return;
        }
        symbols[targ.sym.id] = arg;
        replacers.push(arg);
        transformType(
            arg,
            {
                TRef(node) {
                    replacers.push(node);
                    return null;
                },
            },
            null,
        );
        if (targ.bound && !matchesBound(arg!, targ.bound, ctx, path)) {
            failed = true;
        }
        ctx = ctx.withLocalTypes([{ sym: targ.sym, bound: arg }]);
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
                // Already applied
                if (replacers.includes(node)) {
                    return false;
                }
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
        case 'Await': {
            const res = getType(expr.target, ctx);
            if (!res) {
                return null;
            }
            const asTask = inferTaskType(res, ctx);
            if (asTask) {
                return asTask.args[1];
            }
            console.log('wait no', res, asTask);
            return null;
        }
        case 'Lambda': {
            // TODO Args! Got to ... make type variables,
            // and then figure things out.
            const locals: Locals = [];
            expr.args.forEach((arg) =>
                getLocals(arg.pat, arg.typ, locals, ctx),
            );
            ctx = ctx.withLocals(locals);
            let res = getType(expr.body, ctx);
            if (!res) {
                return null;
            }
            const effects = collectEffects(expr.body, ctx);
            if (effects.length) {
                res = makeTaskType(effects, res, ctx);
            }
            return {
                type: 'TLambda',
                loc: expr.loc,
                args: expr.args.map((arg) => ({
                    label: null,
                    typ: arg.typ,
                    loc: arg.loc,
                })),
                result: res,
            };
        }
        case 'TypeAbstraction': {
            let innerCtx = ctx.withLocalTypes(expr.items);
            const inner = getType(expr.body, innerCtx);
            return inner
                ? {
                      type: 'TVars',
                      args: expr.items,
                      inner,
                      loc: expr.loc,
                  }
                : null;
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
                    return ctx.typeForRecur(expr.kind.idx);
                case 'Local':
                    return ctx.localType(expr.kind.sym);
            }
        case 'Apply':
            let typ = getType(expr.target, ctx);
            if (typ?.type === 'TVbl') {
                const current = ctx.currentConstraints(typ.id);
                typ = collapseConstraints(current, ctx);
            }
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
        case 'Block': {
            if (!expr.stmts.length) {
                return unit(expr.loc);
            }
            for (let stmt of expr.stmts) {
                if (stmt.type === 'Let') {
                    const locals: Locals = [];
                    const typ =
                        ctx.getType(stmt.expr) ?? typeForPattern(stmt.pat);
                    getLocals(stmt.pat, typ, locals, ctx);
                    ctx = ctx.withLocals(locals);
                }
            }
            const last = expr.stmts[expr.stmts.length - 1];
            if (last.type === 'Let') {
                return unit(expr.loc);
            }
            return getType(last, ctx);
        }
        case 'If': {
            if (expr.no) {
                const no = getType(expr.no, ctx);
                const yes = getType(
                    expr.yes.block,
                    ctx.withLocals(ifLocals(expr.yes, ctx)),
                );
                const unified = no && yes && unifyTypes(yes, no, ctx);
                return unified ? unified : null;
            }
            return unit(expr.loc);
        }
        case 'Switch': {
            const ttype = getType(expr.target, ctx);
            if (!ttype) {
                return null;
            }
            const types = expr.cases
                .map((c) => {
                    const typ = ttype ?? typeForPattern(c.pat);
                    const locals: Locals = [];
                    getLocals(c.pat, typ, locals, ctx);
                    return getType(c.expr, ctx.withLocals(locals));
                })
                .filter(Boolean) as Type[];
            if (!types.length) {
                return unit(expr.loc);
            }
            let t = types[0];
            for (let i = 1; i < types.length; i++) {
                const res = unifyTypes(t, types[i], ctx);
                if (!res) {
                    return null;
                }
                t = res;
            }
            return t;
        }
        case 'ArrayExpr': {
            let element: Type = { type: 'TBlank', loc: expr.loc };
            let length: Type = {
                type: 'Number',
                kind: 'UInt',
                loc: expr.loc,
                value: 0,
            };
            for (let item of expr.items) {
                let t: [Type, Type];
                if (item.type === 'SpreadExpr') {
                    let got = arrayType(getType(item.inner, ctx), ctx);
                    if (!got) {
                        return null;
                    }
                    t = got;
                } else {
                    let el = getType(item, ctx);
                    if (!el) {
                        continue;
                    }
                    t = [
                        el,
                        {
                            type: 'Number',
                            value: 1,
                            kind: 'UInt',
                            loc: item.loc,
                        },
                    ];
                }
                const un = unifyTypes(t[0], element, ctx);
                element = un ? un : element;
                length = collapseOps(
                    {
                        type: 'TOps',
                        left: length,
                        right: [{ top: '+', right: t[1] }],
                        loc: expr.loc,
                    },
                    ctx,
                );
            }
            return {
                type: 'TApply',
                target: {
                    type: 'TRef',
                    ref: ctx.getBuiltinRef('Array')!,
                    loc: expr.loc,
                },
                args: [element, length],
                loc: expr.loc,
            };
        }
        default:
            let _x: never = expr;
            return null;
    }
};

export const arrayType = (t: Type | null, ctx: Ctx): [Type, Type] | null => {
    if (
        t &&
        t.type === 'TApply' &&
        t.args.length >= 1 &&
        t.target.type === 'TRef' &&
        t.target.ref.type === 'Global' &&
        ctx.isBuiltinType(t.target, 'Array')
    ) {
        return [
            t.args[0],
            t.args[1] ?? {
                type: 'TRef',
                ref: ctx.getBuiltinRef('uint')!,
                loc: t.loc,
            },
        ];
    }
    return null;
};

export const isUnit = (t: Type): boolean =>
    t.type === 'TRecord' &&
    !t.open &&
    t.items.length === 0 &&
    t.spreads.length === 0;

export const unit = (loc: Loc): TRecord => ({
    type: 'TRecord',
    loc: loc,
    spreads: [],
    items: [],
    open: false,
});
