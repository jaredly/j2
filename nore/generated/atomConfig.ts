import * as t from './type-map';

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
};

export const Number: AtomConfig<t.Number> = {};
export const Boolean: AtomConfig<t.Boolean> = {};
export const Identifier: AtomConfig<t.Identifier> = {};
export const PIdentifier: AtomConfig<t.PIdentifier> = {};
export const Blank: AtomConfig<t.Blank> = {};
