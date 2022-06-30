import { readdirSync, writeFileSync } from 'fs';
import { builtinContext } from '../core/ctx';
import {
    clearLocs,
    loadBuiltins,
    loadFixtures,
    runFixture,
    serializeFixtureFile,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';

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
            let {
                title,
                input,
                output_expected,
                builtins_deprecated: builtins,
            } = fixture;

            let result = runFixture(fixture, baseCtx);

            if (output_expected === result.newOutput) {
                return;
            }

            const current = splitAliases(output_expected);
            const expected = splitAliases(result.newOutput);

            if (current[1] === expected[1]) {
                file.fixtures[i].output_expected = result.newOutput;
                updates++;
                return;
            }

            failures++;
            console.log(`[failure] ${fname}:${i} ${title}`);

            // const fullExpectedOutput = output_expected;
            // const fullOutput = newOutput;

            // if (output_expected && (!hasOnly || title.includes('[only]'))) {
            //     if (!outputTast) {
            //         throw new Error(`Unable to process the output??`);
            //     }
            //     expect(fullOutput.trim()).toEqual(fullExpectedOutput.trim());
            //     try {
            //         expect({
            //             ...clearLocs(checked),
            //             comments: [],
            //         }).toEqual({
            //             ...clearLocs(outputTast),
            //             comments: [],
            //         });
            //     } catch (err) {
            //         console.error(fullOutput);
            //         console.error(fullExpectedOutput);
            //         throw err;
            //     }
            // }
        });

        if (failures === 0 && updates > 0) {
            console.log(`>> updated: ${fixtureFile} <<`);
            writeFileSync(fixtureFile, serializeFixtureFile(file));
        }
    });
