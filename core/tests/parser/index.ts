import { readFileSync } from 'fs';
import { join } from 'path';
import { fullContext } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { printCtx, ToAst } from '../../to-ast';
import { ToTast } from '../../to-tast';
import * as peggy from 'peggy';
import { printToString } from '../../printer/pp';
import { pegPrinter } from '../../printer/pegPrinter';

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
            const res = ToTast.File(file, ctx);
            // res.toplevels.forEach((t) => {
            //     console.log(JSON.stringify(t.expr));
            // });
            const back = ToAst.File(res, printCtx(ctx));
            console.log(printToString(pegPrinter(back, past), 100));
            console.log();
        }
    });
};
