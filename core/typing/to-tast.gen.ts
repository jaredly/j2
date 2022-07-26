
import { ToTast as apply } from '../elements/apply';
import { ToTast as base } from '../elements/base';
import { ToTast as binops } from '../elements/binops';
import { ToTast as constants } from '../elements/constants';
import { ToTast as decorators } from '../elements/decorators';
import { ToTast as enumexprs } from '../elements/enum-exprs';
import { ToTast as enums } from '../elements/enums';
import { ToTast as generics } from '../elements/generics';
import { ToTast as ifs } from '../elements/ifs';
import { ToTast as lambda } from '../elements/lambda';
import { ToTast as lets } from '../elements/lets';
import { ToTast as macros } from '../elements/macros';
import { ToTast as pattern } from '../elements/pattern';
import { ToTast as recordexprs } from '../elements/record-exprs';
import { ToTast as records } from '../elements/records';
import { ToTast as switchs } from '../elements/switchs';
import { ToTast as typevbls } from '../elements/type-vbls';
import { ToTast as type } from '../elements/type';

export type ToTast = typeof apply & typeof base & typeof binops & typeof constants & typeof decorators & typeof enumexprs & typeof enums & typeof generics & typeof ifs & typeof lambda & typeof lets & typeof macros & typeof pattern & typeof recordexprs & typeof records & typeof switchs & typeof typevbls & typeof type;

export const makeToTast = (): ToTast => {
	return {
		...apply,
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
		...type
	}
}
