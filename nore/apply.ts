import { Grams } from './types';

export const grams: Grams = {
    CallSuffix: {
        type: 'tagged',
        tags: ['Suffix'],
        inner: [
            {
                type: 'named',
                name: 'args',
                inner: {
                    type: 'args',
                    item: 'Expression',
                },
            },
        ],
    },
    Apply: {
        type: 'tagged',
        tags: ['Expression'],
        inner: {
            type: 'suffixes',
            // Can we infer this as 'Atom' vs 'Expression'?
            target: 'Applyable',
            suffix: 'Suffix',
        },
    },
    /*
    ArrowSuffix: {
        type: 'tagged',
        tags: ['Suffix'],
        inner: [
            '->',
            { type: 'named', name: 'name', inner: 'Identifier' },
            {
                type: 'named',
                name: 'types',
                inner: {
                    type: 'optional',
                    item: {
                        type: 'inferrable',
                        item: 'TypeApplicationSuffix',
                    },
                },
            },
            {
                type: 'named',
                name: 'args',
                inner: {
                    type: 'optional',
                    item: 'CallSuffix',
                },
            },
        ],
    },
    */
};
