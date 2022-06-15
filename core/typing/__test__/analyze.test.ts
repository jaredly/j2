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
            .split('\n====\n')
            .map((chunk) => chunk.trim().split('\n-->\n'));

        const fixed = fixtures.map(([input, output]) => {
            const ctx = fullContext();
            const tast = ToTast.File(parseTyped(input), ctx);

            const checked = analyze(tast, analyzeContext(ctx));

            if (output) {
                console.log(output);
                expect(clearLocs(checked)).toEqual(
                    clearLocs(ToTast.File(parseTyped(output), ctx)),
                );
            }
            return [
                input.trim(),
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
                .join('\n\n====\n\n'),
        );
        // lol
    });
});
