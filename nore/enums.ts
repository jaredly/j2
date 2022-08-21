import { Grams } from './types';

export const grams: Grams = {
    TEnum: {
        type: 'args',
        sep: '|',
        bounds: ['[', ']'],
        item: { type: 'or', options: ['TagDecl', 'Type'] },
        // this will translate into a `last` that's a boolean, depending on if it's there
        last: '*',
    },
    TagDecl: [
        {
            type: 'named',
            name: 'decorators',
            inner: { type: 'star', item: 'Decorator' },
        },
        '`',
        { type: 'named', name: 'text', inner: '$IdText' },
        {
            type: 'named',
            name: 'payload',
            inner: {
                type: 'args',
                sep: ',',
                bounds: ['(', ')'],
                item: 'Type',
            },
        },
    ],
};
