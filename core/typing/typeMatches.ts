import { FullContext, noloc } from '../ctx';
import { idsEqual } from '../ids';
import { transformType, Visitor } from '../transform-tast';
import {
    Ref,
    refHash,
    RefKind,
    TApply,
    TLambda,
    TOps,
    TOr,
    TRef,
    TVar,
    TVars,
    Type,
} from '../typed-ast';
import { applyType } from './getType';

export const refsEqual = (a: RefKind, b: RefKind): boolean => {
    if (a.type !== b.type) {
        return false;
    }
    if (a.type === 'Global') {
        return b.type === 'Global' && idsEqual(a.id, b.id);
    }
    return b.type === 'Local' && a.sym === b.sym;
};

export const trefsEqual = (a: TRef['ref'], b: TRef['ref']): boolean => {
    if (a.type === 'Unresolved' || b.type === 'Unresolved') {
        return false;
    }
    return refsEqual(a, b);
};

export type Ctx = {};

export const isBuiltinType = (t: Type, name: string, ctx: FullContext) =>
    t.type === 'TRef' &&
    t.ref.type === 'Global' &&
    refsEqual(t.ref, ctx.types.names[name]);

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

export const justAdds = (t: TOps): Type[] | null => {
    const results = [t.left];
    for (let { top, right } of t.right) {
        if (top === '+') {
            results.push(right);
        }
        return null;
    }
    return results;
};

export const typeMatches = (
    candidate: Type,
    expected: Type,
    ctx: FullContext,
): boolean => {
    // Ok I need like a "resolve refs" function

    while (expected.type === 'TDecorated') {
        expected = expected.inner;
    }
    while (candidate.type === 'TDecorated') {
        candidate = candidate.inner;
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
        case 'TVars': {
            if (
                expected.type !== 'TVars' ||
                expected.args.length !== candidate.args.length ||
                !expected.args.every(
                    // True if the bounds align
                    (arg, i) => {
                        const carg = (candidate as TVars).args[i];
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
        case 'TOps':
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
                    for (let ex of elements) {
                        if (ex.type === 'String') {
                            const idx = text.indexOf(ex.text, pos);
                            if (idx === -1 || (exact && idx !== 0)) {
                                return false;
                            }
                            pos = idx + ex.text.length;
                        } else if (isBuiltinType(ex, 'string', ctx)) {
                            exact = false;
                        } else {
                            return false;
                        }
                    }
                    if (exact && pos !== text.length - 1) {
                        return false; // extra trailing
                    }
                    return true;
                }
                default:
                    return isBuiltinType(expected, 'string', ctx);
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
            if (expected.type === 'Number') {
                return (
                    expected.kind === candidate.kind &&
                    expected.value === candidate.value
                );
                // } else if (expected.type === 'TSub') {
                //     if (candidate.kind !== 'UInt') {
                //         return false;
                //     }
                //     let num = 0;
                //     let ismax = false;
                //     for (let i = 0; i < expected.elements.length; i++) {
                //         const el = expected.elements[i];
                //         if (el.type === 'Number') {
                //             if (el.kind !== candidate.kind) {
                //                 return false;
                //             }
                //             if (i === 0) {
                //                 num += el.value;
                //             } else {
                //                 num -= el.value;
                //             }
                //         } else if (
                //             isBuiltinType(el, candidate.kind.toLowerCase(), ctx)
                //         ) {
                //             // it's fine
                //             ismax = true;
                //         } else {
                //             return false;
                //         }
                //     }
                //     return ismax ? candidate.value <= num : candidate.value === num;
                // } else if (expected.type === 'TAdd') {
                //     if (candidate.kind !== 'UInt') {
                //         return false;
                //     }
                //     let min = 0;
                //     for (let el of expected.elements) {
                //         if (el.type === 'Number') {
                //             if (el.kind !== candidate.kind) {
                //                 return false;
                //             }
                //             min += el.value;
                //         } else if (
                //             isBuiltinType(el, candidate.kind.toLowerCase(), ctx)
                //         ) {
                //             // it's fine
                //         } else {
                //             return false;
                //         }
                //     }
                //     return candidate.value >= min;
            } else {
                // return false;
                // console.log(
                //     'umber',
                //     expected,
                //     ctx.types.names['int'],
                //     isBuiltinType(expected, 'int', ctx),
                // );
                if (
                    candidate.kind === 'Int' &&
                    candidate.value >= 0 &&
                    isBuiltinType(expected, 'uint', ctx)
                ) {
                    return true;
                }
                return isBuiltinType(
                    expected,
                    candidate.kind.toLowerCase(),
                    ctx,
                );
            }
    }
};
