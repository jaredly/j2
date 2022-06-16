import * as fs from 'fs';
import { fullContext, noloc } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { pegPrinter } from '../../printer/pegPrinter';
import { printToString } from '../../printer/pp';
import { transformFile } from '../../transform-tast';
import { File } from '../../typed-ast';
import { analyze, analyzeContext } from '../analyze';
import { printCtx, ToAst } from '../to-ast';
import { ToTast } from '../to-tast';

const clearLocs = (ast: File) => {
    return transformFile(
        ast,
        {
            Loc(node, _) {
                return noloc;
            },
        },
        null,
    );
};

const fixtureFile = __dirname + '/fixtures.jd';

describe('analyze', () => {
    it('should work', () => {
        const fixtures = fs
            .readFileSync(fixtureFile, 'utf8')
            .split(/(?=\n==[^\n=]*==\n)/)
            .filter((x) => x.trim())
            .map((chunk) => chunk.trim().split('\n-->\n'));

        const hasOnly = fixtures.some((s) => s[0].includes('[only]'));

        const fixed = fixtures.map(([rawinput, output]) => {
            const [title, ...rest] = rawinput.split('\n');
            const input = rest.join('\n').trim();
            const ctx = fullContext();
            const tast = ToTast.File(parseTyped(input), ctx);

            const checked = analyze(tast, analyzeContext(ctx));

            if (output && (!hasOnly || title.includes('[only]'))) {
                try {
                    expect(clearLocs(checked)).toEqual(
                        clearLocs(ToTast.File(parseTyped(output), ctx)),
                    );
                } catch (err) {
                    console.error(title);
                    throw err;
                }
            }
            return [
                title + '\n\n' + input.trim(),
                printToString(
                    pegPrinter(ToAst.File(checked, printCtx(ctx)), {
                        hideIds: false,
                    }),
                    100,
                ),
            ];
        });

        fs.writeFileSync(
            fixtureFile,
            fixed
                .map(([input, output]) => `${input}\n-->\n${output}`)
                .join('\n\n'),
        );
        // lol
    });
});
