import { RefKind } from '.';
import { Loc } from './grammar/base.parser';
export { RefKind };

export type File = {
    type: 'File';
    toplevels: Array<Toplevel>;
    comments: Array<[Loc, string]>;
    loc: Loc;
};

export type ErrorExpr = UnknownIdentifier;

export type UnknownIdentifier = {
    type: 'UnknownIdentifier';
    loc: Loc;
    text: string;
    hash: null | string;
};

export type Ref = {
    type: 'Ref';
    loc: Loc;
    // might be "awaiting resolution" or "unable to resolve"
    kind: RefKind | { type: 'Unresolved'; text: string; hash: null | string };
};

export type Toplevel = {
    type: 'ToplevelExpression';
    expr: Expression;
    loc: Loc;
};

export type Expression = Apply | Number | Boolean | Ref;

// Might be an int or float
// export type Number = {type: 'Number', loc: Location, value: number};

export type Boolean = {
    type: 'Boolean';
    loc: Loc;
    value: boolean;
};

export type Number = {
    type: 'Number';
    loc: Loc;
    value: number;
    kind: 'Int' | 'Float' | null;
};

export type Apply = {
    type: 'Apply';
    loc: Loc;
    target: Expression;
    args: Array<Expression>;
};

export type Sym = { id: number; name: string };

export type Type =
    | {
          type: 'TRef';
          ref: RefKind;
          loc: Loc;
      }
    | {
          type: 'TApply';
          target: Type;
          args: Array<Type>;
          loc: Loc;
      }
    | {
          type: 'TVar';
          sym: Sym;
          inner: Type;
          loc: Loc;
      }
    | {
          type: 'TLambda';
          args: Array<Type>;
          result: Type;
          loc: Loc;
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
