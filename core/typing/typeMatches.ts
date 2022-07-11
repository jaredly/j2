import { noloc, refsEqual } from '../ctx';
import { Id, idsEqual } from '../ids';
import { transformType, Visitor } from '../transform-tast';
import {
    EnumCase,
    GlobalRef,
    Number,
    RefKind,
    String,
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

export const trefsEqual = (a: TRef['ref'], b: TRef['ref']): boolean => {
    if (a.type === 'Unresolved' || b.type === 'Unresolved') {
        return false;
    }
    return refsEqual(a, b);
};

// TypeCtx? idk
export type Ctx = {
    isBuiltinType(t: Type, name: string): boolean;
    getBuiltinRef(name: string): GlobalRef | null;
    resolveRefsAndApplies(t: Type): Type | null;
    getValueType(id: Id): Type | null;
    getBound(sym: number): Type | null;
};

// export const isBuiltinType = (t: Type, name: string, ctx: FullContext) =>
//     t.type === 'TRef' &&
//     t.ref.type === 'Global' &&
//     refsEqual(t.ref, ctx.types.names[name]);

// export const reduceConstant = (t: Type): Type => {
//     if (t.type === 'TAdd') {
//         if (t.elements[0].type === 'String') {
//             let v = '';
//             for (let el of t.elements) {
//                 if (el.type !== 'String') {
//                     return t;
//                 }
//                 v += el.text;
//             }
//             return { ...t, type: 'String', text: v };
//         }
//         if (t.elements[0].type === 'Number') {
//             let v = 0;
//             let k = t.elements[0].kind;
//             for (let el of t.elements) {
//                 if (el.type !== 'Number' || el.kind !== k) {
//                     return t;
//                 }
//                 v += el.value;
//             }
//             return { ...t, type: 'Number', kind: k, value: v };
//         }
//     }
//     if (t.type === 'TSub') {
//         if (t.elements[0].type === 'Number') {
//             let v = t.elements[0].value;
//             let k = t.elements[0].kind;
//             for (let i = 1; i < t.elements.length; i++) {
//                 const el = t.elements[i];
//                 if (el.type !== 'Number' || el.kind !== k) {
//                     return t;
//                 }
//                 v -= el.value;
//             }
//             return { ...t, type: 'Number', kind: k, value: v };
//         }
//     }
//     return t;
// };

// export const resolveRefs = (
//     t: Type,
//     ctx: FullContext,
// ): Type => {
//     while (t.type === 'TRef' && t.ref.type === 'Global') {
//         const resolved = ctx.typeForId(t.ref.id)
//         if (resolved)
//     }
//     return t
// }

// hmm
// adding:
/*

hello(x: <T: int>{contents: (v: T) => int})
yeah ok so same deal as fn args. they go backwards

*/

export const stringAddsMatch = (
    candidate: (string | true)[],
    expected: (string | true)[],
): boolean => {
    // TODO: Be clever about this
    // so that 'he' + string matches 'h' + string
    return (
        candidate.length === expected.length &&
        candidate.every((c, i) => c === expected[i])
    );
};

export const justStringAdds = (t: TOps, ctx: Ctx): (string | true)[] | null => {
    const adds = justAdds(t);
    if (!adds) {
        return null;
    }
    const results: (string | true)[] = [];
    for (let item of adds) {
        if (item.type === 'String') {
            results.push(item.text);
        } else if (ctx.isBuiltinType(item, 'string')) {
            results.push(true);
        } else {
            return null;
        }
    }
    return results;
};

export const justAdds = (t: TOps): Type[] | null => {
    const results = [t.left];
    for (let { top, right } of t.right) {
        if (top === '+') {
            results.push(right);
        } else {
            return null;
        }
    }
    return results;
};

type EOps = {
    num: number;
    mm: { upperLimit: boolean; lowerLimit: boolean };
    kind: Number['kind'];
};

export const numOps = (
    expected: TOps | Number | TRef,
    // kind: Number['kind'],
    ctx: Ctx,
): EOps | false => {
    if (expected.type === 'Number') {
        return {
            num: expected.value,
            mm: { upperLimit: true, lowerLimit: true },
            kind: expected.kind,
        };
    }
    let int = ctx.getBuiltinRef('int')!.id;
    let uint = ctx.getBuiltinRef('uint')!.id;
    let float = ctx.getBuiltinRef('float')!.id;
    if (expected.type === 'TRef') {
        if (expected.ref.type === 'Global') {
            let kind: Number['kind'];
            if (idsEqual(expected.ref.id, int)) {
                kind = 'Int';
            } else if (idsEqual(expected.ref.id, uint)) {
                kind = 'UInt';
            } else if (idsEqual(expected.ref.id, float)) {
                kind = 'Float';
            } else {
                return false;
            }

            return {
                num: 0,
                mm: { upperLimit: false, lowerLimit: false },
                kind,
            };
        }
        return false;
    }
    let num = 0;
    const mm = { upperLimit: true, lowerLimit: true };
    // let ismax = false;
    const elements = [{ op: '+', right: expected.left }].concat(
        expected.right.map(({ top, right }) => ({
            op: top,
            right,
        })),
    );
    let kind: Number['kind'] | null = null;

    for (let i = 0; i < elements.length; i++) {
        const { op, right: el } = elements[i];
        if (el.type === 'Number') {
            if (kind != null && el.kind !== kind) {
                return false;
            }
            kind = el.kind;
            if (op === '+') {
                num += el.value;
            } else {
                num -= el.value;
            }
            continue;
        }
        if (el.type === 'TRef' && el.ref.type === 'Global') {
            if (idsEqual(el.ref.id, int)) {
                kind = 'Int';
            } else if (idsEqual(el.ref.id, uint)) {
                kind = 'UInt';
            } else if (idsEqual(el.ref.id, float)) {
                kind = 'Float';
            } else {
                return false;
            }
            mm[op === '+' ? 'upperLimit' : 'lowerLimit'] = false;
            continue;
        }
        return false;
    }
    return { num, mm, kind: kind! };
};

export const eopsMatch = (candidate: EOps, expected: EOps): boolean => {
    if (candidate.kind !== expected.kind) {
        return false;
    }
    if (expected.mm.upperLimit && candidate.num > expected.num) {
        return false;
    }
    if (expected.mm.lowerLimit && candidate.num < expected.num) {
        return false;
    }
    // if (candidate.mm.upperLimit && )
    if (!candidate.mm.upperLimit && expected.mm.upperLimit) {
        return false;
    }
    if (!candidate.mm.lowerLimit && expected.mm.lowerLimit) {
        return false;
    }
    // +num
    return true;
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
                if (canMap[kase.tag]) {
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
                    (kase.payload != null) !=
                    (expMap[kase.tag].payload != null)
                ) {
                    console.log('payload diff');
                    return false;
                }
                if (
                    kase.payload &&
                    !typeMatches(kase.payload, expMap[kase.tag].payload!, ctx)
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
            let newTypes: TRef[] = expected.args.map((_, i) => ({
                type: 'TRef',
                loc: noloc,
                ref: { type: 'Local', sym: maxSym + i + 1 },
            }));
            const capp = applyType(newTypes, candidate, ctx);
            const eapp = applyType(newTypes, expected, ctx);
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

const opKind = (
    t: Type,
    ctx: Ctx,
): 'String' | 'Int' | 'Float' | 'UInt' | null => {
    switch (t.type) {
        case 'Number':
            return t.kind;
        case 'String':
            return 'String';
        case 'TRef':
            if (ctx.isBuiltinType(t, 'string')) {
                return 'String';
            }
            if (ctx.isBuiltinType(t, 'int')) {
                return 'Int';
            }
            if (ctx.isBuiltinType(t, 'float')) {
                return 'Float';
            }
            if (ctx.isBuiltinType(t, 'uint')) {
                return 'UInt';
            }
    }
    return null;
};

type vkind = 'String' | 'Int' | 'Float' | 'UInt';
export const collapseOps = (t: TOps, ctx: Ctx): Type => {
    let kinds: vkind[] = [];
    let elements = [{ plus: true, val: t.left }].concat(
        t.right.map(({ top, right }) => ({
            plus: top === '+',
            val: right,
        })),
    );
    for (let el of elements) {
        let k = opKind(el.val, ctx);
        if (!k) {
            return t;
        }
        if (!kinds.includes(k)) {
            kinds.push(k);
        }
    }

    if (!kinds.length) {
        return t;
    }

    if (kinds.includes('String')) {
        if (kinds.length !== 1) {
            return t;
        }
        // Can't do string subtraction
        if (elements.some((op) => !op.plus)) {
            return t;
        }
        let condensed: typeof elements = [];
        while (elements.length) {
            const next = elements.shift()!;
            let lid = condensed.length - 1;
            if (next.val.type !== 'String') {
                if (!condensed.length || condensed[lid].val.type === 'String') {
                    condensed.push(next);
                }
                // Otherwise, the last one is already a full 'string' ref
                continue;
            }
            if (!condensed.length || condensed[lid].val.type !== 'String') {
                condensed.push(next);
            } else {
                const last = condensed[lid].val as String;
                condensed[lid].val = {
                    ...last,
                    text: last.text + next.val.text,
                };
            }
        }
        if (!condensed[0].plus) {
            console.warn('WAHT first is not plus');
            return t;
        }
        if (condensed.length === 1) {
            return condensed[0].val;
        }
        return {
            ...t,
            left: condensed[0].val,
            right: condensed
                .slice(1)
                .map((el) => ({ top: el.plus ? '+' : '-', right: el.val })),
        };
    }

    if (kinds.length !== 1) {
        // console.log('multiples, not dealing with right now');
        return t;
    }

    let condensed: typeof elements = [];
    while (elements.length) {
        const next = elements.shift()!;
        let lid = condensed.length - 1;
        if (next.val.type === 'TRef') {
            condensed.push(next);
        } else if (!condensed.length || condensed[lid].val.type === 'TRef') {
            condensed.push(next);
        } else {
            const last = condensed[lid].val as Number;
            const num = next.val as Number;
            if (last.kind !== num.kind) {
                condensed.push(next);
            } else {
                condensed[lid].val = {
                    ...last,
                    value: last.value + num.value * (next.plus ? 1 : -1),
                };
            }
        }
    }
    if (!condensed[0].plus) {
        console.warn('WAHT first is not plus');
        return t;
    }
    if (condensed.length === 1) {
        return condensed[0].val;
    }
    return {
        ...t,
        left: condensed[0].val,
        right: condensed
            .slice(1)
            .map((el) => ({ top: el.plus ? '+' : '-', right: el.val })),
    };
};

export const expandEnumCases = (type: TEnum, ctx: Ctx): null | EnumCase[] => {
    const cases: EnumCase[] = [];
    for (let kase of type.cases) {
        if (kase.type === 'EnumCase') {
            cases.push(kase);
        } else {
            const res = ctx.resolveRefsAndApplies(kase);
            if (res?.type === 'TEnum') {
                const expanded = expandEnumCases(res, ctx);
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

export const stringOps = (
    elements: Type[],
    text: string,
    pos: number,
    exact: boolean,
    ctx: Ctx,
) => {
    for (let ex of elements) {
        if (ex.type === 'String') {
            const idx = text.indexOf(ex.text, pos);
            if (idx === -1 || (exact && idx !== 0)) {
                return false;
            }
            pos = idx + ex.text.length;
        } else if (ctx.isBuiltinType(ex, 'string')) {
            exact = false;
        } else {
            return false;
        }
    }
    if (exact && pos !== text.length - 1) {
        return false; // extra trailing
    }
    return true;
};
