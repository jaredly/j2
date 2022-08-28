// Main entry point

import { writeFileSync } from 'fs';
import { grammar, tags } from '..';
import { generatePeg } from './peg';
import { generateTypes } from './types';
import { generate } from 'peggy';

const raw = generateTypes(grammar, tags);
writeFileSync('./nore/generated/types.ts', raw);

const peg = generatePeg(grammar);
writeFileSync('./nore/generated/grammar.pegjs', peg);

const starts = ['Expression', 'Applyable', 'Number', 'Identifier'];

const gram = generate(peg, {
    output: 'source',
    format: 'es',
    allowedStartRules: starts,
});
writeFileSync('./nore/generated/grammar.ts', `// @ts-nocheck\n` + gram);

writeFileSync(
    `./nore/generated/parser.ts`,
    `
import {parse} from './grammar';
import * as t from './types';
${starts
    .map(
        (x) =>
            `export const parse${x} = (x: string): t.${x} => parse(x, {startRule: '${x}'})`,
    )
    .join('\n\n')}
`,
);

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
