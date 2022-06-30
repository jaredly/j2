
import { ToAst as apply } from '../elements/apply';
import { ToAst as base } from '../elements/base';
import { ToAst as constants } from '../elements/constants';
import { ToAst as decorators } from '../elements/decorators';
import { ToAst as generics } from '../elements/generics';
import { ToAst as type } from '../elements/type';

export type ToAst = typeof apply & typeof base & typeof constants & typeof decorators & typeof generics & typeof type;

export const makeToAst = (): ToAst => {
	return {
		...apply,
		...base,
		...constants,
		...decorators,
		...generics,
		...type
	}
}
