import { fstat, readdirSync } from 'fs';
import {
    clearLocs,
    Fixed,
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

            let fixed: Fixed[] = [];

            if (process.env.FIX) {
                afterAll(() => {
                    if (hasOnly) {
                        console.warn('Not writing fixtures, [only] was used');
                        return;
                    }
                    saveFixed(fixtureFile, fixtures, fixed);
                });
            }

            it.each(fixtures)(
                '$title',
                ({ title, input, output, errors, i, builtins }) => {
                    var { errorText, checked, newOutput, outputTast } =
                        runFixture(builtins, input, output);

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
                        if (!outputTast) {
                            throw new Error(`Unable to process the output??`);
                        }
                        try {
                            expect({
                                ...clearLocs(checked),
                                comments: [],
                            }).toEqual({
                                ...clearLocs(outputTast),
                                comments: [],
                            });
                            expect(fullOutput).toEqual(fullExpectedOutput);
                        } catch (err) {
                            console.error(
                                title +
                                    '\n' +
                                    builtins.join('\n') +
                                    '\n\n' +
                                    input +
                                    '\n\n-->\n\n' +
                                    newOutput,
                            );
                            console.error(JSON.stringify(clearLocs(checked)));
                            throw err;
                        }
                    }

                    fixed[i] = {
                        input:
                            title +
                            (builtins.length
                                ? '\n' + builtins.join('\n')
                                : '') +
                            '\n\n' +
                            input.trim(),
                        output: newOutput,
                        errors,
                    };

                    // lol
                },
            );
        });
    });
