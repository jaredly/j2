import { RefKind } from '.';
export { RefKind };
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

export type Apply = {
    type: 'Apply';
    target: Expression;
    args: Array<Expression>;
    loc: Loc;
};

export type Sym = { id: number; name: string };

export type TRef = { type: 'TRef'; ref: RefKind | UnresolvedRef; loc: Loc };

// Something<T>
export type TApply = {
    type: 'TApply';
    target: Type;
    args: Array<Type>;
    loc: Loc;
};

// OK also how do I do ... type bounds
// yeah that would be here.
// <T, I, K>Something
export type TVars = {
    type: 'TVars';
    args: Array<Sym>;
    inner: Type;
    loc: Loc;
};

// (arg: int, arg2: float) => string
// NOTE that type arguments, and effect arguments,
// will have already been applied if you get to this point.
// TApply(TVars(TLambda)) => TLambda ... right?
// or is it ... an expression that applies the tvars and stuff. I think?
// Yeah, if you have
// const x = <T>(m) => n;
// x<T>(1)
// (ApplyType(x, T)) and the getType of the ApplyType will be the lambda.
export type TLambda = {
    type: 'TLambda';
    args: Array<{ label: string; typ: Type }>;
    result: Type;
    loc: Loc;
};

// Ok so also, you can just drop an inline record declaration, right?

export type Type = TRef | TLambda | TExpr;
// | TDecorated | TApply | TVars

// Should I only allow local refs?
// hmm no.
// oh I can subtract numbers too rite
export type TExpr = Number | String; // TAdd | TSub | TOr | ;

export type TAdd = { type: 'TAdd'; elements: Array<Type>; loc: Loc };
export type TSub = { type: 'TSub'; elements: Array<Type>; loc: Loc };
export type TOr = { type: 'TOr'; elements: Array<Type>; loc: Loc };

/// and ... something about instantiating a record? Although that might get into
// the realm of "where"s. Yeah I think it would.

// (T -> T) -> T // hm that would be Kinds yep.

// export type
/*
Do I want separate [global] vs [local] ref?
Would they have different attributes?
ok so I don't think I'll reify the type on it.
but
so how do we make it ~easy to look up the type
of the 
*/
