// Main entry point

import { writeFileSync } from 'fs';
import { grammar } from '..';
import { generatePeg } from './peg';
import { generateTypes } from './types';

const raw = generateTypes(grammar);
writeFileSync('./nore/generated/types.ts', raw);

const peg = generatePeg(grammar);
writeFileSync('./nore/generated/grammar.pegjs', peg);
