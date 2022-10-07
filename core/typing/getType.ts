import { tref } from '../consts';
import { unifiedTypes } from '../elements/apply/apply';
import { matchesBound } from '../elements/generics/generics';
import { getLocals, Locals } from '../elements/pattern';
import { typeForPattern } from '../elements/patterns/typeForPattern';
import { TRecord, TRecordKeyValue } from '../elements/records/records';
import { allRecordItems } from '../elements/records/allRecordItems';
import { transformType } from '../transform-tast';
import { Expression, GlobalRef, Loc, TVars, Type } from '../typed-ast';
import { collapseConstraints } from './analyze';
import { ifLocals } from './localTrackingVisitor';
import { collapseOps } from './ops';
import { collectEffects, inferTaskType, makeTaskType } from './tasks';
import { ConstraintMap, Ctx, typeMatches } from './typeMatches';
import { expandEnumCases } from './expandEnumCases';
import { unifyTypes } from './unifyTypes';
import { ErrorTag } from '../errors';

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
    constraints?: ConstraintMap,
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
        if (targ.bound && !matchesBound(arg!, targ.bound, ctx, constraints)) {
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

export type GTFailure = {
    loc: Loc;
    error: ErrorTag;
    args?: { label: string; type: Type }[];
};
export type GTCache = {
    types: { [idx: number]: { type: Type | null; failures: GTFailure[] } };
    failures: GTFailure[];
};

export const getType = (
    expr: Expression,
    ctx: Ctx,
    constraints?: ConstraintMap,
    cache?: GTCache,
): Type | null => {
    if (!cache) {
        return getType_(expr, ctx, constraints, cache);
    }
    if (cache && cache.types[expr.loc.idx]) {
        return cache.types[expr.loc.idx].type;
    }
    const failures: GTFailure[] = [];
    const inner = getType_(expr, ctx, constraints, { ...cache, failures });
    cache.types[expr.loc.idx] = { type: inner, failures };
    return inner;
};

export const af = (cache: GTCache | undefined, failure: GTFailure) => {
    if (cache) {
        cache?.failures.push(failure);
    }
    return null;
};

// ok so anyway
// this could maybe do a ...visitor kind of thing as well.
const getType_ = (
    expr: Expression,
    ctx: Ctx,
    constraints?: ConstraintMap,
    cache?: GTCache,
): Type | null => {
    switch (expr.type) {
        case 'Await': {
            const res = getType(expr.target, ctx, constraints, cache);
            if (!res) {
                return null;
            }
            const asTask = inferTaskType(res, ctx);
            if (asTask) {
                return asTask.args[1];
            }
            console.log('wait no', res, asTask);
            return af(cache, {
                error: 'notATask',
                loc: expr.loc,
                args: [{ label: 'type', type: res }],
            });
        }
        case 'Lambda': {
            // TODO Args! Got to ... make type variables,
            // and then figure things out.
            const locals: Locals = [];
            expr.args.forEach((arg) =>
                getLocals(arg.pat, arg.typ, locals, ctx),
            );
            ctx = ctx.withLocals(locals);
            let res = getType(expr.body, ctx, constraints, cache);
            if (!res) {
                return null;
            }
            const effects = collectEffects(expr.body, ctx, cache);
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
            const inner = getType(expr.body, innerCtx, constraints, cache);
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
            const target = getType(expr.target, ctx, constraints, cache);
            if (target?.type === 'TVars') {
                return applyType(expr.args, target, ctx, constraints);
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
            let typ = getType(expr.target, ctx, constraints, cache);
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
            return getType(expr.expr, ctx, constraints, cache);
        case 'Record': {
            let alls: { [key: string]: TRecordKeyValue } = {};
            for (let spread of expr.spreads) {
                const t = getType(spread, ctx, constraints, cache);
                if (!t || t.type !== 'TRecord') {
                    return null;
                }
                const items = allRecordItems(t, ctx);
                Object.assign(alls, items);
            }
            for (let item of expr.items) {
                let t = getType(item.value, ctx, constraints, cache);
                if (!t) {
                    t = { type: 'TBlank', loc: item.value.loc };
                }
                if (alls[item.key]) {
                    const un = unifyTypes(alls[item.key].value, t, ctx);
                    if (!un) {
                        af(cache, {
                            error: 'cannotUnify',
                            loc: item.value.loc,
                            args: [
                                {
                                    label: 'expected',
                                    type: alls[item.key].value,
                                },
                                { label: 'found', type: t },
                            ],
                        });
                    } else {
                        t = un;
                    }
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
                            ? getType(expr.payload, ctx, constraints, cache) ??
                              undefined
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
                        getType(stmt.expr, ctx, constraints, cache) ??
                        typeForPattern(stmt.pat, ctx);
                    getLocals(stmt.pat, typ, locals, ctx);
                    ctx = ctx.withLocals(locals);
                }
            }
            const last = expr.stmts[expr.stmts.length - 1];
            if (last.type === 'Let') {
                return unit(expr.loc);
            }
            return getType(last, ctx, constraints, cache);
        }
        case 'If': {
            if (expr.no) {
                const no = getType(expr.no, ctx, constraints, cache);
                const yes = getType(
                    expr.yes.block,
                    ctx.withLocals(ifLocals(expr.yes, ctx)),
                    constraints,
                    cache,
                );
                const unified = no && yes && unifyTypes(yes, no, ctx);
                return unified ? unified : null;
            }
            return unit(expr.loc);
        }
        case 'Switch': {
            const ttype = getType(expr.target, ctx, constraints, cache);
            if (!ttype) {
                return null;
            }
            const types = expr.cases
                .map((c) => {
                    const typ = ttype ?? typeForPattern(c.pat, ctx);
                    const locals: Locals = [];
                    getLocals(c.pat, typ, locals, ctx);
                    return getType(
                        c.expr,
                        ctx.withLocals(locals),
                        constraints,
                        cache,
                    );
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
                    const inner = getType(item.inner, ctx, constraints, cache);
                    if (!inner) {
                        continue;
                    }
                    let got = arrayType(inner, ctx);
                    if (!got) {
                        af(cache, {
                            error: 'notAnArray',
                            loc: item.loc,
                            args: [{ label: 'type', type: inner }],
                        });
                        continue;
                    }
                    t = got;
                } else {
                    let el = getType(item, ctx, constraints, cache);
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
                if (!un) {
                    af(cache, {
                        error: 'cannotUnify',
                        loc: item.loc,
                        args: [
                            { label: 'expected', type: element },
                            { label: 'found', type: t[0] },
                        ],
                    });
                }
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
