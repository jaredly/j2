import chalk from 'ansi-colors';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as peggy from 'peggy';
import { fullContext } from '../../ctx';
import { parseFile } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { printToString } from '../../printer/pp';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { analyze, analyzeContext, verify } from '../../typing/analyze';
import { printCtx } from '../../typing/to-ast';

const file = join(process.cwd(), 'core/tests/parser/examples.jd');

export const parserTests = () => {
    const input = readFileSync(file, 'utf8');
    input.split('\n\n').forEach((chunk) => {
        const file = fixComments(parseFile(chunk + '\n'));
        if (file.toplevels.length) {
            const ctx = fullContext();
            const [typed, _] = ctx.ToTast.File(file, ctx);
            const actx = analyzeContext(ctx);
            const checked = analyze(typed, actx);

            // const errors = verify(checked, actx);
            // if (errors.errorDecorators.length || errors.missingTypes.length) {
            //     console.error(chalk.bgRed(`Type Checking Failed`));
            //     console.log(errors);
            // } else {
            //     console.error(chalk.bgGreen(`Type checked!`));
            // }

            console.log();

            const pactx = printCtx(ctx);
            const astAgain = pactx.ToAst.File(checked, pactx);
            console.log(
                printToString(pegPrinter(astAgain, newPPCtx(false)), 100),
            );
            console.log();
        }
    });
};
