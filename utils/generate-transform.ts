// FUTURE WORK
// - recognize that `is`, `location`, and `decorators` are common to all `Term`s,
//   and so they can be done at the top level of `transformTerm`, instead of in every branch.

import * as t from '@babel/types';
import babel, { traverse } from '@babel/core';
import fs from 'fs';
import generate from '@babel/generator';
import {
    buildTransformFile,
    Ctx,
    generateCheckers,
    getTypeName,
    getUnionNames,
    makeTransformer,
} from './build-transform';

const [_, __, inFile, outFile, visitorTypesRaw, ...distinguishTypesRaw] =
    process.argv;
const ast = babel.parse(fs.readFileSync(inFile, 'utf8'), {
    filename: inFile,
    presets: ['@babel/preset-typescript'],
});
if (!ast) {
    throw new Error(`unable to parse`);
}
const body = ast.program.body;

const ctx: Ctx = {
    types: {},
    visitorTypes: visitorTypesRaw.split('\n'),
    transformers: {},
    transformerStatus: {},
};

let text =
    buildTransformFile(body, ctx) +
    '\n' +
    generateCheckers(ctx, distinguishTypesRaw);

fs.writeFileSync(outFile, text);
