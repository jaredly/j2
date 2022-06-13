// Generated?

import { Id, idToString } from './ids';
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

export const refHash = (ref: RefKind) =>
    ref.type === 'Global' ? 'h' + idToString(ref.id) : '' + ref.sym;

export type Ctx = {
    resolve: (name: string, hash?: string | null) => Array<RefKind>;
};
