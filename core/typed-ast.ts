import { Apply, IApply } from './elements/apply';
import {
    Boolean,
    ITemplateString,
    Number,
    TemplateString,
} from './elements/constants';
import { DecoratedExpression } from './elements/decorators';
import { Enum, IEnum } from './elements/enum-exprs';
import { TypeApplication } from './elements/generics';
import { Type } from './elements/type';
import { Id, idToString } from './ids';
import { IRecord, Record } from './elements/record-exprs';
import { Lambda } from './elements/lambda';
export type { Id };
export type { Apply, IApply } from './elements/apply';
export type {
    Boolean,
    ITemplateString,
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
export type { TypeApplication, TypeVariables } from './elements/generics';
export type { TApply, TVar, TVars } from './elements/type-vbls';
export type {
    TAdd,
    TDecorated,
    TLambda,
    TOps,
    TOr,
    TRef,
    TSub,
    Type,
} from './elements/type';
export type { EnumCase, TEnum } from './elements/enums';
export type { Enum, IEnum } from './elements/enum-exprs';
export type { TRecord, TRecordKeyValue } from './elements/records';
export type {
    IRecord,
    IRecordKeyValue,
    Record,
    RecordKeyValue,
} from './elements/record-exprs';
export type { PName, PTuple, Pattern } from './elements/pattern';
export type { LArg, Lambda } from './elements/lambda';

export type GlobalRef = {
    type: 'Global';
    id: Id;
};
export type RefKind =
    | GlobalRef
    | {
          type: 'Local';
          sym: number;
      }
    | { type: 'Recur'; idx: number };

export const refHash = (ref: RefKind | UnresolvedRef) =>
    ref.type === 'Global'
        ? 'h' + idToString(ref.id)
        : ref.type === 'Recur'
        ? 'r' + ref.idx
        : ref.type === 'Unresolved'
        ? ':unresolved:' + ref.text + '#' + ref.hash
        : '' + ref.sym;

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

export type TypeToplevel = Type | TypeAlias;

export type TypeFile = {
    type: 'TypeFile';
    toplevels: Array<TypeToplevel>;
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
    | Enum
    | Lambda
    | Record
    | Number
    | Boolean
    | TemplateString
    | TypeApplication
    | DecoratedExpression;

export type IExpression =
    | Ref
    | Number
    | Boolean
    | IApply
    | ITemplateString
    | IEnum
    | IRecord;

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
