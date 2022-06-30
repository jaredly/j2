
import { ToTast as apply } from '../elements/apply';
import { ToTast as base } from '../elements/base';
import { ToTast as constants } from '../elements/constants';
import { ToTast as decorators } from '../elements/decorators';
import { ToTast as generics } from '../elements/generics';
import { ToTast as typevbls } from '../elements/type-vbls';
import { ToTast as type } from '../elements/type';

export type ToTast = typeof apply & typeof base & typeof constants & typeof decorators & typeof generics & typeof typevbls & typeof type;

export const makeToTast = (): ToTast => {
	return {
		...apply,
		...base,
		...constants,
		...decorators,
		...generics,
		...typevbls,
		...type
	}
}
