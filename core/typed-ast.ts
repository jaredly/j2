import { Apply } from './elements/apply';
import { Boolean, Number, TemplateString } from './elements/constants';
import { DecoratedExpression } from './elements/decorators';
import { TypeApplication } from './elements/generics';
import { Type } from './elements/type';
import { Id, idToString } from './ids';
export type { Apply } from './elements/apply';
export type {
    Boolean,
    Number,
    String,
    TemplateString,
} from './elements/constants';
export type {
    DExpr,
    DType,
    DecoratedExpression,
    Decorator,
    DecoratorArg,
    DecoratorDecl,
} from './elements/decorators';
export type {
    TAdd,
    TApply,
    TDecorated,
    TLambda,
    TOps,
    TOr,
    TRef,
    TSub,
    TVar,
    TVars,
    Type,
} from './elements/type';
export type { Id } from './ids';
export type { TypeApplication, TypeVariables } from './elements/generics';

export type GlobalRef = {
    type: 'Global';
    id: Id;
};
export type RefKind =
    | GlobalRef
    | {
          type: 'Local';
          sym: number;
      };

export const refHash = (ref: RefKind) =>
    ref.type === 'Global' ? 'h' + idToString(ref.id) : '' + ref.sym;

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

export type ToplevelExpression = {
    type: 'ToplevelExpression';
    expr: Expression;
    loc: Loc;
};
export type Toplevel = ToplevelExpression | TypeAlias;
export type TypeAlias = {
    type: 'TypeAlias';
    elements: Array<{ name: string; type: Type }>;
    loc: Loc;
};

export type Expression =
    | Ref
    | Apply
    | Number
    | Boolean
    | TemplateString
    | TypeApplication
    | DecoratedExpression;

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
