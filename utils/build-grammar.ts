import fs from 'fs';
import * as peggy from 'peggy';
// @ts-ignore
// import plugin from 'ts-pegjs';
import { assembleRules, processRules } from './process-peg';

const raw = fs.readFileSync('./core/base.pegjs', 'utf8');
const ast = peggy.parser.parse(raw);

const { typesFile, grammarFile } = assembleRules(processRules(ast.rules), raw);

if (ast.initializer) {
    grammarFile.unshift('{\n' + ast.initializer.code + '\n}');
}

const jsOut = peggy.generate(grammarFile.join('\n\n'), {
    output: 'source',
    format: 'es',
    // plugins: [plugin],
});

fs.writeFileSync(
    './core/base.parser.ts',
    '// @ts-nocheck\n' +
        jsOut +
        `
type IFileRange = {start: {line: number, column: number},
end: {line: number, column: number}};
        ` +
        '\n\n// TYPES\n\nexport type Location = IFileRange & {idx: number};\n\n' +
        typesFile.join('\n\n') +
        `\n\nexport const parseTyped = (input: string): File => parse(input)\n`,
);
