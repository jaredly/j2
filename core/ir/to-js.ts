import * as b from '@babel/types';
import { ToJS, makeToJS } from './to-js.gen';

export type Ctx = {
    ToJS: ToJS;
};

export const jCtx = (): Ctx => ({ ToJS: makeToJS() });
