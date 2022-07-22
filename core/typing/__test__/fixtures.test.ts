import { readdirSync } from 'fs';
import { builtinContext } from '../../ctx';
import {
    clearLocs,
    loadBuiltins,
    loadFixtures,
    runFixture,
} from './fixture-utils';
import equal from 'fast-deep-equal';
import { printToString } from '../../printer/pp';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { printCtx } from '../to-ast';

export const diffPaths = (
    a: any,
    b: any,
    path: string[],
): null | { path: string[]; a: any; b: any } => {
    if (typeof a !== typeof b) {
        return { path, a, b };
    }
    if (typeof a === 'object') {
        if (Array.isArray(a)) {
            if (a.length !== b.length) {
                return { path, a: a.length, b: b.length };
            }
            for (let i = 0; i < a.length; i++) {
                const res = diffPaths(a[i], b[i], [...path, i.toString()]);
                if (res) {
                    return res;
                }
            }
            return null;
        }
        if (a == null || b == null) {
            return a == b ? null : { path, a, b };
        }
        for (const key in a) {
            if (!(key in b)) {
                return { path: [...path, key], a: a[key], b: b[key] };
            }
            const res = diffPaths(a[key], b[key], [...path, key]);
            if (res) {
                return res;
            }
        }
        for (const key in b) {
            if (!(key in a)) {
                return { path: [...path, key], a: a[key], b: b[key] };
            }
        }
        return null;
    }
    if (a !== b) {
        return { path, a, b };
    }
    return null;
};

const base = __dirname + '/../../elements/fixtures/';
readdirSync(base)
    .filter((x) => x.endsWith('.fixture.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe('fixture ' + file, () => {
            const { file, hasOnly } = loadFixtures(fixtureFile);

            it.each(file.fixtures)('$title', (fixture) => {
                const baseCtx = builtinContext.clone();
                loadBuiltins(file.builtins, baseCtx);

                let { title, output_expected } = fixture;

                let { checked, newOutput, outputTast, ctx2 } = runFixture(
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
                    const cc = { ...clearLocs(checked), comments: [] };
                    const co = { ...clearLocs(outputTast), comments: [] };
                    try {
                        expect(cc).toEqual(co);
                    } catch (err) {
                        const ddd = diffPaths(cc, co, ['top']);
                        const actx = printCtx(ctx2);
                        const outputAgain = printToString(
                            pegPrinter(
                                actx.ToAst.File(outputTast, actx),
                                newPPCtx(false),
                            ),
                            100,
                        );
                        throw new Error(
                            `${fullOutput}\n\n\n${fullExpectedOutput}\n\n${
                                ddd
                                    ? 'a=checked, b=outputTast ' +
                                      JSON.stringify(ddd)
                                    : null
                            }\n${
                                equal(cc, co) ? 'Equal' : 'Not equal'
                            }\n\n${outputAgain}`,
                        );
                    }
                }
            });
        });
    });
