import { grams as apply } from './apply';
import { grams as ifs } from './ifs';
import { grams as binop } from './binop';
import { grams as enums } from './enums';
import { grams as constants } from './constants';
import { grams as switchs } from './switchs';
import { grams as lambda } from './lambda';
import { grams as dexpr } from './dexpr';
import { grams as ident } from './ident';
import { grams as comments } from './comments';

export const grammar = {
    ...constants,
    ...ident,
    ...apply,
    ...comments,
    // ...binop,
    ...lambda,
};

export const tags = {
    Expression: ['Applyable'],
};
