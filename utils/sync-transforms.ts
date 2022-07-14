// For syncing the ToTast, ToAst, ToPP, and Analyze objects

import { readdirSync, readFileSync, writeFileSync } from 'fs';

// Go through each .ts file in elements
// if it has a ToAst, make sure it's imported into to-ast & included.

const names = {
    // typeMatches: 'core/typing/typeMatches.gen.ts',
    ToAst: 'core/typing/to-ast.gen.ts',
    ToTast: 'core/typing/to-tast.gen.ts',
    ToPP: 'core/printer/to-pp.gen.ts',
    Analyze: 'core/typing/analyze.gen.ts',
};

const elements: { [key in keyof typeof names]: string[] } = {
    // typeMatches: [],
    ToAst: [],
    ToTast: [],
    ToPP: [],
    Analyze: [],
};

const clean = (t: string) => t.replace(/[^a-zA-Z0-9_]/g, '');

export const syncTransforms = () => {
    readdirSync('./core/elements')
        .filter((t) => t.endsWith('.ts'))
        .forEach((name) => {
            const raw = readFileSync(`./core/elements/${name}`, 'utf8');
            Object.keys(names).forEach((key) => {
                if (raw.match(new RegExp(`export const ${key}\\b`))) {
                    elements[key as keyof typeof elements].push(
                        name.split('.')[0],
                    );
                }
            });
        });

    Object.keys(names).forEach((key) => {
        if (key === 'Analyze') {
            const raw = `
${elements[key]
    .map((t) => `import { ${key} as ${clean(t)} } from '../elements/${t}';`)
    .join('\n')}
import {Ctx} from './analyze';
import {Visitor} from '../transform-tast';

export const analyzeVisitor = (): Visitor<{ctx: Ctx, hit: {}}> => {
	return {
		${elements[key].map((t) => `...${clean(t)}`).join(',\n\t\t')}
	}
}
`;
            writeFileSync(names[key], raw, 'utf8');
            return;
        }

        const k = key as keyof typeof elements;

        const raw = `
${elements[k]
    .map((t) => `import { ${key} as ${clean(t)} } from '../elements/${t}';`)
    .join('\n')}

export type ${key} = ${elements[k]
            .map((t) => `typeof ${clean(t)}`)
            .join(' & ')};

export const make${key} = (): ${key} => {
	return {
		${elements[k].map((t) => `...${clean(t)}`).join(',\n\t\t')}
	}
}
`;
        writeFileSync(names[k], raw, 'utf8');
    });
};
