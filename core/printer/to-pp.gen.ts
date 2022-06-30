
import { ToPP as apply } from '../elements/apply';
import { ToPP as base } from '../elements/base';
import { ToPP as constants } from '../elements/constants';
import { ToPP as decorators } from '../elements/decorators';
import { ToPP as enums } from '../elements/enums';
import { ToPP as generics } from '../elements/generics';
import { ToPP as typevbls } from '../elements/type-vbls';
import { ToPP as type } from '../elements/type';

export type ToPP = typeof apply & typeof base & typeof constants & typeof decorators & typeof enums & typeof generics & typeof typevbls & typeof type;

export const makeToPP = (): ToPP => {
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
