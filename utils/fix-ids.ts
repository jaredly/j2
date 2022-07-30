import { readdirSync, writeFileSync } from 'fs';
import { builtinContext } from '../core/ctx';
import { processFile } from '../core/full/full';
import {
    loadBuiltins,
    loadFixtures,
    serializeFixtureFile,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';
import { withFmt } from '../devui/refmt';

const base = './core/elements/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((fname) => {
        const fixtureFile = base + fname;

        let failures = 0;
        let updates = 0;

        const { file } = loadFixtures(fixtureFile);
        const baseCtx = builtinContext.clone();
        loadBuiltins(file.builtins, baseCtx);

        file.fixtures.forEach((fixture, i) => {
            let { title, output_expected } = fixture;
            const withb = baseCtx.clone();
            loadBuiltins(fixture.builtins, withb);

            let result = withFmt(processFile(fixture.input, withb));

            if (output_expected === result.text) {
                return;
            }

            const current = splitAliases(output_expected);
            const expected = splitAliases(result.text);

            if (current[1] === expected[1]) {
                file.fixtures[i].output_expected = result.text;
                updates++;
                return;
            }

            failures++;
            console.log(`[failure] ${fname}:${i} ${title}`);
        });

        if (failures === 0 && updates > 0) {
            console.log(`>> updated: ${fixtureFile} <<`);
            writeFileSync(fixtureFile, serializeFixtureFile(file));
        }
    });
