import { fstat, readdirSync } from 'fs';
import {
    clearLocs,
    loadFixtures,
    runFixture,
    saveFixed,
} from './fixture-utils';

const base = __dirname + '/../../elements/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe('analyze ' + file, () => {
            const { fixtures, hasOnly } = loadFixtures(fixtureFile);

            let fixed: [string, string, string | undefined][] = [];

            afterAll(() => {
                if (hasOnly) {
                    console.warn('Not writing fixtures, [only] was used');
                    return;
                }
                saveFixed(fixtureFile, fixtures, fixed);
            });

            it.each(fixtures)('%s', (title, input, output, errors, i) => {
                var { errorText, checked, newOutput, outputTast } = runFixture(
                    input,
                    output,
                );

                const fullExpectedOutput =
                    output + (errors ? '\n-->\n' + errors : '');
                const fullOutput =
                    newOutput + (errorText ? '\n-->\n' + errorText : '');
                errors = errorText ? errorText : undefined;

                if (
                    output &&
                    (!hasOnly || title.includes('[only]')) &&
                    !process.env.FIX
                ) {
                    try {
                        expect(clearLocs(checked)).toEqual(
                            clearLocs(outputTast),
                        );
                        expect(fullOutput).toEqual(fullExpectedOutput);
                    } catch (err) {
                        console.error(
                            title + '\n\n' + input + '\n\n-->\n\n' + newOutput,
                        );
                        throw err;
                    }
                }

                fixed[i] = [title + '\n\n' + input.trim(), newOutput, errors];

                // lol
            });
        });
    });
