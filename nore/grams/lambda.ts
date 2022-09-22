import { Grams } from './types';

export const grams: Grams = {
    /*
	type Lambda = {
		type: 'Lambda',
		args: Array<LArg>
		res: {inferred: boolean, inner: Type}
		body: Expression,
		loc,
	}
	type LArg = {
		type: 'LArg',
		pat: Pattern,
		typ: {inferred: boolean, inner: Type}
		loc,
	}
	*/
    Lambda: [
        'fn',
        {
            type: 'named',
            name: 'args',
            inner: {
                type: 'args',
                item: 'Larg',
            },
        },
        {
            type: 'named',
            name: 'res',
            inner: {
                type: 'inferrable',
                item: [':', 'Type'],
            },
        },
        '=>',
        { type: 'named', name: 'body', inner: 'Expression' },
    ],
    Larg: [
        { type: 'named', name: 'pat', inner: 'Pattern' },
        {
            type: 'named',
            name: 'typ',
            inner: { type: 'inferrable', item: [':', 'Type'] },
        },
    ],
};

// let _: { [key: string]: Gram } = grams;
