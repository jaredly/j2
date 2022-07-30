import * as t from '../typed-ast';
import { makeToIR, ToIR } from './to-ir.gen';
export type { ToIR };
import { Ctx as ACtx } from '../typing/analyze';

/*

Expression
Apply / Number / TemplateString / Ref / Record / Enum / Boolean

Statement
Return / If / Switch / Expression
AttributeAccess?
EnumPayloadAccess? (.payload)

let and such ... block

*/

export type Ctx = {
    ToIR: ToIR;
    actx: ACtx;
};

export const iCtx = (actx: ACtx): Ctx => ({ ToIR: makeToIR(), actx });
