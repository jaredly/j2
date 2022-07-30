
import { ToJS as apply } from '../elements/apply';
import { ToJS as base } from '../elements/base';
import { ToJS as constants } from '../elements/constants';
import { ToJS as enums } from '../elements/enums';
import { ToJS as ifs } from '../elements/ifs';
import { ToJS as lambda } from '../elements/lambda';
import { ToJS as lets } from '../elements/lets';
import { ToJS as macros } from '../elements/macros';
import { ToJS as pattern } from '../elements/pattern';
import { ToJS as records } from '../elements/records';
import { ToJS as switchs } from '../elements/switchs';

export type ToJS = typeof apply & typeof base & typeof constants & typeof enums & typeof ifs & typeof lambda & typeof lets & typeof macros & typeof pattern & typeof records & typeof switchs;

export const makeToJS = (): ToJS => {
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
