import fs from 'fs';
import * as peggy from 'peggy';
import { assembleRules, processRules } from './process-peg';

const raw = fs.readFileSync('./core/grammar/base.pegjs', 'utf8');
const ast = peggy.parser.parse(raw);

const { typesFile, grammarFile } = assembleRules(processRules(ast.rules), raw);

if (ast.initializer) {
    grammarFile.unshift('{\n' + ast.initializer.code + '\n}');
}

const jsOut = peggy.generate(grammarFile.join('\n\n'), {
    output: 'source',
    format: 'es',
});

fs.writeFileSync('./core/grammar/base.parser-untyped.js', jsOut);
fs.writeFileSync(
    './core/grammar/base.parser.ts',
    `// @ts-ignore
import {parse} from './base.parser-untyped.js'

export type Location = {
    start: {line: number, column: number},
    end: {line: number, column: number},
    idx: number,
};

` +
        typesFile.join('\n\n') +
        `\n\nexport const parseTyped = (input: string): File => parse(input)\n`,
);
