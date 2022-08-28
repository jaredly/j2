// Main entry point

import { writeFileSync } from 'fs';
import { grammar } from '..';
import { generateTypes } from './types';

const raw = generateTypes(grammar);
writeFileSync('./nore/generated/types.ts', raw);
