import { ToPP as apply } from '../elements/apply/ToPP';
import { ToPP as array } from '../elements/array';
import { ToPP as awaits } from '../elements/awaits';
import { ToPP as base } from '../elements/base';
import { ToPP as binops } from '../elements/binops';
import { ToPP as constants } from '../elements/constants';
import { ToPP as decorators } from '../elements/decorators';
import { ToPP as enumexprs } from '../elements/enum-exprs';
import { ToPP as enums } from '../elements/enums/enums';
import { ToPP as generics } from '../elements/generics/generics';
import { ToPP as ifs } from '../elements/ifs';
import { ToPP as lambda } from '../elements/lambda';
import { ToPP as lets } from '../elements/lets';
import { ToPP as macros } from '../elements/macros';
import { ToPP as pattern } from '../elements/pattern';
import { ToPP as recordexprs } from '../elements/record-exprs';
import { ToPP as records } from '../elements/records/records';
import { ToPP as switchs } from '../elements/switchs';
import { ToPP as typevbls } from '../elements/type-vbls';
import { ToPP as type } from '../elements/type';

export type ToPP = typeof apply &
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

export const makeToPP = (): ToPP => {
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
