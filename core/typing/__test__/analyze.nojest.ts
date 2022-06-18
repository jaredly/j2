import {
    clearLocs,
    loadFixtures,
    runFixture,
    saveFixed,
} from './fixture-utils';
import equal from 'fast-deep-equal';

const fixtureFile = './core/typing/__test__/fixtures.jd';

const { fixtures, hasOnly } = loadFixtures(fixtureFile);

let fixed: [string, string, string | undefined][] = [];

fixtures.forEach(([title, input, output, errors, i]) => {
    var { newErrors, checked, newOutput, outputTast } = runFixture(
        input,
        output,
    );
    if (!hasOnly || title.includes('[only]')) {
        if (!process.env.FIX) {
            if (
                errors !== (newErrors.length ? newErrors.join('\n') : undefined)
            ) {
                console.log('Errors wrong');
                console.log(errors);
                console.log(newErrors);
                return;
            }
        }
    }
    errors = newErrors.length ? newErrors.join('\n') : undefined;

    if (output && (!hasOnly || title.includes('[only]')) && !process.env.FIX) {
        if (!equal(clearLocs(checked), clearLocs(outputTast))) {
            console.log('Tast wrong');
            console.log(clearLocs(checked));
            console.log(clearLocs(outputTast));
            return;
        }
    }

    fixed[i] = [title + '\n\n' + input.trim(), newOutput, errors];
});

if (hasOnly) {
    console.warn('Not writing fixtures, [only] was used');
} else {
    saveFixed(fixtureFile, fixtures, fixed);
}
