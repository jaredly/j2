// ids

// declare const opaque: unique symbol;
const opaque = Symbol('opaque');

// hash/size/pos ... why do we need size?
// idk.
// seems like idx would be all you need.
// oof but I want this to be opaque.
// ok I mean not just 'cant create it' but also 'cant access it'
export type Id = { [opaque]: { hash: string; idx: number }; debug: string };

export const toId = (hash: string, idx: number): Id => ({
    [opaque]: { hash, idx },
    debug: idx != 0 ? `${hash}.${idx}` : hash,
});
export const idsEqual = (a: Id, b: Id): boolean =>
    a[opaque].hash === b[opaque].hash && a[opaque].idx === b[opaque].idx;

export const idToString = (id: Id): string =>
    id[opaque].hash + (id[opaque].idx != 0 ? '.' + id[opaque].idx : '');

export const extract = (id: Id) => id[opaque];
