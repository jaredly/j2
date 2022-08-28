import { Grams } from './types';

export const grams: Grams = {
    Number: {
        type: 'tagged',
        tags: ['Applyable', 'Type'],
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
    RawNumber: {
        type: 'peggy',
        raw: '[0-9]+',
    },
    Boolean: {
        type: 'tagged',
        tags: ['Applyable', 'Type'],
        inner: [
            {
                type: 'named',
                name: 'value',
                inner: { type: 'or', options: ['true', 'false'] },
            },
        ],
    },
};
