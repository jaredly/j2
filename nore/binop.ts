import { Grams } from './types';

export const grams: Grams = {
    Binop: {
        type: 'tagged',
        tags: ['Expression'],
        inner: {
            type: 'binops',
            inner: 'Expression',
            precedence: [['+', '-'], ['*', '/'], ['^']],
            chars: '+-*/^',
            exclude: ['->', '=>'],
        },
    },
    // Binop: [
    //     // So here's another left-recursivity dealio
    //     {
    //         type: 'named',
    //         name: 'left',
    //         inner: { type: 'drill', inner: 'Expression' },
    //     },
    //     // oh and also, we need to like do the tree-balancing dealio for precedence?
    //     // UNLESS I actually build in precedence to the grammar builder dealio.
    //     // I meam, might as well right?
    //     // that would be cool tbh
    //     { type: 'named', name: 'op', inner: 'BinopOp' },
    //     { type: 'named', name: 'right', inner: 'Expression' },
    // ],
    // How do I indicate that, while typing out the 'text' part, we
    // can autocomplete the whole shebang?
    // Should I have a new type, that is like "autocompleteable" or something?
    BinopOp: [
        { type: 'named', name: 'text', inner: '$OpText' },
        {
            type: 'named',
            name: 'ref',
            inner: {
                type: 'inferrable',
                item: { type: 'or', options: ['IdHash', 'LocalHash'] },
            },
        },
    ],
};
