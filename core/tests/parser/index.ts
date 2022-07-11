import chalk from 'ansi-colors';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as peggy from 'peggy';
import { builtinContext, FullContext } from '../../ctx';
import { fileToTast } from '../../elements/base';
import { parseFile } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { printToString } from '../../printer/pp';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { analyze, verify } from '../../typing/analyze';
import { printCtx } from '../../typing/to-ast';

const file = join(process.cwd(), 'core/tests/parser/examples.jd');

export const parserTests = () => {
    const input = readFileSync(file, 'utf8');
    input.split('\n\n').forEach((chunk) => {
        const file = fixComments(parseFile(chunk + '\n'));
        if (file.toplevels.length) {
            const ctx = builtinContext.clone();
            const [checked, nctx] = fileToTast(file, ctx);
            // const checked = analyze(typed, ctx);

            console.log();

            const pactx = printCtx(nctx as FullContext);
            const astAgain = pactx.ToAst.File(checked, pactx);
            console.log(
                printToString(pegPrinter(astAgain, newPPCtx(false)), 100),
            );
            console.log();
        }
    });
};
