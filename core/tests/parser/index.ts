import { readFileSync } from 'fs';
import { join } from 'path';
import { parseTyped } from '../../grammar/base.parser';
import { ToTast } from '../../to-tast';

const file = join(process.cwd(), 'core/tests/parser/examples.jd');

export const parserTests = () => {
    const input = readFileSync(file, 'utf8');
    input.split('\n\n').forEach((chunk) => {
        const file = parseTyped(chunk + '\n');
        if (file.toplevels.length) {
            const res = ToTast.File(file, {
                resolve() {
                    return [];
                },
            });
            console.log(JSON.stringify(res.toplevels));
        }
    });
};
