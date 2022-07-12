import { noloc, refsEqual } from '../ctx';
import { Id } from '../ids';
import { transformType, Visitor } from '../transform-tast';
import {
    EnumCase,
    GlobalRef,
    refHash,
    RefKind,
    TApply,
    TEnum,
    TLambda,
    TOps,
    TRef,
    TVar,
    TVars,
    Type,
} from '../typed-ast';
import { applyType } from './getType';
import {
    collapseOps,
    justStringAdds,
    stringAddsMatch,
    numOps,
    eopsMatch,
    justAdds,
    stringOps,
} from './ops';

export const trefsEqual = (a: TRef['ref'], b: TRef['ref']): boolean => {
    if (a.type === 'Unresolved' || b.type === 'Unresolved') {
        return false;
    }
    return refsEqual(a, b);
};

export type Ctx = {
    isBuiltinType(t: Type, name: string): boolean;
    getBuiltinRef(name: string): GlobalRef | null;
    resolveRefsAndApplies(t: Type, path?: string[]): Type | null;
    getValueType(id: Id): Type | null;
    getBound(sym: number): Type | null;
    log(...args: any[]): void;
    /** Only triggers the devtools debugger if the fixture is pinned. */
    debugger(): void;
    withBounds(bounds: { [sym: number]: Type | null }): Ctx;
};

export const payloadsEqual = (
    one: undefined | Type,
    two: undefined | Type,
    ctx: Ctx,
    bidirectional: boolean,
) => {
    if ((one != null) != (two != null)) {
        return false;
    }
    if (!one || !two) {
        return true;
    }
    // Need bidirectional equality in this case
    return (
        typeMatches(one, two, ctx) &&
        (!bidirectional || typeMatches(two, one, ctx))
    );
};

