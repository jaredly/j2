import { readdirSync, readFileSync } from 'fs';
import { builtinContext } from '../../ctx';
import { parseFile } from '../../grammar/base.parser';
import { runTest } from './run-test';

// @ts-ignore
global.window = global;

const base = __dirname + '/../../elements/test/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe(file, () => {
            const text = readFileSync(fixtureFile, 'utf8');
            const ast = parseFile(text);
            let ctx = builtinContext.clone();

            const result = runTest(ast, false);
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
