
import { ToIR as apply } from '../elements/apply';
import { ToIR as base } from '../elements/base';
import { ToIR as constants } from '../elements/constants';
import { ToIR as enums } from '../elements/enums';
import { ToIR as lambda } from '../elements/lambda';
import { ToIR as macros } from '../elements/macros';
import { ToIR as pattern } from '../elements/pattern';
import { ToIR as records } from '../elements/records';

export type ToIR = typeof apply & typeof base & typeof constants & typeof enums & typeof lambda & typeof macros & typeof pattern & typeof records;

export const makeToIR = (): ToIR => {
	return {
		...apply,
		...base,
		...constants,
		...enums,
		...lambda,
		...macros,
		...pattern,
		...records
	}
}
