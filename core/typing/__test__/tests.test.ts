import { readdirSync, readFileSync } from 'fs';
import { builtinContext, FullContext } from '../../ctx';
import { parseFile } from '../../grammar/base.parser';
import { aliasesFromString, splitAliases } from './fixture-utils';
import { runTest } from './run-test';

// @ts-ignore
global.window = global;

const base = __dirname + '/../../elements/test/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe(file, () => {
            const raw = readFileSync(fixtureFile, 'utf8');
            const [aliasRaw, text] = splitAliases(raw);
            const ast = parseFile(text);
            let ctx = builtinContext.clone();
            if (aliasRaw) {
                ctx = ctx.withAliases(
                    aliasesFromString(aliasRaw),
                ) as FullContext;
            }

            const result = runTest(ast, ctx, false);
            result.statuses.forEach((status) => {
                it(
                    text.slice(status.loc.start.offset, status.loc.end.offset) +
                        ` ${file}:${status.loc.start.line} - should be valid`,
                    () => {
                        expect(status.text).toBe(null);
                    },
                );
            });
            it('should parse I guess', () => {});
        });
    });
