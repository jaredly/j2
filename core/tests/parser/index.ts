import { readFileSync } from 'fs';
import { join } from 'path';
import { parseTyped } from '../../grammar/base.parser';

const file = join(process.cwd(), 'core/tests/parser/examples.jd');

export const parserTests = () => {
    const input = readFileSync(file, 'utf8');
    input.split('\n\n').forEach((chunk) => {
        parseTyped(chunk + '\n');
    });
};
