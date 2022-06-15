// FUTURE WORK
// - recognize that `is`, `location`, and `decorators` are common to all `Term`s,
//   and so they can be done at the top level of `transformTerm`, instead of in every branch.

import * as babel from '@babel/core';
import fs from 'fs';
import { buildTransformFile, Ctx, generateCheckers } from './build-transform';

// const [_, __, inFile, outFile, visitorTypesRaw, ...distinguishTypesRaw] =
//     process.argv;

const inFile = './core/typed-ast.ts';

const ast = babel.parse(fs.readFileSync(inFile, 'utf8'), {
    filename: inFile,
    presets: ['@babel/preset-typescript'],
});
if (!ast) {
    throw new Error(`unable to parse`);
}
const body = ast.program.body;

const visitorNames: string[] = [];

body.forEach((stmt) => {
    if (
        stmt.type === 'ExportNamedDeclaration' &&
        stmt.declaration &&
        stmt.declaration.type === 'TSTypeAliasDeclaration'
    ) {
        visitorNames.push(stmt.declaration.id.name);
    }
});

const ctx: Ctx = {
    types: {},
    visitorTypes: visitorNames,
    transformers: {},
    transformerStatus: {},
};

let text =
    buildTransformFile(body, './typed-ast', ctx) +
    '\n' +
    generateCheckers(ctx, []);

fs.writeFileSync('./core/transform-tast.ts', text);
