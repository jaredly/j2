import { Grams } from './types';

export const grams: Grams = {
    Number: {
        type: 'tagged',
        tags: ['Applyable', 'Type'],
        inner: [
            // Can I transform this to/from a number?
            {
                type: 'named',
                name: 'num',
                inner: {
                    type: 'derived',
                    inner: 'RawNumber',
                    typeName: 'number',
                    derive: (raw) => +raw,
                },
            },
            {
                type: 'named',
                name: 'kind',
                inner: {
                    type: 'inferrable',
                    item: { type: 'or', options: ['u', 'i', 'f'] },
                    // infer: ({ num }: { num: { raw: string } }) => {
                    //     if (num.raw.includes('.')) {
                    //         return 'f';
                    //     }
                    //     return num.raw.startsWith('-') ? 'i' : 'u';
                    // },
                },
            },
        ],
    },
    RawNumber: {
        type: 'peggy',
        raw: '"-"? [0-9]+ ("." [0-9]+)?',
        rx: /-?[0-9]+(\.[0-9]+)?/,
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
