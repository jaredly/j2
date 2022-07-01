import * as fs from 'fs';
import * as peggy from 'peggy';
import { assembleRules, processRules } from './process-peg';

const elements = fs
    .readdirSync('./core/elements')
    .filter((x) => x.endsWith('.ts'))
    .map((name) => {
        const text = fs.readFileSync(`./core/elements/${name}`, 'utf8');
        const start = '\nexport const grammar = `\n';
        const end = '\n`;\n';
        if (text.includes(start)) {
            return (
                `// ${name}\n\n` +
                text.slice(
                    text.indexOf(start) + start.length,
                    text.indexOf(end),
                )
            );
        }
        return null;
    })
    .filter(Boolean);

const base = fs.readFileSync('./core/grammar/base.pegjs.tpl', 'utf8');
const raw = base + '\n\n' + elements.join('\n\n\n');
fs.writeFileSync('./core/grammar/full.pegjs', raw);

const ast = peggy.parser.parse(raw);

const { typesFile, grammarFile } = assembleRules(
    processRules(ast.rules, ['File', 'TypeFile']),
    raw,
);

if (ast.initializer) {
    grammarFile.unshift('{\n' + ast.initializer.code + '\n}');
}

const jsOut = peggy.generate(grammarFile.join('\n\n'), {
    output: 'source',
    format: 'es',
    allowedStartRules: ['File', 'Type', 'TypeFile'],
});

fs.writeFileSync(
    './core/grammar/base.parser-untyped.ts',
    '// @ts-nocheck\n' + jsOut,
);
fs.writeFileSync(
    './core/grammar/base.parser.ts',
    `import {parse} from './base.parser-untyped'

export type Loc = {
    start: {line: number, column: number, offset: number},
    end: {line: number, column: number, offset: number},
    idx: number,
};

` +
        typesFile.join('\n\n') +
        `\n
// @ts-ignore
export const parseFile = (input: string): File => parse(input, {startRule: 'File'});
// @ts-ignore
export const parseType = (input: string): Type => parse(input, {startRule: 'Type'});
// @ts-ignore
export const parseTypeFile = (input: string): TypeFile => parse(input, {startRule: 'TypeFile'});
`,
);
