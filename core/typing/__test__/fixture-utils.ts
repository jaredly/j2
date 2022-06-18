import * as fs from 'fs';
import { fullContext, noloc } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { pegPrinter } from '../../printer/pegPrinter';
import { printToString } from '../../printer/pp';
import { transformFile } from '../../transform-tast';
import { File } from '../../typed-ast';
import { analyze, analyzeContext, verify } from '../analyze';
import { printCtx, ToAst } from '../to-ast';
import { ToTast } from '../to-tast';

export type Fixture = [string, string, string, string | undefined, number];
export const clearLocs = (ast: File) => {
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

export const loadFixtures = (fixtureFile: string) => {
    let fixtures: Fixture[] = fs
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

    return { fixtures, hasOnly };
};

export const saveFixed = (
    fixtureFile: string,
    fixtures: Fixture[],
    fixed: [string, string, string | undefined][],
) => {
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
};

export function runFixture(input: string, output: string) {
    const ctx = fullContext();
    let tast;
    try {
        tast = ToTast.File(fixComments(parseTyped(input)), ctx);
    } catch (err) {
        console.log('Failed to parse input:', input);
        throw err;
    }

    const checked = analyze(tast, analyzeContext(ctx));
    // console.log(JSON.stringify(checked.toplevels[0]));

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
    return {
        newErrors,
        checked,
        newOutput,
        outputTast: ToTast.File(fixComments(parseTyped(output)), ctx),
    };
}
