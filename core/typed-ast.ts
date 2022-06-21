import { RefKind } from '.';
export { RefKind } from '.';
import { Apply } from './elements/apply';
export { Apply } from './elements/apply';
import { TemplateString, Number, Boolean, String } from './elements/constants';
export { TemplateString, Number, Boolean, String } from './elements/constants';
import { DecoratedExpression } from './elements/decorators';
export {
    DecoratedExpression,
    Decorator,
    DecoratorArg,
    TDecorated,
} from './elements/decorators';
export { Id } from './ids';
export { Type, TRef, TApply, TVars } from './elements/type';

export type Loc = {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
    idx: number;
};

export type File = {
    type: 'File';
    toplevels: Array<Toplevel>;
    comments: Array<[Loc, string]>;
    loc: Loc;
};

// export type ErrorExpr = UnknownIdentifier;

export type UnresolvedRef = {
    type: 'Unresolved';
    text: string;
    hash: null | string;
};

export type Ref = {
    type: 'Ref';
    loc: Loc;
    kind: RefKind | UnresolvedRef;
};

export type Toplevel = {
    type: 'ToplevelExpression';
    expr: Expression;
    loc: Loc;
};

export type Expression =
    | Apply
    | Number
    | Boolean
    | TemplateString
    | Ref
    | DecoratedExpression;

// Might be an int or float
// export type Number = {type: 'Number', loc: Location, value: number};

export type Sym = { id: number; name: string };

// export type
/*
Do I want separate [global] vs [local] ref?
Would they have different attributes?
ok so I don't think I'll reify the type on it.
but
so how do we make it ~easy to look up the type
of the 
*/
