// FUTURE WORK
// - recognize that `is`, `location`, and `decorators` are common to all `Term`s,
//   and so they can be done at the top level of `transformTerm`, instead of in every branch.

import * as babel from '@babel/core';
import * as fs from 'fs';
import * as path from 'path';
import { buildTransformFile, Ctx, generateCheckers } from './build-transform';

// const inFile = './core/typed-ast.ts';
const [_, __, inFile, outFile] = process.argv;

const ast = babel.parse(fs.readFileSync(inFile, 'utf8'), {
    filename: inFile,
    presets: ['@babel/preset-typescript'],
});
if (!ast) {
    throw new Error(`unable to parse`);
}
const body = ast.program.body;

const visitorNames: string[] = [];

const imports: { source: string; imports: string[] }[] = [];

body.forEach((stmt) => {
    if (
        stmt.type === 'ExportNamedDeclaration' &&
        stmt.declaration &&
        stmt.declaration.type === 'TSTypeAliasDeclaration'
    ) {
        visitorNames.push(stmt.declaration.id.name);
    }
    if (stmt.type === 'ImportDeclaration') {
        if (stmt.source.type === 'StringLiteral') {
            imports.push({
                source: stmt.source.value,
                imports: stmt.specifiers.map((spec) => spec.local.name),
            });
        }
    }
    if (stmt.type === 'ExportNamedDeclaration' && stmt.source) {
        imports.push({
            source: stmt.source.value,
            imports: stmt.specifiers
                .map((spec) =>
                    spec.type === 'ExportSpecifier' ? spec.local.name : null,
                )
                .filter(Boolean) as string[],
        });
    }
});

imports.forEach((imp) => {
    const filePath = path.join(
        path.dirname(inFile),
        imp.source + (imp.source.endsWith('.') ? '/index.ts' : '.ts'),
    );
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        return;
    }

    const ast = babel.parse(fs.readFileSync(filePath, 'utf8'), {
        filename: inFile,
        presets: ['@babel/preset-typescript'],
    });
    if (!ast) {
        throw new Error(`unable to parse`);
    }

    ast.program.body.forEach((item) => {
        if (
            item.type === 'ExportNamedDeclaration' &&
            item.declaration &&
            item.declaration.type === 'TSTypeAliasDeclaration'
        ) {
            const name = item.declaration.id.name;
            if (!visitorNames.includes(name)) {
                visitorNames.push(name);
                body.push(item);
            }
        }
    });
});

const ignore = [
    // for j3
    'Node',
    'NodeContents',
    'NodeList',

    'Locals',
    'Ctx',
    'VisitorCtx',
    'VError',
    'Verify',
    'LTCtx',
    'AVCtx',
    'ACtx',
    'Constraints',
];

const ctx: Ctx = {
    types: {},
    visitorTypes: visitorNames.filter((n) => !ignore.includes(n)),
    transformers: {},
    transformerStatus: {},
    // for j3
    ignoredMembers: ['form']
};

let text =
    buildTransformFile(
        body,
        path
            .relative(path.dirname(outFile), inFile)
            .replace(/\.ts$/, '')
            .replace(/^(?=[^.])/, './'),
        ctx,
    ) +
    '\n' +
    generateCheckers(ctx, []);

fs.writeFileSync(outFile, text);
