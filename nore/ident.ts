import { Gram, Grams } from './types';

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
        raw: '[0-9a-zA-Z]+',
    },
    UIntLiteral: {
        type: 'peggy',
        raw: '[0-9]+',
    },
    UInt: {
        type: 'derived',
        inner: 'UIntLiteral',
        typeName: 'number',
        derive: (raw) => parseInt(raw),
    },
    LocalHash: [
        '#[:',
        {
            type: 'named',
            name: 'sym',
            inner: 'UInt',
        },
        ']',
    ],
    IdHash: [
        '#[h',
        { type: 'named', name: 'hash', inner: '$HashText' },
        {
            type: 'named',
            name: 'idx',
            inner: { type: 'optional', item: ['.', 'UInt'] },
        },
        ']',
    ],
};
