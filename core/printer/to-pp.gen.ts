
import { ToPP as apply } from '../elements/apply';
import { ToPP as base } from '../elements/base';
import { ToPP as constants } from '../elements/constants';
import { ToPP as decorators } from '../elements/decorators';
import { ToPP as enumexprs } from '../elements/enum-exprs';
import { ToPP as enums } from '../elements/enums';
import { ToPP as generics } from '../elements/generics';
import { ToPP as records } from '../elements/records';
import { ToPP as typevbls } from '../elements/type-vbls';
import { ToPP as type } from '../elements/type';

export type ToPP = typeof apply & typeof base & typeof constants & typeof decorators & typeof enumexprs & typeof enums & typeof generics & typeof records & typeof typevbls & typeof type;

export const makeToPP = (): ToPP => {
	return {
		...apply,
		...base,
		...constants,
		...decorators,
		...enumexprs,
		...enums,
		...generics,
		...records,
		...typevbls,
		...type
	}
}
