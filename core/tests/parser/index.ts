import chalk from 'ansi-colors';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as peggy from 'peggy';
import { fullContext } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { pegPrinter } from '../../printer/pegPrinter';
import { printToString } from '../../printer/pp';
import { analyze, analyzeContext, verify } from '../../typing/analyze';
import { printCtx, ToAst } from '../../typing/to-ast';
import { ToTast } from '../../typing/to-tast';

const file = join(process.cwd(), 'core/tests/parser/examples.jd');

export const parserTests = () => {
    const pegRaw = readFileSync(
        join(process.cwd(), 'core/grammar/base.pegjs'),
        'utf8',
    );
    const past = peggy.parser.parse(pegRaw);

    const input = readFileSync(file, 'utf8');
    input.split('\n\n').forEach((chunk) => {
        const file = parseTyped(chunk + '\n');
        if (file.toplevels.length) {
            const ctx = fullContext();
            const typed = ToTast.File(file, ctx);
            const actx = analyzeContext(ctx);
            const checked = analyze(typed, actx);
            const errors = verify(checked, actx);

            if (errors.errorDecorators.length || errors.missingTypes.length) {
                console.error(chalk.bgRed(`Type Checking Failed`));
                console.log(errors);
            } else {
                console.error(chalk.bgGreen(`Type checked!`));
            }

            console.log();

            const astAgain = ToAst.File(checked, printCtx(ctx));
            console.log(
                printToString(pegPrinter(astAgain, { hideIds: false }), 100),
            );
            console.log();
        }
    });
};
