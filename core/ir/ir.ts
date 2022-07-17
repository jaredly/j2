import * as t from '../typed-ast';
import { makeToIR, ToIR } from './to-ir.gen';
export type { ToIR };

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
};

export const iCtx = (): Ctx => ({ ToIR: makeToIR() });
