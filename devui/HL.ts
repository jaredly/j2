import { Loc } from '../core/typed-ast';
import { Colorable } from './Highlight';

export type HL = {
    loc: Loc;
    type: Colorable;
    prefix?: { text: string; message?: string };
    suffix?: { text: string; message?: string };
    message?: string;
    underline?: string;
};
