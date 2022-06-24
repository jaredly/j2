import * as babel from '@babel/core';
import * as fs from 'fs';

const inFile = './core/typed-ast.ts';

let raw = fs.readFileSync(inFile, 'utf8');
const ast = babel.parse(raw, {
    filename: inFile,
    presets: ['@babel/preset-typescript'],
})!;

let last = 0;
const exports: { [source: string]: [number, number] } = {};
ast.program.body.forEach((line) => {
    if (line.type === 'ExportNamedDeclaration' && line.source) {
        // exports.push({ loc: line.loc!, source: line.source.value });
        exports[line.source.value] = [line.start!, line.end!];
        last = line.end!;
    }
});

const replaces: { range: [number, number]; text: string; prev: string }[] = [];

const elements: string[] = fs
    .readdirSync('./core/elements')
    .filter((t: string) => t.endsWith('.ts'));
elements.forEach((name) => {
    const fileName = `./core/elements/${name}`;
    const east = babel.parse(fs.readFileSync(fileName, 'utf8'), {
        filename: fileName,
        presets: ['@babel/preset-typescript'],
    })!;
    const key = `./elements/${name.split('.')[0]}`;
    const range = exports[key] ?? [last, last];
    const tnames = east.program.body
        .map((line) => {
            if (
                line.type === 'ExportNamedDeclaration' &&
                line.declaration?.type === 'TSTypeAliasDeclaration'
            ) {
                return line.declaration.id.name;
            }
            return null;
        })
        .filter(Boolean);
    if (tnames.length) {
        const prev = raw.slice(range[0], range[1]);
        let text = `export { ${tnames.sort().join(', ')} } from '${key}';`;
        if (text.length > 79) {
            text = `export {\n    ${tnames
                .sort()
                .join(',\n    ')},\n} from '${key}';`;
        }
        if (prev !== text) {
            replaces.push({
                range,
                text,
                prev,
            });
        }
    }
});

if (replaces.length) {
    let off = 0;
    replaces.forEach(({ range: [start, end], text }) => {
        start += off;
        end += off;
        raw = raw.slice(0, start) + text + raw.slice(end);
        off += text.length - (end - start);
    });
    fs.writeFileSync('./core/typed-ast.ts', raw);
    console.log('Success');
} else {
    console.log('No change');
}
