import { Analyze as apply } from '../elements/apply/Analyze';
import { Analyze as array } from '../elements/array';
import { Analyze as awaits } from '../elements/awaits';
import { Analyze as binops } from '../elements/binops';
import { Analyze as constants } from '../elements/constants';
import { Analyze as enumexprs } from '../elements/enum-exprs';
import { Analyze as enums } from '../elements/enums';
import { Analyze as generics } from '../elements/generics/Analyze';
import { Analyze as ifs } from '../elements/ifs';
import { Analyze as lambda } from '../elements/lambda';
import { Analyze as lets } from '../elements/lets';
import { Analyze as pattern } from '../elements/pattern';
import { Analyze as recordexprs } from '../elements/record-exprs';
import { Analyze as records } from '../elements/records';
import { Analyze as switchs } from '../elements/switchs';
import { Analyze as typevbls } from '../elements/type-vbls';
import { Analyze as type } from '../elements/type';
import { Ctx } from './analyze';
import { Visitor } from '../transform-tast';

export const analyzeVisitor = (): Visitor<{ ctx: Ctx; hit: {} }> => {
    return {
        ...apply,
        ...array,
        ...awaits,
        ...binops,
        ...constants,
        ...enumexprs,
        ...enums,
        ...generics,
        ...ifs,
        ...lambda,
        ...lets,
        ...pattern,
        ...recordexprs,
        ...records,
        ...switchs,
        ...typevbls,
        ...type,
    };
};
