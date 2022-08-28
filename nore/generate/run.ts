// Main entry point

import { writeFileSync } from 'fs';
import { grammar } from '..';
import { generatePeg } from './peg';
import { generateTypes } from './types';
import { generate } from 'peggy';

const raw = generateTypes(grammar);
writeFileSync('./nore/generated/types.ts', raw);

const peg = generatePeg(grammar);
writeFileSync('./nore/generated/grammar.pegjs', peg);

const gram = generate(peg, {
    output: 'source',
    format: 'es',
    allowedStartRules: ['Expression'],
});
writeFileSync('./nore/generated/grammar.ts', `// @ts-nocheck\n` + gram);

console.log(
    JSON.stringify(
        generate(peg, { allowedStartRules: ['Expression'] }).parse(
            'hello(1, 2u)',
            {
                startRule: 'Expression',
            },
        ),
        null,
        2,
    ),
);
