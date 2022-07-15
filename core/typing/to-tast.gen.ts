
import { ToTast as apply } from '../elements/apply';
import { ToTast as base } from '../elements/base';
import { ToTast as constants } from '../elements/constants';
import { ToTast as decorators } from '../elements/decorators';
import { ToTast as enumexprs } from '../elements/enum-exprs';
import { ToTast as enums } from '../elements/enums';
import { ToTast as generics } from '../elements/generics';
import { ToTast as macros } from '../elements/macros';
import { ToTast as recordexprs } from '../elements/record-exprs';
import { ToTast as records } from '../elements/records';
import { ToTast as typevbls } from '../elements/type-vbls';
import { ToTast as type } from '../elements/type';

export type ToTast = typeof apply & typeof base & typeof constants & typeof decorators & typeof enumexprs & typeof enums & typeof generics & typeof macros & typeof recordexprs & typeof records & typeof typevbls & typeof type;

export const makeToTast = (): ToTast => {
	return {
		...apply,
		...base,
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
