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
        var { newErrors, checked, newOutput, outputTast } = runFixture(
            input,
            output,
        );
        if (!hasOnly || title.includes('[only]')) {
            if (!process.env.FIX) {
                expect(errors).toEqual(
                    newErrors.length ? newErrors.join('\n') : undefined,
                );
            }
        }
        errors = newErrors.length ? newErrors.join('\n') : undefined;

        if (
            output &&
            (!hasOnly || title.includes('[only]')) &&
            !process.env.FIX
        ) {
            try {
                expect(clearLocs(checked)).toEqual(clearLocs(outputTast));
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
