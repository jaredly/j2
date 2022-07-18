import * as b from '@babel/types';
import { ToJS, makeToJS } from './to-js.gen';
import { Ctx as ACtx } from '../typing/analyze';

export type Ctx = {
    ToJS: ToJS;
    actx: ACtx;
};

export const jCtx = (actx: ACtx): Ctx => ({ ToJS: makeToJS(), actx });
