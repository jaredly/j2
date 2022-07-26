import { Ctx } from '../typing/analyze';
import { Pattern } from './pattern';

export const patternIsExhaustive = (pat: Pattern, ctx: Ctx): boolean => {
    switch (pat.type) {
        case 'PBlank':
        case 'PName':
            return true;
        case 'PRecord':
            return pat.items.every((item) =>
                patternIsExhaustive(item.pat, ctx),
            );
        case 'PDecorated':
            return patternIsExhaustive(pat.inner, ctx);
        case 'Number':
        case 'String':
            return false;
    }
};
