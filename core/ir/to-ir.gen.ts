
import { ToIR as base } from '../elements/base';
import { ToIR as constants } from '../elements/constants';

export type ToIR = typeof base & typeof constants;

export const makeToIR = (): ToIR => {
	return {
		...base,
		...constants
	}
}
