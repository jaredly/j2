// Generated?

import { Id } from './ids';
import { Expression, Type } from './typed-ast';

// export type Type = '';
// export type FromAst = 'a';
// export type Loc = { line: number; column: number };
// export type Location = { start: Loc; end: Loc };

export type RefKind =
    | {
          type: 'Global';
          id: Id;
      }
    | {
          type: 'Local';
          sym: number;
      };

export type Ctx = {
    resolve: (name: string, hash?: string | null) => Array<RefKind>;
    // typeOf: (expr: Expression) => Type;
};
