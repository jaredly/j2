import { readdirSync } from 'fs';
import { clearLocs, loadFixtures, runFixture } from './fixture-utils';

const base = __dirname + '/../../elements/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe('analyze ' + file, () => {
            const { fixtures, hasOnly } = loadFixtures(fixtureFile);

            it.each(fixtures)('$title', (fixture) => {
                let { title, input, output, errors, i, builtins } = fixture;
                let { errorText, checked, newOutput, outputTast } =
                    runFixture(fixture);

                const fullExpectedOutput =
                    output + (errors ? '\n-->\n' + errors : '');
                const fullOutput =
                    newOutput + (errorText ? '\n-->\n' + errorText : '');
                errors = errorText ? errorText : undefined;

                if (output && (!hasOnly || title.includes('[only]'))) {
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
            });
        });
    });
