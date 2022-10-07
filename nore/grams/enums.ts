import { Grams } from './types';

export const grams: Grams = {
    TEnum: {
        type: 'tagged',
        tags: ['Type'],
        inner: {
            type: 'args',
            sep: '|',
            bounds: ['[', ']'],
            item: { type: 'or', options: ['TagDecl', 'Type'] },
            // this will translate into a `last` that's a boolean, depending on if it's there
            last: '*',
        },
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
    Enum: {
        type: 'tagged',
        tags: ['Expression'],
        inner: [
            '`',
            // Sooooo ... this Identifier might want to be autocompletable too
            // if we have reason to believe that a certain Id is going to be paired with
            // a certain arg type. ....
            // So I think I want an AST node tyep that is "placeholder", with an optional
            // expected type?
            // Then we can also autofill fitting values that have the proper type.
            { type: 'named', name: 'name', inner: 'Identifier' },
            { type: 'optional', item: 'CallSuffix' },
            // Maybe I just have the ability to specify an autocomplete
            // handler ... for any expression?
            // tbh that could be great
        ],
    },
};
