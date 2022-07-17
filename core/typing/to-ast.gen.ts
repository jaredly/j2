
import { ToAst as apply } from '../elements/apply';
import { ToAst as base } from '../elements/base';
import { ToAst as binops } from '../elements/binops';
import { ToAst as constants } from '../elements/constants';
import { ToAst as decorators } from '../elements/decorators';
import { ToAst as enumexprs } from '../elements/enum-exprs';
import { ToAst as enums } from '../elements/enums';
import { ToAst as generics } from '../elements/generics';
import { ToAst as macros } from '../elements/macros';
import { ToAst as recordexprs } from '../elements/record-exprs';
import { ToAst as records } from '../elements/records';
import { ToAst as typevbls } from '../elements/type-vbls';
import { ToAst as type } from '../elements/type';

export type ToAst = typeof apply & typeof base & typeof binops & typeof constants & typeof decorators & typeof enumexprs & typeof enums & typeof generics & typeof macros & typeof recordexprs & typeof records & typeof typevbls & typeof type;

export const makeToAst = (): ToAst => {
	return {
		...apply,
		...base,
		...binops,
		...constants,
		...decorators,
		...enumexprs,
		...enums,
		...generics,
		...macros,
		...recordexprs,
		...records,
		...typevbls,
		...type
	}
}
