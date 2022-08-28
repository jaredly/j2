import { Grams } from './types';

export const grams: Grams = {
    Number: {
        type: 'tagged',
        tags: ['Expression', 'Type'],
        inner: [
            // Can I transform this to/from a number?
            { type: 'named', name: 'raw', inner: '$RawNumber' },
            {
                type: 'named',
                name: 'kind',
                inner: {
                    type: 'inferrable',
                    item: { type: 'or', options: ['u', 'i', 'f'] },
                },
            },
        ],
    },
    Boolean: {
        type: 'tagged',
        tags: ['Expression', 'Type'],
        inner: { type: 'or', options: ['true', 'false'] },
    },
};
