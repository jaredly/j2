import { Grams } from './types';

export const grams: Grams = {
    Identifier: [
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
