import { Loc } from './grammar/base.parser';
import { RefKind, Type } from './typed-ast';

export const noloc: Loc = {
    start: { line: 0, column: 0, offset: -1 },
    end: { line: 0, column: 0, offset: -1 },
    idx: -1,
};
export const tref = (ref: RefKind): Type => ({
    type: 'TRef',
    ref,
    loc: noloc,
    // args: [],
});
