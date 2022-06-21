import * as fs from 'fs';
import { fullContext, noloc } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { printToString } from '../../printer/pp';
import { transformFile } from '../../transform-tast';
import { File } from '../../typed-ast';
import { analyze, analyzeContext, verify } from '../analyze';
import { printCtx, ToAst } from '../to-ast';
import { makeToTast, ToTast } from '../to-tast';

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
        tast = ctx.ToTast.File(fixComments(parseTyped(input)), ctx);
    } catch (err) {
        console.log('Failed to parse input:', input);
        throw err;
    }

    const checked = analyze(tast, analyzeContext(ctx));
    // console.log(JSON.stringify(checked.toplevels[0]));

    const actx = printCtx(ctx);
    const newOutput = printToString(
        pegPrinter(actx.ToAst.File(checked, actx), newPPCtx(false)),
        100,
    );

    const { errorDecorators, missingTypes } = verify(
        checked,
        analyzeContext(ctx),
    );
    let errorText: string[] = [];
    if (errorDecorators.length) {
        errorText.push(`🚨 ${errorDecorators.length} error decorators`);
    }
    if (missingTypes.length) {
        errorText.push(`🚨 ${missingTypes.length} missing types`);
    }
    return {
        errorText: errorText.length ? errorText.join('\n') : null,
        checked,
        newOutput,
        outputTast: ctx.ToTast.File(fixComments(parseTyped(output)), ctx),
    };
}
