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
    // How do I indicate that, while typing out the 'text' part, we
    // can autocomplete the whole shebang?
    // Should I have a new type, that is like "autocompleteable" or something?
    // Nope, I think I'll just have a function that allows you to autocomplete
    // on any (partial) node.
    // BinopOp: [
    //     { type: 'named', name: 'text', inner: '$OpText' },
    //     {
    //         type: 'named',
    //         name: 'ref',
    //         inner: {
    //             type: 'inferrable',
    //             item: { type: 'or', options: ['IdHash', 'LocalHash'] },
    //         },
    //     },
    // ],
};
