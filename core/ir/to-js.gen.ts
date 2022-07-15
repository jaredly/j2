
import { ToJS as base } from '../elements/base';
import { ToJS as constants } from '../elements/constants';

export type ToJS = typeof base & typeof constants;

export const makeToJS = (): ToJS => {
	return {
		...base,
		...constants
	}
}
