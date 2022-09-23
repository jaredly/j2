// Main entry point

import { writeFileSync } from 'fs';
import { grammar, tags } from '../grams';
import { generatePeg } from './peg';
import { generateTypes } from './types';
import { generate } from 'peggy';
import { generateReact, prelude } from './react-map';

writeFileSync('./nore/generated/types.ts', generateTypes(grammar, tags));
writeFileSync(
    './nore/generated/type-map.ts',
    generateTypes(grammar, tags, {
        idRefs: true,
        simpleRules: Object.keys(grammar).filter(
            (k) => (grammar[k] as any).type === 'peggy',
        ),
    }),
);

const peg = generatePeg(grammar);
writeFileSync('./nore/generated/grammar.pegjs', peg);

const starts = ['Expression', 'Applyable', 'Number', 'Identifier', 'Suffix'];

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

const reacts = generateReact(grammar, tags);
writeFileSync(
    `./nore/generated/react-map.tsx`,
    `
${prelude}
${Object.keys(reacts)
    .map((name) => reacts[name])
    .join('\n\n')}
`,
);
