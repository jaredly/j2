
import { ToPP as apply } from '../elements/apply';
import { ToPP as base } from '../elements/base';
import { ToPP as binops } from '../elements/binops';
import { ToPP as constants } from '../elements/constants';
import { ToPP as decorators } from '../elements/decorators';
import { ToPP as enumexprs } from '../elements/enum-exprs';
import { ToPP as enums } from '../elements/enums';
import { ToPP as generics } from '../elements/generics';
import { ToPP as lambda } from '../elements/lambda';
import { ToPP as macros } from '../elements/macros';
import { ToPP as pattern } from '../elements/pattern';
import { ToPP as recordexprs } from '../elements/record-exprs';
import { ToPP as records } from '../elements/records';
import { ToPP as typevbls } from '../elements/type-vbls';
import { ToPP as type } from '../elements/type';

export type ToPP = typeof apply & typeof base & typeof binops & typeof constants & typeof decorators & typeof enumexprs & typeof enums & typeof generics & typeof lambda & typeof macros & typeof pattern & typeof recordexprs & typeof records & typeof typevbls & typeof type;

export const makeToPP = (): ToPP => {
	return {
		...apply,
		...base,
		...binops,
		...constants,
		...decorators,
		...enumexprs,
		...enums,
		...generics,
		...lambda,
		...macros,
		...pattern,
		...recordexprs,
		...records,
		...typevbls,
		...type
	}
}
