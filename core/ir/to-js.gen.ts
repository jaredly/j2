
import { ToJS as apply } from '../elements/apply';
import { ToJS as base } from '../elements/base';
import { ToJS as constants } from '../elements/constants';
import { ToJS as enums } from '../elements/enums';
import { ToJS as macros } from '../elements/macros';
import { ToJS as records } from '../elements/records';

export type ToJS = typeof apply & typeof base & typeof constants & typeof enums & typeof macros & typeof records;

export const makeToJS = (): ToJS => {
	return {
		...apply,
		...base,
		...constants,
		...enums,
		...macros,
		...records
	}
}
