// @ts-ignore
import {parse} from './base.parser-untyped.js'

export type Location = {
    start: {line: number, column: number},
    end: {line: number, column: number},
    idx: number,
};

export type File = {
  type: "File";
  loc: Location;
  comments: Array<[Location, string]>;
  toplevels: Toplevel[];
};

export type Toplevel = Expression;

export type Expression = Apply;

export type Apply_inner = {
  type: "Apply";
  loc: Location;
  target: Atom;
  suffixes: Suffix[];
};

export type Apply = Apply_inner | Atom;

export type Atom = Int | Identifier | Lambda;

export type Lambda = {
  type: "Lambda";
  loc: Location;
  params: Params | null;
  body: Expression;
};

export type Params = {
  type: "Params";
  loc: Location;
  items: Param[];
};

export type Param = Pattern;

export type Pattern = Identifier;

export type Suffix = Parens | TypeApplication;

export type Parens = {
  type: "Parens";
  loc: Location;
  args: CommaExpr | null;
};

export type TypeApplication = {
  type: "TypeApplication";
  loc: Location;
  args: CommaType | null;
};

export type CommaType = {
  type: "CommaType";
  loc: Location;
  items: Type[];
};

export type Type = {
  type: "Type";
  loc: Location;
  id: Identifier;
  args: TypeApplication | null;
};

export type CommaExpr = {
  type: "CommaExpr";
  loc: Location;
  items: Expression[];
};

export type Int = {
  type: "Int";
  loc: Location;
  contents: string;
};

export type Identifier = {
  type: "Identifier";
  loc: Location;
  text: string;
  hash: (string | string) | null;
};

// No data on IdText

// No data on JustSym

// No data on HashRef

// No data on HashNum

export type BuiltinHash = string;

export type newline = string;

export type _nonnewline = string;

export type _ = string;

export type __ = string;

export type comment = multiLineComment | lineComment;

export type multiLineComment = string;

export type lineComment = string;

export type finalLineComment = string;

export type AllTaggedTypes = File | Apply_inner | Lambda | Params | Parens | TypeApplication | CommaType | Type | CommaExpr | Int | Identifier;

export const parseTyped = (input: string): File => parse(input)
