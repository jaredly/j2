import { Grams } from './types';

export const grams: Grams = {
    Binop: [
        // So here's another left-recursivity dealio
        {
            type: 'named',
            name: 'left',
            inner: { type: 'drill', inner: 'Expression' },
        },
        // oh and also, we need to like do the tree-balancing dealio for precedence?
        // UNLESS I actually build in precedence to the grammar builder dealio.
        // I meam, might as well right?
        // that would be cool tbh
        { type: 'named', name: 'op', inner: 'BinopOp' },
        { type: 'named', name: 'right', inner: 'Expression' },
    ],
};
