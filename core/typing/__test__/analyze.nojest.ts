import {
    clearLocs,
    loadFixtures,
    runFixture,
    saveFixed,
} from './fixture-utils';
import equal from 'fast-deep-equal';
import { readdirSync } from 'fs';

const [_, __, arg] = process.argv;

const fixtureFile = './core/typing/__test__/fixtures.jd';
const base = './core/elements/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd') && (!arg || x.includes(arg)))
    .forEach((file) => {
        const fixtureFile = base + file;

        const { fixtures, hasOnly } = loadFixtures(fixtureFile);

        let fixed: [string, string, string | undefined][] = [];

        fixtures.forEach(([title, input, output, errors, i]) => {
            var { errorText, checked, newOutput, outputTast } = runFixture(
                input,
                output,
            );
            if (!hasOnly || title.includes('[only]')) {
                if (!process.env.FIX) {
                    if (errors !== errorText) {
                        console.log('Errors wrong');
                        console.log(errors);
                        console.log(errorText);
                        return;
                    }
                }
            }
            errors = errorText ?? undefined;

            if (
                output &&
                outputTast &&
                (!hasOnly || title.includes('[only]')) &&
                !process.env.FIX
            ) {
                if (!equal(clearLocs(checked), clearLocs(outputTast))) {
                    console.log('Tast wrong');
                    console.log(JSON.stringify(clearLocs(checked)));
                    console.log(JSON.stringify(clearLocs(outputTast)));
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
    });
