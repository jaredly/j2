import { readFileSync } from 'fs';
import { join } from 'path';
import { fullContext } from '../../ctx';
import { parseTyped } from '../../grammar/base.parser';
import { printCtx, ToAst } from '../../to-ast';
import { ToTast } from '../../to-tast';

const file = join(process.cwd(), 'core/tests/parser/examples.jd');

export const parserTests = () => {
    const input = readFileSync(file, 'utf8');
    input.split('\n\n').forEach((chunk) => {
        const file = parseTyped(chunk + '\n');
        if (file.toplevels.length) {
            const ctx = fullContext();
            const res = ToTast.File(file, ctx);
            res.toplevels.forEach((t) => {
                console.log(JSON.stringify(t.expr));
            });
            console.log(JSON.stringify(ToAst.File(res, printCtx(ctx))));
        }
    });
};
