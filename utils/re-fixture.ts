// Parse & then serialize fixtures. for ad hoc migrations

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    parseFixtureFile,
    serializeFixtureFile,
} from '../core/typing/__test__/fixture-utils';

const [_, __, what] = process.argv;
console.log(what);

const base = './core/elements/fixtures';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((name) => {
        if (what && what !== name) {
            return;
        }
        console.log(name);
        const full = join(base, name);
        const raw = readFileSync(full, 'utf8');
        writeFileSync(full, serializeFixtureFile(parseFixtureFile(raw)));
        // fail;
    });
