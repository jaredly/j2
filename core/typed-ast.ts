import { RefKind } from '.';
import { Loc } from './grammar/base.parser';
export { RefKind };

export type File = {
    type: 'File';
    toplevels: Array<Toplevel>;
    comments: Array<[Loc, string]>;
    loc: Loc;
};

// export type ErrorExpr = UnknownIdentifier;

export type Decorator = {
    type: 'Decorator';
    id: { ref: RefKind | UnresolvedRef; loc: Loc };
    args: Array<{ label: string | null; arg: DecoratorArg; loc: Loc }>;
    loc: Loc;
};
export type DecoratorArg =
    | {
          type: 'Expr';
          expr: Expression;
          loc: Loc;
      }
    | {
          type: 'Type';
          typ: Type;
          loc: Loc;
      };

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

export type Expression = Apply | Number | Boolean | Ref | DecoratedExpression;

// Might be an int or float
// export type Number = {type: 'Number', loc: Location, value: number};

export type DecoratedExpression = {
    type: 'DecoratedExpression';
    decorators: Array<Decorator>;
    expr: Expression;
    loc: Loc;
};

export type Boolean = { type: 'Boolean'; loc: Loc; value: boolean };

export type Number = {
    type: 'Number';
    loc: Loc;
    value: number;
    kind: 'Int' | 'Float' | null;
};

export type Apply = {
    type: 'Apply';
    target: Expression;
    args: Array<Expression>;
    loc: Loc;
};

export type Sym = { id: number; name: string };

export type TRef = { type: 'TRef'; ref: RefKind | UnresolvedRef; loc: Loc };

export type TDecorated = {
    type: 'TDecorated';
    decorators: Array<Decorator>;
    loc: Loc;
};

export type TApply = {
    type: 'TApply';
    target: Type;
    args: Array<Type>;
    loc: Loc;
};

export type TVar = {
    type: 'TVar';
    sym: Sym;
    inner: Type;
    loc: Loc;
};

export type TLambda = {
    type: 'TLambda';
    args: Array<Type>;
    result: Type;
    loc: Loc;
};

export type Type = TRef | TDecorated | TApply | TVar | TLambda;

// export type
/*
Do I want separate [global] vs [local] ref?
Would they have different attributes?
ok so I don't think I'll reify the type on it.
but
so how do we make it ~easy to look up the type
of the 
*/
