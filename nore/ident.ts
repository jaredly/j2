import { Gram, Grams } from './types';

const UIntLiteral: Gram<string> = {
    type: 'derived',
    inner: 'UIntLiteral',
    typeName: 'number',
    derive(raw) {
        return parseInt(raw);
    },
};

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
    UIntLiteral: {
        type: 'peggy',
        raw: '[0-9]+',
    },
    LocalHash: [
        '#[:',
        {
            type: 'named',
            name: 'sym',
            inner: UIntLiteral,
        },
        ']',
    ],
    IdHash: [
        '#[',
        { type: 'named', name: 'hash', inner: '$HashText' },
        {
            type: 'named',
            name: 'idx',
            inner: { type: 'optional', item: ['.', UIntLiteral] },
        },
        ']',
    ],
};
