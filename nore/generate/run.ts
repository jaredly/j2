// Main entry point

import { writeFileSync } from 'fs';
import { grammar, tags as tagDeps } from '../grams';
import { generatePeg } from './peg';
import { generateTypes } from './types';
import { generate } from 'peggy';
import { generateReact, prelude } from './react-map';
import { Grams } from '../grams/types';
import { generateToMap } from './to-map';

export const findTags = (
    grammar: Grams,
    tagDeps: { [name: string]: string[] },
): { [name: string]: string[] } => {
    const tags: { [name: string]: string[] } = {};
    for (const [name, gram] of Object.entries(grammar)) {
        if (!Array.isArray(gram) && gram.type === 'tagged') {
            gram.tags.forEach((tag) => {
                if (!tags[tag]) {
                    tags[tag] = [];
                }
                tags[tag].push(name);
            });
        }
    }

    Object.keys(tagDeps).forEach((tag) => {
        tags[tag].push(...tagDeps[tag]);
    });
    // tags = { ...tags };

    return tags;
};

const tags = findTags(grammar, tagDeps);

// const starts = tags['Atom'].concat(Object.keys(tags));
const starts = Object.keys(grammar).concat(Object.keys(tags));

// @ts-ignore
tags['Node'] = Object.keys(grammar).filter((k) => grammar[k].type !== 'peggy');

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
            `export const parse${x} = (x: string): t.${x} => parse(x, {startRule: '${x}'}) as t.${x};`,
    )
    .join('\n\n')}
`,
);

writeFileSync(`./nore/generated/react-map.tsx`, generateReact(grammar, tags));
writeFileSync(`./nore/generated/to-map.tsx`, generateToMap(grammar, tags));
