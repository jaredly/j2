
import { Analyze as apply } from '../elements/apply';
import { Analyze as constants } from '../elements/constants';
import { Analyze as enumexprs } from '../elements/enum-exprs';
import { Analyze as enums } from '../elements/enums';
import { Analyze as generics } from '../elements/generics';
import { Analyze as type } from '../elements/type';
import {Ctx} from './analyze';
import {Visitor} from '../transform-tast';

export const analyzeVisitor = (): Visitor<{ctx: Ctx, hit: {}}> => {
	return {
		...apply,
		...constants,
		...enumexprs,
		...enums,
		...generics,
		...type
	}
}
