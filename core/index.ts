// Generated?

import { Id, idToString } from './ids';
export { Ctx } from './typing/to-tast';

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
