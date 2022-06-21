import {
    clearLocs,
    loadFixtures,
    runFixture,
    saveFixed,
} from './fixture-utils';

const fixtureFile = __dirname + '/fixtures.jd';

describe('analyze', () => {
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

        const fullExpectedOutput = output + (errors ? '\n-->\n' + errors : '');
        const fullOutput = newOutput + (errorText ? '\n-->\n' + errorText : '');

        // if (!hasOnly || title.includes('[only]')) {
        //     if (!process.env.FIX) {
        //         expect(errors).toEqual(
        //             errorText ? errorText : undefined,
        //         );
        //     }
        // }
        errors = errorText ? errorText : undefined;

        if (
            output &&
            (!hasOnly || title.includes('[only]')) &&
            !process.env.FIX
        ) {
            try {
                expect(clearLocs(checked)).toEqual(clearLocs(outputTast));
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
