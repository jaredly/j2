import { readdirSync } from 'fs';
import { clearLocs, loadFixtures, runFixture } from './fixture-utils';

const base = __dirname + '/../../elements/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe('analyze ' + file, () => {
            const { file, hasOnly } = loadFixtures(fixtureFile);

            it.each(file.fixtures)('$title', (fixture) => {
                let {
                    title,
                    input,
                    output_expected,
                    builtins_deprecated: builtins,
                } = fixture;
                let { checked, newOutput, outputTast } = runFixture(
                    fixture,
                    file.builtins,
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
                        // console.log(
                        //     JSON.stringify({
                        //         ...clearLocs(checked),
                        //         comments: [],
                        //     }),
                        // );
                        // console.log(
                        //     JSON.stringify({
                        //         ...clearLocs(outputTast),
                        //         comments: [],
                        //     }),
                        // );
                        throw err;
                    }
                    // } catch (err) {
                    //     // console.error(
                    //     //     title +
                    //     //         '\n' +
                    //     //         builtins.join('\n') +
                    //     //         '\n\n' +
                    //     //         input +
                    //     //         '\n\n-->\n\n' +
                    //     //         newOutput,
                    //     // );
                    //     // console.error(JSON.stringify(clearLocs(checked)));
                    //     throw err;
                    // }
                }
            });
        });
    });
