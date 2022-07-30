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
import { ILambda, Lambda } from './elements/lambda';
import { Await } from './elements/awaits';
import { Block } from './elements/lets';
export type { Id };
export type { Apply, IApply } from './elements/apply';
export type { Ctx as ACtx } from './typing/analyze';
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
    TBlank,
    TDecorated,
    TLambda,
    TOps,
    TOr,
    TRef,
    TSub,
    TVbl,
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
export type { ILambda, LArg, Lambda } from './elements/lambda';
export type {
    Locals,
    PBlank,
    PDecorated,
    PEnum,
    PName,
    PRecord,
    Pattern,
} from './elements/pattern';
export type {
    Block,
    IAssign,
    IBlock,
    ILet,
    IReturn,
    IStmt,
    Let,
    Stmt,
} from './elements/lets';
import { If } from './elements/ifs';
import { Switch } from './elements/switchs';
export type { IIf, IIfYes, If, IfCond, IfYes } from './elements/ifs';
export type { AVCtx, Case, ICase, ISwitch, Switch } from './elements/switchs';
export type { Await } from './elements/awaits';

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

export type TypeToplevel = Type | TypeAlias | ToplevelAliases;

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
export type ToplevelLet = {
    type: 'ToplevelLet';
    hash?: string;
    elements: Array<{
        name: string;
        typ: Type | null;
        expr: Expression;
        loc: Loc;
    }>;
    loc: Loc;
};
export type Toplevel =
    | ToplevelExpression
    | TypeAlias
    | ToplevelLet
    | ToplevelAliases;
export type ToplevelAliases = {
    type: 'ToplevelAliases';
    aliases: Array<{
        name: string;
        hash: string;
        loc: Loc;
    }>;
    loc: Loc;
};

export type TypeAlias = {
    type: 'TypeAlias';
    hash?: string;
    elements: Array<{ name: string; type: Type }>;
    loc: Loc;
};

export type Expression =
    | If
    | Ref
    | Enum
    | Block
    | Apply
    | Lambda
    | Record
    | Number
    | Switch
    | Boolean
    | Await
    | TemplateString
    | TypeApplication
    | DecoratedExpression;

export type IExpression =
    | Ref
    | Number
    | ILambda
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
