
import { ToAst as apply } from '../elements/apply';
import { ToAst as base } from '../elements/base';
import { ToAst as constants } from '../elements/constants';
import { ToAst as decorators } from '../elements/decorators';
import { ToAst as enums } from '../elements/enums';
import { ToAst as generics } from '../elements/generics';
import { ToAst as typevbls } from '../elements/type-vbls';
import { ToAst as type } from '../elements/type';

export type ToAst = typeof apply & typeof base & typeof constants & typeof decorators & typeof enums & typeof generics & typeof typevbls & typeof type;

export const makeToAst = (): ToAst => {
	return {
		...apply,
		...base,
		...constants,
		...decorators,
		...enums,
		...generics,
		...typevbls,
		...type
	}
}
