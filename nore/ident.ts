import { Grams } from './types';

export const grams: Grams = {
    Identifier: {
        type: 'tagged',
        tags: ['Applyable', 'Type'],
        inner: [
            { type: 'named', name: 'text', inner: '$IdText' },
            {
                type: 'named',
                name: 'ref',
                inner: {
                    type: 'inferrable',
                    item: { type: 'or', options: ['IdHash', 'LocalHash'] },
                },
            },
        ],
    },
    IdText: {
        type: 'peggy',
        raw: '![0-9] [0-9a-zA-Z_]+',
    },
    HashText: {
        type: 'peggy',
        raw: '"h" [0-9a-zA-Z]+',
    },
    LocalHash: [
        '#[:',
        { type: 'named', name: 'text', inner: 'UIntLiteral' },
        ']',
    ],
    IdHash: [
        '#[',
        { type: 'named', name: 'hash', inner: '$HashText' },
        {
            type: 'named',
            name: 'idx',
            inner: { type: 'optional', item: ['.', 'UIntLiteral'] },
        },
        ']',
    ],
};
