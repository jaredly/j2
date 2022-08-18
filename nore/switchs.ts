import { TopGram } from './types';

export const grams: { [key: string]: TopGram } = {
    Switch: {
        type: 'tagged',
        tags: ['Expression'],
        inner: [
            'switch',
            { type: 'named', name: 'target', inner: 'Expression' },
            {
                type: 'named',
                name: 'cases',
                inner: {
                    type: 'args',
                    sep: ';',
                    item: 'Case',
                },
            },
        ],
    },
    Case: [
        { type: 'named', name: 'pat', inner: 'Pattern' },
        '=>',
        { type: 'named', name: 'body', inner: 'Expression' },
    ],
};
