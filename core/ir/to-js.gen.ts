
import { ToJS as base } from '../elements/base';
import { ToJS as constants } from '../elements/constants';
import { ToJS as records } from '../elements/records';

export type ToJS = typeof base & typeof constants & typeof records;

export const makeToJS = (): ToJS => {
	return {
		...base,
		...constants,
		...records
	}
}