export const typeMatches = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
): boolean => {
    // Ok I need like a "resolve refs" function
    const c2 = ctx.resolveRefsAndApplies(candidate)!;
    const e2 = ctx.resolveRefsAndApplies(expected);
    if (c2 != null) {
        candidate = c2;
    }
    if (e2 != null) {
        expected = e2;
    }

    while (expected.type === 'TDecorated') {
        expected = expected.inner;
    }
    while (candidate.type === 'TDecorated') {
        candidate = candidate.inner;
    }

    if (expected.type === 'TOps') {
        expected = collapseOps(expected, ctx);
    }
    if (candidate.type === 'TOps') {
        candidate = collapseOps(candidate, ctx);
    }

    // console.log('at', candidate, expected);
    // if (expected.type === 'TOr') {
    //     if (candidate.type === 'TOr') {
    //         return candidate.elements.every((can) =>
    //             (expected as TOr).elements.some((t) =>
    //                 typeMatches(can, t, ctx),
    //             ),
    //         );
    //     }
    //     return expected.elements.some((t) => typeMatches(candidate, t, ctx));
    // }
    // if (candidate.type === 'TOr') {
    //     return candidate.elements.every((can) =>
    //         typeMatches(can, expected, ctx),
    //     );
    // }
    // candidate = reduceConstant(candidate);
    // if (candidate.type !== expected.type) {
    //     return false;
    // }
    // console.log(candidate, expected);

    switch (candidate.type) {
        case 'TEnum':
            // [ `What ] matches [ `What | `Who ]
            // So everything in candidate needs to match something
            // in expected. And there need to not be any collisions name-wise
            if (expected.type !== 'TEnum') {
                return false;
            }
            const canEnums = expandEnumCases(candidate, ctx);
            const expEnums = expandEnumCases(expected, ctx);
            if (!canEnums || !expEnums) {
                return false;
            }
            const canMap: { [key: string]: EnumCase } = {};
            for (let kase of canEnums) {
                // Multiple cases with the same name
                if (
                    canMap[kase.tag] &&
                    !payloadsEqual(
                        kase.payload,
                        canMap[kase.tag].payload,
                        ctx,
                        true,
                    )
                ) {
                    return false;
                }
                canMap[kase.tag] = kase;
            }
            const expMap: { [key: string]: EnumCase } = {};
            for (let kase of expEnums) {
                // Multiple cases with the same name
                if (expMap[kase.tag]) {
                    return false;
                }
                expMap[kase.tag] = kase;
            }

            for (let kase of canEnums) {
                if (!expMap[kase.tag]) {
                    if (expected.open) {
                        continue;
                    }
                    console.log(
                        'no extra',
                        kase.tag,
                        expected.open,
                        candidate.open,
                    );
                    return false;
                }
                if (
                    !payloadsEqual(
                        kase.payload,
                        expMap[kase.tag].payload,
                        ctx,
                        false,
                    )
                ) {
                    return false;
                }
            }
            if (candidate.open && !expected.open) {
                return false;
            }

            // So, ... we can always allow smaller, right?
            // [] is part of anything?
            // <T: int>(x) => T
            // you call with m<10> and its fine
            // <T: []>(x) => T
            // means, ... this should be an enum, right?
            // <T: [`One | `Two]>(x) => T,
            // means ... if we handle `One and `Two we know
            // we'll be prepared for anything.
            // Yeah, ok so the passed-in type must be a subset.
            // So is there a way to describe the "anything" enum?
            // maybe that's the `*`.
            // <T: [`One | `Two | *]>(x) => T
            // I guess that's almost as good as no bound at all, right?
            // well actually, it locks down the payloads for those two tags.
            // 🤔 lots to think about there.
            // oh and I guess the empty enum just can't be instantiated

            return true;
        // return expected.type === 'TEnum' &&
        // idsEqual(candidate.id, expected.id);
        case 'TDecorated':
            return typeMatches(candidate.inner, expected, ctx);
        case 'TVars': {
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
                console.log('bad args');
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
            const bounds: { [key: number]: Type | null } = {};
            let newTypes: TRef[] = expected.args.map((arg, i) => {
                const sym = maxSym + i + 1;
                bounds[sym] = arg.bound;
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
        }
        case 'TLambda':
            return (
                expected.type === 'TLambda' &&
                typeMatches(candidate.result, expected.result, ctx) &&
                candidate.args.length === expected.args.length &&
                candidate.args.every((arg, i) =>
                    typeMatches(
                        (expected as TLambda).args[i].typ,
                        arg.typ,
                        ctx,
                    ),
                )
            );
        case 'TOps': {
            const adds = justStringAdds(candidate, ctx);
            if (adds) {
                if (ctx.isBuiltinType(expected, 'string')) {
                    return true;
                }
                if (expected.type === 'TOps') {
                    const exadds = justStringAdds(expected, ctx);
                    return exadds ? stringAddsMatch(adds, exadds) : false;
                }
            }
            const ops = numOps(candidate, ctx);
            if (
                expected.type === 'TOps' ||
                expected.type === 'Number' ||
                expected.type === 'TRef'
            ) {
                const eops = numOps(expected, ctx);
                if (ops && eops) {
                    return eopsMatch(ops, eops);
                }
            }
            // Probably need to "condense"?
            return (
                expected.type === 'TOps' &&
                candidate.right.length === expected.right.length &&
                typeMatches(candidate.left, expected.left, ctx) &&
                candidate.right.every(
                    (arg, i) =>
                        arg.top === (expected as TOps).right[i].top &&
                        typeMatches(
                            arg.right,
                            (expected as TOps).right[i].right,
                            ctx,
                        ),
                )
            );
        }
        // A string literal type matches either that lateral type, or the full string type.
        // OR I guess a prefix or suffix 🤔
        case 'String':
            switch (expected.type) {
                case 'String':
                    return candidate.text === expected.text;
                case 'TOps': {
                    let { text } = candidate;
                    let pos = 0;
                    let exact = true;
                    const elements = justAdds(expected);
                    if (!elements) {
                        return false;
                    }
                    return stringOps(elements, text, pos, exact, ctx);
                }
                default:
                    return ctx.isBuiltinType(expected, 'string');
            }
        // Ooh if this is an alias, I need to resolve it?
        case 'TApply':
            return (
                expected.type === 'TApply' &&
                typeMatches(candidate.target, expected.target, ctx) &&
                candidate.args.length === expected.args.length &&
                candidate.args.every((arg, i) =>
                    typeMatches(arg, (expected as TApply).args[i], ctx),
                )
            );
        case 'TRef':
            // console.log('tref', candidate);
            // If this is a local ref, and it has a bound, then we can use the bound.
            if (candidate.ref.type === 'Local') {
                // TOHHH.
                // If we've finished our 'transform' path,
                // now we need a mapping of syms to ... bounds
                // instaed of using the list of scopes.
                const bound = ctx.getBound(candidate.ref.sym);
                if (bound) {
                    // console.log('got a bound', candidate, bound, expected);
                    return typeMatches(bound, expected, ctx);
                }
            }
            return (
                expected.type === 'TRef' &&
                trefsEqual(candidate.ref, expected.ref)
            );
        // case 'TApply':
        //     // So TApply should get "worked out" by this point, right?
        //     // idk seems like it should.
        //     return (
        //         expected.type === 'TApply' &&
        //         typeMatches(candidate.target, expected.target, ctx) &&
        //         candidate.args.length === expected.args.length &&
        //         candidate.args.every((arg, i) =>
        //             typeMatches(arg, (expected as TApply).args[i], ctx),
        //         )
        //     );
        // case 'TVars':
        //     // TODO: Come back to this
        //     throw new Error('Not sure about this one');
        // // return b.type === 'TVars' && typesEqual(a.inner, b.inner) && a.args.length === b.args.length && a.args.every((arg, i) => (
        // // 	arg.id === (b as TVars).args[i].id
        // // )
        // case 'TSub': {
        //     // TODO make this more flexible, maybe
        //     const { elements } = candidate;
        //     return (
        //         expected.type === 'TSub' &&
        //         expected.elements.length === elements.length &&
        //         expected.elements.every((el, i) =>
        //             typeMatches(elements[i], el, ctx),
        //         )
        //     );
        // }
        // case 'TAdd':
        //     // TODO make this more flexible
        //     // OH for example, if this can reduce down to a constant, do that.
        //     // That can be a preprocess run
        //     const { elements } = candidate;
        //     return (
        //         expected.type === 'TAdd' &&
        //         expected.elements.length === elements.length &&
        //         expected.elements.every((el, i) =>
        //             typeMatches(elements[i], el, ctx),
        //         )
        //     );
        // hmm if this is a number-kind of add ... it could get swallowed up into ... a full string
        // ... or things rather more complicated.
        case 'Number':
            const ops = numOps(candidate, ctx);
            if (
                expected.type === 'TOps' ||
                expected.type === 'Number' ||
                expected.type === 'TRef'
            ) {
                const eops = numOps(expected, ctx);
                if (ops && eops) {
                    return eopsMatch(ops, eops);
                }
            }

            return false;
        // if (expected.type === 'Number') {
        //     return (
        //         expected.kind === candidate.kind &&
        //         expected.value === candidate.value
        //     );
        // } else if (expected.type === 'TOps') {
        //     const res = numOps(expected, ctx);
        //     if (!res || res.kind !== candidate.kind) {
        //         return false;
        //     }
        //     const { mm, num } = res;

        //     console.log(candidate.value, mm, num);
        //     if (candidate.value <= num && !mm.lowerLimit) {
        //         return true;
        //     }
        //     if (candidate.value >= num && !mm.upperLimit) {
        //         return true;
        //     }
        //     return candidate.value === num;
        // } else {
        //     if (
        //         candidate.kind === 'Int' &&
        //         candidate.value >= 0 &&
        //         ctx.isBuiltinType(expected, 'uint')
        //     ) {
        //         return true;
        //     }
        //     return ctx.isBuiltinType(
        //         expected,
        //         candidate.kind.toLowerCase(),
        //     );
        // }
    }
};

// ok so recursion checking ... right
// like, if we pass through the same 'recur' thing multiple times...
export const expandEnumCases = (
    type: TEnum,
    ctx: Ctx,
    path: string[] = [],
): null | EnumCase[] => {
    const cases: EnumCase[] = [];
    for (let kase of type.cases) {
        if (kase.type === 'EnumCase') {
            cases.push(kase);
        } else {
            const r = getRef(kase);
            if (r) {
                const k = refHash(r.ref);
                if (path.includes(k)) {
                    return null;
                }
                path = path.concat([k]);
            }
            const res = ctx.resolveRefsAndApplies(kase);
            if (res?.type === 'TEnum') {
                const expanded = expandEnumCases(res, ctx, path);
                if (!expanded) {
                    return null;
                }
                cases.push(...expanded);
            } else {
                return null;
            }
        }
    }
    return cases;
};

const getRef = (t: Type): TRef | null => {
    switch (t.type) {
        case 'TRef':
            return t;
        case 'TApply':
            return getRef(t.target);
        case 'TDecorated':
            return getRef(t.inner);
    }
    return null;
};
