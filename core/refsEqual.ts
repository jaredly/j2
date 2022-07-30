import { idsEqual } from './ids';
import { RefKind, UnresolvedRef } from './typed-ast';

export const refsEqual = (
    a: RefKind | UnresolvedRef,
    b: RefKind | UnresolvedRef,
): boolean => {
    if (a.type !== b.type) {
        return false;
    }
    if (a.type === 'Unresolved' || b.type === 'Unresolved') {
        return false;
    }
    if (a.type === 'Global') {
        return b.type === 'Global' && idsEqual(a.id, b.id);
    }
    if (a.type === 'Recur') {
        return b.type === 'Recur' && a.idx === b.idx;
    }
    return b.type === 'Local' && a.sym === b.sym;
};
