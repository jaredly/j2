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
                    item: ['no', { type: 'or', options: ['If', 'Block'] }],
                },
            },
        ],
    },
};
