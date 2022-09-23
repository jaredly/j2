import { idx } from './grammar';
import {
    parseBoolean,
    parseIdentifier,
    parseNumber,
    parsePIdentifier,
} from './parser';
import * as t from './type-map';
import * as to from './to-map';

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string, map: t.Map) => T;
};

export const Number: AtomConfig<t.Number> = {
    toString: (n) => n.num.raw + (n.kind ? n.kind.value : ''),
    fromString: parseNumber,
};
export const Boolean: AtomConfig<t.Boolean> = {
    toString: (b) => b.value,
    fromString: parseBoolean,
};
export const Identifier: AtomConfig<t.Identifier> = {
    toString: (i) => i.text,
    fromString: (text, map) => to.Identifier(parseIdentifier(text), map),
};
export const PIdentifier: AtomConfig<t.PIdentifier> = {
    toString: (i) => i.text,
    fromString: (text, map) => to.PIdentifier(parsePIdentifier(text), map),
};
export const Blank: AtomConfig<t.Blank> = {
    toString: () => '',
    fromString: () => ({
        type: 'Blank',
        loc: { start: 0, end: 0, idx: idx.current++ },
    }),
};
