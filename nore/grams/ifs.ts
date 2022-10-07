import { Grams } from './types';

export const grams: Grams = {
    If: {
        type: 'tagged',
        tags: ['Expression'],
        inner: [
            'if',
            { type: 'named', name: 'yes', inner: 'IfYes' },
            {
                type: 'named',
                name: 'no',
                inner: {
                    type: 'optional',
                    item: ['else', { type: 'or', options: ['If', 'Block'] }],
                },
            },
        ],
    },
    IfYes: [
        { type: 'named', name: 'cond', inner: 'Expression' },
        { type: 'named', name: 'yes', inner: 'Block' },
    ],
};
