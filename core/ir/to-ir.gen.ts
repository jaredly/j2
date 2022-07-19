
import { ToIR as base } from '../elements/base';
import { ToIR as constants } from '../elements/constants';
import { ToIR as lambda } from '../elements/lambda';
import { ToIR as macros } from '../elements/macros';

export type ToIR = typeof base & typeof constants & typeof lambda & typeof macros;

export const makeToIR = (): ToIR => {
	return {
		...base,
		...constants,
		...lambda,
		...macros
	}
}
