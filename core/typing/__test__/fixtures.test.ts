import { readdirSync } from 'fs';
import { withFmt } from '../../../devui/refmt';
import { builtinContext, locClearVisitor } from '../../ctx';
import { processFile } from '../../full/full';
import { transformToplevel } from '../../transform-tast';
import { loadBuiltins, loadFixtures } from './fixture-utils';

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
                loadBuiltins(file.builtins.concat(fixture.builtins), baseCtx);

                let { title, output_expected, output_failed } = fixture;

                if (output_failed) {
                    throw new Error(`Has a failed output`);
                }

                const { text: newOutput, file: result } = withFmt(
                    processFile(fixture.input, baseCtx.clone()),
                );

                const fullExpectedOutput = output_expected;
                const fullOutput = newOutput;

                if (output_expected && (!hasOnly || title.includes('[only]'))) {
                    if (result.type === 'Error') {
                        throw new Error(`Unable to process the output??`);
                    }
                    expect(fullOutput.trim()).toEqual(
                        fullExpectedOutput.trim(),
                    );

                    const reprocessed = processFile(
                        output_expected,
                        baseCtx.clone(),
                    );
                    if (reprocessed.type === 'Error') {
                        throw new Error(`Unable to reprocess the output??`);
                    }
                    if (reprocessed.info.length !== result.info.length) {
                        throw new Error(
                            `Reprocessed output has different number of toplevels`,
                        );
                    }
                    reprocessed.info.forEach((info, i) => {
                        const orig = result.info[i];
                        const got = transformToplevel(
                            info.contents.top,
                            locClearVisitor,
                            null,
                        );
                        const old = transformToplevel(
                            orig.contents.top,
                            locClearVisitor,
                            null,
                        );
                        try {
                            expect(got).toEqual(old);
                        } catch (err) {
                            throw new Error(
                                `Reprocessed toplevel ${i} differs in ${JSON.stringify(
                                    diffPaths(got, old, ['top']),
                                )}\n\n${(err as Error).message}`,
                            );
                        }
                    });
                }
            });
        });
    });
