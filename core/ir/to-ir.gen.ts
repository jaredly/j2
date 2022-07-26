
import { ToIR as apply } from '../elements/apply';
import { ToIR as base } from '../elements/base';
import { ToIR as constants } from '../elements/constants';
import { ToIR as enums } from '../elements/enums';
import { ToIR as ifs } from '../elements/ifs';
import { ToIR as lambda } from '../elements/lambda';
import { ToIR as lets } from '../elements/lets';
import { ToIR as macros } from '../elements/macros';
import { ToIR as pattern } from '../elements/pattern';
import { ToIR as records } from '../elements/records';
import { ToIR as switchs } from '../elements/switchs';

export type ToIR = typeof apply & typeof base & typeof constants & typeof enums & typeof ifs & typeof lambda & typeof lets & typeof macros & typeof pattern & typeof records & typeof switchs;

export const makeToIR = (): ToIR => {
	return {
		...apply,
		...base,
		...constants,
		...enums,
		...ifs,
		...lambda,
		...lets,
		...macros,
		...pattern,
		...records,
		...switchs
	}
}
