import { PartialIdentifier, Ref } from '.';
import { Location } from './base.parser';

export type File = {
    type: 'File';
    toplevels: Array<Toplevel>;
    loc: Location;
};

export type ErrorExpr = UnknownIdentifier;

export type UnknownIdentifier = {
    type: 'UnknownIdentifier';
    loc: Location;
    text: string;
    hash: null | string;
};

export type Identifier = PartialIdentifier & { loc: Location };

export type UnresolvedIdentifier = {
    type: 'UnresolvedIdentifier';
    loc: Location;
    text: string;
    hash: null | string;
};

export type Toplevel = {
    type: 'ToplevelExpression';
    expr: Expression;
    loc: Location;
};

export type Expression = Apply | Int | Identifier | UnresolvedIdentifier;
// | AmbiguousIdentifier
// | UnknownIdentifier;

export type Int = {
    type: 'Int';
    loc: Location;
    value: number;
};

export type Apply = {
    type: 'Apply';
    loc: Location;
    target: Expression;
    args: Array<Expression>;
};

export type Sym = { id: number; name: string };

export type Type =
    | {
          type: 'Ref';
          ref: Ref;
          loc: Location;
      }
    | { type: 'ApplyType'; target: Type; args: Array<Type>; loc: Location }
    | {
          type: 'TypeVar';
          sym: Sym;
          inner: Type;
          loc: Location;
      }
    | {
          type: 'Lambda';
          args: Array<Type>;
          result: Type;
          loc: Location;
      };

// export type
/*
Do I want separate [global] vs [local] ref?
Would they have different attributes?
ok so I don't think I'll reify the type on it.
but
so how do we make it ~easy to look up the type
of the 
*/
