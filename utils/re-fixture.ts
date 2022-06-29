// Parse & then serialize fixtures. for ad hoc migrations

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    parseFixtureFile,
    serializeFixtureFile,
} from '../core/typing/__test__/fixture-utils';

const base = './core/elements';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((name) => {
        const full = join(base, name);
        const raw = readFileSync(full, 'utf8');
        writeFileSync(full, serializeFixtureFile(parseFixtureFile(raw)));
        // fail;
    });
