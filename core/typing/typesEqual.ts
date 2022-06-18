import { FullContext } from '../ctx';
import { idsEqual } from '../ids';
import {
    Ref,
    RefKind,
    TApply,
    TLambda,
    TOr,
    TRef,
    TVars,
    Type,
} from '../typed-ast';

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

export const reduceConstant = (t: Type): Type => {
    if (t.type === 'TAdd') {
        if (t.elements[0].type === 'String') {
            let v = '';
            for (let el of t.elements) {
                if (el.type !== 'String') {
                    return t;
                }
                v += el.text;
            }
            return { ...t, type: 'String', text: v };
        }
        if (t.elements[0].type === 'Number') {
            let v = 0;
            let k = t.elements[0].kind;
            for (let el of t.elements) {
                if (el.type !== 'Number' || el.kind !== k) {
                    return t;
                }
                v += el.value;
            }
            return { ...t, type: 'Number', kind: k, value: v };
        }
    }
    if (t.type === 'TSub') {
        if (t.elements[0].type === 'Number') {
            let v = t.elements[0].value;
            let k = t.elements[0].kind;
            for (let i = 1; i < t.elements.length; i++) {
                const el = t.elements[i];
                if (el.type !== 'Number' || el.kind !== k) {
                    return t;
                }
                v -= el.value;
            }
            return { ...t, type: 'Number', kind: k, value: v };
        }
    }
    return t;
};

export const typeMatches = (
    candidate: Type,
    expected: Type,
    ctx: FullContext,
): boolean => {
    while (expected.type === 'TDecorated') {
        expected = expected.inner;
    }
    while (candidate.type === 'TDecorated') {
        candidate = candidate.inner;
    }
    if (expected.type === 'TOr') {
        if (candidate.type === 'TOr') {
            return candidate.elements.every((can) =>
                (expected as TOr).elements.some((t) =>
                    typeMatches(can, t, ctx),
                ),
            );
        }
        return expected.elements.some((t) => typeMatches(candidate, t, ctx));
    }
    if (candidate.type === 'TOr') {
        return candidate.elements.every((can) =>
            typeMatches(can, expected, ctx),
        );
    }
    candidate = reduceConstant(candidate);
    if (candidate.type !== expected.type) {
        return false;
    }
    switch (candidate.type) {
        case 'TLambda':
            return (
                expected.type === 'TLambda' &&
                typeMatches(candidate.result, expected.result, ctx) &&
                candidate.args.length === expected.args.length &&
                candidate.args.every((arg, i) =>
                    typeMatches(
                        arg.typ,
                        (expected as TLambda).args[i].typ,
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
                case 'TAdd': {
                    let { text } = candidate;
                    let pos = 0;
                    let exact = true;
                    // TODO: I'll need to flatten nested ADDs if I ever want that.
                    for (let ex of expected.elements) {
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
                    return false;
            }
        // Ooh if this is an alias, I need to resolve it?
        case 'TRef':
            return (
                expected.type === 'TRef' &&
                trefsEqual(candidate.ref, expected.ref)
            );
        case 'TApply':
            // So TApply should get "worked out" by this point, right?
            // idk seems like it should.
            return (
                expected.type === 'TApply' &&
                typeMatches(candidate.target, expected.target, ctx) &&
                candidate.args.length === expected.args.length &&
                candidate.args.every((arg, i) =>
                    typeMatches(arg, (expected as TApply).args[i], ctx),
                )
            );
        case 'TVars':
            // TODO: Come back to this
            throw new Error('Not sure about this one');
        // return b.type === 'TVars' && typesEqual(a.inner, b.inner) && a.args.length === b.args.length && a.args.every((arg, i) => (
        // 	arg.id === (b as TVars).args[i].id
        // )
        case 'TSub': {
            // TODO make this more flexible, maybe
            const { elements } = candidate;
            return (
                expected.type === 'TSub' &&
                expected.elements.length === elements.length &&
                expected.elements.every((el, i) =>
                    typeMatches(elements[i], el, ctx),
                )
            );
        }
        case 'TAdd':
            // TODO make this more flexible
            // OH for example, if this can reduce down to a constant, do that.
            // That can be a preprocess run
            const { elements } = candidate;
            return (
                expected.type === 'TAdd' &&
                expected.elements.length === elements.length &&
                expected.elements.every((el, i) =>
                    typeMatches(elements[i], el, ctx),
                )
            );
        // hmm if this is a number-kind of add ... it could get swallowed up into ... a full string
        // ... or things rather more complicated.
        case 'Number':
            if (expected.type === 'Number') {
                return (
                    expected.kind === candidate.kind &&
                    expected.value === candidate.value
                );
            } else if (expected.type === 'TSub') {
                if (candidate.kind !== 'UInt') {
                    return false;
                }
                let num = 0;
                let ismax = false;
                for (let i = 0; i < expected.elements.length; i++) {
                    const el = expected.elements[i];
                    if (el.type === 'Number') {
                        if (el.kind !== candidate.kind) {
                            return false;
                        }
                        if (i === 0) {
                            num += el.value;
                        } else {
                            num -= el.value;
                        }
                    } else if (
                        isBuiltinType(el, candidate.kind.toLowerCase(), ctx)
                    ) {
                        // it's fine
                        ismax = true;
                    } else {
                        return false;
                    }
                }
                return ismax ? candidate.value <= num : candidate.value === num;
            } else if (expected.type === 'TAdd') {
                if (candidate.kind !== 'UInt') {
                    return false;
                }
                let min = 0;
                for (let el of expected.elements) {
                    if (el.type === 'Number') {
                        if (el.kind !== candidate.kind) {
                            return false;
                        }
                        min += el.value;
                    } else if (
                        isBuiltinType(el, candidate.kind.toLowerCase(), ctx)
                    ) {
                        // it's fine
                    } else {
                        return false;
                    }
                }
                return candidate.value >= min;
            } else {
                return false;
            }
    }
};
