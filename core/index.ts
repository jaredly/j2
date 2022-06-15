// Generated?

import { Id, idToString } from './ids';

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
    resolveType: (name: string, hash?: string | null) => RefKind | null;
};
