// Generated?

import { Expression, Type } from './typed-ast';

// export type Type = '';
// export type FromAst = 'a';
// export type Loc = { line: number; column: number };
// export type Location = { start: Loc; end: Loc };

declare const opaque: unique symbol;

// hash/size/pos ... why do we need size?
// idk.
// seems like idx would be all you need.
// oof but I want this to be opaque.
// ok I mean not just 'cant create it' but also 'cant access it'
export type Id = { [opaque]: { hash: string; idx: number } };

export type Ref =
    | {
          type: 'Global';
          id: Id;
      }
    | {
          type: 'Local';
          sym: number;
      };

export type Ctx = {
    resolve: (name: string, hash?: string | null) => Array<Ref>;
    typeOf: (expr: Expression) => Type;
};
