// @ts-ignore
import {parse} from './base.parser-untyped.js'

export type Loc = {
    start: {line: number, column: number, offset: number},
    end: {line: number, column: number, offset: number},
    idx: number,
};

export type File = {
  type: "File";
  loc: Loc;
  comments: Array<[Loc, string]>;
  toplevels: Toplevel[];
};

export type Toplevel = Expression;

export type Expression = Apply;

export type Apply_inner = {
  type: "Apply";
  loc: Loc;
  target: Atom;
  suffixes: Suffix[];
};

export type Apply = Apply_inner | Atom;

export type Atom = Int | Identifier;

export type Suffix = Parens;

export type Parens = {
  type: "Parens";
  loc: Loc;
  args: CommaExpr | null;
};

export type CommaExpr = {
  type: "CommaExpr";
  loc: Loc;
  items: Expression[];
};

export type Int = {
  type: "Int";
  loc: Loc;
  contents: string;
};

export type Identifier = {
  type: "Identifier";
  loc: Loc;
  text: string;
  hash: (string | string | string) | null;
};

// No data on IdText

// No data on JustSym

// No data on HashRef

// No data on BuiltinHash

export type newline = string;

export type _nonnewline = string;

export type _ = string;

export type __ = string;

export type comment = multiLineComment | lineComment;

export type multiLineComment = string;

export type lineComment = string;

export type finalLineComment = string;

export type AllTaggedTypes = File | Apply_inner | Parens | CommaExpr | Int | Identifier;

export const parseTyped = (input: string): File => parse(input)
