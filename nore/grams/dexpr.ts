import { Grams } from './types';

export const grams: Grams = {
    Dexpr: {
        type: 'tagged',
        tags: ['Expression'],
        inner: [
            {
                type: 'named',
                name: 'decorators',
                inner: { type: 'star', item: 'Decorator' },
            },
            { type: 'named', name: 'inner', inner: 'Expression' },
        ],
    },
    Decorator: [
        '@',
        { type: 'named', name: 'name', inner: 'Identifier' },
        { type: 'named', name: 'args', inner: 'CallSuffix' },
    ],
};
