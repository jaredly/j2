import { idsEqual } from '../ids';
import { Ref, RefKind, TApply, TLambda, TRef, TVars, Type } from '../typed-ast';

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

export const typesEqual = (a: Type, b: Type): boolean => {
    if (a.type !== b.type) {
        return false;
    }
    while (b.type === 'TDecorated') {
        b = b.inner;
    }
    while (a.type === 'TDecorated') {
        a = a.inner;
    }
    switch (a.type) {
        case 'TLambda':
            return (
                b.type === 'TLambda' &&
                typesEqual(a.result, b.result) &&
                a.args.length === b.args.length &&
                a.args.every((arg, i) =>
                    typesEqual(arg.typ, (b as TLambda).args[i].typ),
                )
            );
        case 'TRef':
            return b.type === 'TRef' && trefsEqual(a.ref, b.ref);
        case 'TApply':
            // So TApply should get "worked out" by this point, right?
            // idk seems like it should.
            return (
                b.type === 'TApply' &&
                typesEqual(a.target, b.target) &&
                a.args.length === b.args.length &&
                a.args.every((arg, i) => typesEqual(arg, (b as TApply).args[i]))
            );
        case 'TVars':
            // TODO: Come back to this
            throw new Error('Not sure about this one');
        // return b.type === 'TVars' && typesEqual(a.inner, b.inner) && a.args.length === b.args.length && a.args.every((arg, i) => (
        // 	arg.id === (b as TVars).args[i].id
        // )
    }
};
