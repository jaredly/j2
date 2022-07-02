import { readdirSync } from 'fs';
import { builtinContext } from '../../ctx';
import {
    clearLocs,
    loadBuiltins,
    loadFixtures,
    runFixture,
} from './fixture-utils';

const base = __dirname + '/../../elements/';
readdirSync(base)
    .filter((x) => x.endsWith('.fixture.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe('fixture ' + file, () => {
            const { file, hasOnly } = loadFixtures(fixtureFile);
            const baseCtx = builtinContext.clone();
            loadBuiltins(file.builtins, baseCtx);

            it.each(file.fixtures)('$title', (fixture) => {
                let { title, input, output_expected } = fixture;

                let { checked, newOutput, outputTast } = runFixture(
                    fixture,
                    baseCtx,
                );

                const fullExpectedOutput = output_expected;
                const fullOutput = newOutput;

                if (output_expected && (!hasOnly || title.includes('[only]'))) {
                    if (!outputTast) {
                        throw new Error(`Unable to process the output??`);
                    }
                    expect(fullOutput.trim()).toEqual(
                        fullExpectedOutput.trim(),
                    );
                    try {
                        expect({
                            ...clearLocs(checked),
                            comments: [],
                        }).toEqual({
                            ...clearLocs(outputTast),
                            comments: [],
                        });
                    } catch (err) {
                        console.error(fullOutput);
                        console.error(fullExpectedOutput);
                        throw err;
                    }
                }
            });
        });
    });
