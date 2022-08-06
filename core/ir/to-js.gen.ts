import { ToJS as apply } from '../elements/apply/ToJS';
import { ToJS as array } from '../elements/array';
import { ToJS as base } from '../elements/base';
import { ToJS as constants } from '../elements/constants';
import { ToJS as enums } from '../elements/enums/enums';
import { ToJS as generics } from '../elements/generics/generics';
import { ToJS as ifs } from '../elements/ifs';
import { ToJS as lambda } from '../elements/lambda';
import { ToJS as lets } from '../elements/lets';
import { ToJS as macros } from '../elements/macros';
import { ToJS as pattern } from '../elements/pattern';
import { ToJS as records } from '../elements/records/records';
import { ToJS as switchs } from '../elements/switchs';

export type ToJS = typeof apply &
    typeof array &
    typeof base &
    typeof constants &
    typeof enums &
    typeof generics &
    typeof ifs &
    typeof lambda &
    typeof lets &
    typeof macros &
    typeof pattern &
    typeof records &
    typeof switchs;

export const makeToJS = (): ToJS => {
    return {
        ...apply,
        ...array,
        ...base,
        ...constants,
        ...enums,
        ...generics,
        ...ifs,
        ...lambda,
        ...lets,
        ...macros,
        ...pattern,
        ...records,
        ...switchs,
    };
};
