import { ToAst as apply } from '../elements/apply/ToAst';
import { ToAst as array } from '../elements/array';
import { ToAst as awaits } from '../elements/awaits';
import { ToAst as base } from '../elements/base';
import { ToAst as binops } from '../elements/binops';
import { ToAst as constants } from '../elements/constants';
import { ToAst as decorators } from '../elements/decorators';
import { ToAst as enumexprs } from '../elements/enum-exprs';
import { ToAst as enums } from '../elements/enums/enums';
import { ToAst as generics } from '../elements/generics/generics';
import { ToAst as ifs } from '../elements/ifs';
import { ToAst as lambda } from '../elements/lambda';
import { ToAst as lets } from '../elements/lets';
import { ToAst as macros } from '../elements/macros';
import { ToAst as pattern } from '../elements/pattern';
import { ToAst as recordexprs } from '../elements/record-exprs';
import { ToAst as records } from '../elements/records/records';
import { ToAst as switchs } from '../elements/switchs';
import { ToAst as typevbls } from '../elements/type-vbls';
import { ToAst as type } from '../elements/type';

export type ToAst = typeof apply &
    typeof array &
    typeof awaits &
    typeof base &
    typeof binops &
    typeof constants &
    typeof decorators &
    typeof enumexprs &
    typeof enums &
    typeof generics &
    typeof ifs &
    typeof lambda &
    typeof lets &
    typeof macros &
    typeof pattern &
    typeof recordexprs &
    typeof records &
    typeof switchs &
    typeof typevbls &
    typeof type;

export const makeToAst = (): ToAst => {
    return {
        ...apply,
        ...array,
        ...awaits,
        ...base,
        ...binops,
        ...constants,
        ...decorators,
        ...enumexprs,
        ...enums,
        ...generics,
        ...ifs,
        ...lambda,
        ...lets,
        ...macros,
        ...pattern,
        ...recordexprs,
        ...records,
        ...switchs,
        ...typevbls,
        ...type,
    };
};
