import * as fs from 'fs';
import { fullContext, noloc } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { pegPrinter } from '../../printer/pegPrinter';
import { printToString } from '../../printer/pp';
import { transformFile } from '../../transform-tast';
import { File } from '../../typed-ast';
import { analyze, analyzeContext, verify } from '../analyze';
import { printCtx, ToAst } from '../to-ast';
import { ToTast } from '../to-tast';

const clearLocs = (ast: File) => {
    return transformFile(
        ast,
        {
            Loc(node, _) {
                return noloc;
            },
            File(node, _) {
                return {
                    ...node,
                    comments: node.comments.map(([_, text]) => [noloc, text]),
                };
            },
        },
        null,
    );
};

const fixtureFile = __dirname + '/fixtures.jd';

describe('analyze', () => {
    let fixtures: [string, string, string, string | undefined, number][] = fs
        .readFileSync(fixtureFile, 'utf8')
        .split(/(?=\n==[^\n=]*==\n)/)
        .filter((x) => x.trim())
        .map((chunk, i) => {
            const [input, output, errors] = chunk.trim().split('\n-->\n');
            const [title, ...rest] = input.split('\n');
            return [title, rest.join('\n').trim(), output, errors, i];
        });
    let hasOnly = fixtures.some((f) => f[0].includes('[only]'));

    if (hasOnly) {
        hasOnly = true;
        fixtures = fixtures.filter((f) => f[0].includes('[only]'));
    }

    let fixed: [string, string, string | undefined][] = [];

    afterAll(() => {
        if (hasOnly) {
            console.warn('Not writing fixtures, [only] was used');
            return;
        }
        let missing = false;
        for (let i = 0; i < fixtures.length; i++) {
            if (!fixed[i]) {
                missing = true;
                break;
            }
        }
        if (missing) {
            console.warn(`Not writing fixtures, looks like something failed`);
            return;
        }
        fs.writeFileSync(
            fixtureFile,
            fixed
                .map(
                    ([input, output, errors]) =>
                        `${input}\n-->\n${output}` +
                        (errors ? '\n-->\n' + errors : ''),
                )
                .join('\n\n'),
        );
    });

    it.each(fixtures)('%s', (title, input, output, errors, i) => {
        const hasOnly = fixtures.some((s) => s[0].includes('[only]'));

        const ctx = fullContext();
        const tast = ToTast.File(parseTyped(input), ctx);

        const checked = analyze(tast, analyzeContext(ctx));

        const newOutput = printToString(
            pegPrinter(ToAst.File(checked, printCtx(ctx)), {
                hideIds: false,
            }),
            100,
        );

        const { errorDecorators, missingTypes } = verify(
            checked,
            analyzeContext(ctx),
        );
        let newErrors: string[] = [];
        errorDecorators.forEach((decl) => {
            newErrors.push(
                `🚨 Error decorator at ${
                    decl.start.line + ':' + decl.start.column
                }`,
            );
        });
        missingTypes.forEach((missing) => {
            newErrors.push(
                `🚨 Missing type at ${
                    missing.start.line + ':' + missing.start.column
                }`,
            );
        });
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
                expect(clearLocs(checked)).toEqual(
                    clearLocs(ToTast.File(parseTyped(output), ctx)),
                );
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
