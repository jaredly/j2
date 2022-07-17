// FUTURE WORK
// - recognize that `is`, `location`, and `decorators` are common to all `Term`s,
//   and so they can be done at the top level of `transformTerm`, instead of in every branch.

import * as babel from '@babel/core';
import { TSType } from '@babel/types';
import * as fs from 'fs';
import * as path from 'path';
import { buildTransformFile, Ctx, generateCheckers } from './build-transform';

export const collectTypes = (inFile: string, followImports: boolean) => {
    const ast = babel.parse(fs.readFileSync(inFile, 'utf8'), {
        filename: inFile,
        presets: ['@babel/preset-typescript'],
    });
    if (!ast) {
        throw new Error(`unable to parse`);
    }
    const body = ast.program.body;

    const types: Ctx['types'] = {};

    const imports: { source: string; imports: string[] }[] = [];

    body.forEach((stmt) => {
        if (
            stmt.type === 'ExportNamedDeclaration' &&
            stmt.declaration &&
            stmt.declaration.type === 'TSTypeAliasDeclaration'
        ) {
            types[stmt.declaration.id.name] = {
                type: stmt.declaration.typeAnnotation,
                params: stmt.declaration.typeParameters,
            };
        }
        if (followImports) {
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
                            spec.type === 'ExportSpecifier'
                                ? spec.local.name
                                : null,
                        )
                        .filter(Boolean) as string[],
                });
            }
        }
    });

    imports.forEach((imp) => {
        const filePath = path.join(
            path.dirname(inFile),
            imp.source + (imp.source.endsWith('.') ? '/index.ts' : '.ts'),
        );
        if (!fs.existsSync(filePath)) {
            console.error(`No ${filePath} found`);
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
                types[name] = {
                    type: item.declaration.typeAnnotation,
                    params: item.declaration.typeParameters,
                };
            }
        });
    });

    // let text =
    //     buildTransformFile(
    //         body,
    //         path
    //             .relative(path.dirname(outFile), inFile)
    //             .replace(/\.ts$/, '')
    //             .replace(/^(?=[^.])/, './'),
    //         ctx,
    //     ) +
    //     '\n' +
    //     generateCheckers(ctx, []);

    // fs.writeFileSync(outFile, text);
    return types;
};
