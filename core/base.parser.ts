// @ts-ignore
import {parse} from './base.parser-untyped.js'

type Location = {
    start: {line: number, column: number},
    end: {line: number, column: number},
    idx: number,
};

export type P_File = {
  type: "File";
  location: Location;
  comments: Array<[Location, string]>;
};

export type Expression_inner = {
  type: "Expression";
  location: Location;
  target: P_Atom;
  parens: P_Parens[];
};

export type P_Expression = Expression_inner | P_Atom;

export type P_Atom = P_Int;

export type P_Parens = {
  type: "Parens";
  location: Location;
  args: P_CommaExpr | null;
};

export type P_CommaExpr = {
  type: "CommaExpr";
  location: Location;
  items: P_Expression[];
};

export type P_Int = {
  type: "Int";
  location: Location;
  contents: string;
};

export type P_Identifier = {
  type: "Identifier";
  location: Location;
  text: string;
  hash: (P_JustSym | P_HashRef) | null;
};

export type P_IdText = {
  type: "IdText";
  location: Location;
};

export type P_JustSym = {
  type: "JustSym";
  location: Location;
};

export type P_HashRef = {
  type: "HashRef";
  location: Location;
};

export type P_HashNum = {
  type: "HashNum";
  location: Location;
};

export type P_BuiltinHash = string;

export type P_newline = string;

export type P__nonnewline = string;

export type P__ = string;

export type P___ = string;

export type P_comment = P_multiLineComment | P_lineComment;

export type P_multiLineComment = string;

export type P_lineComment = string;

export type P_finalLineComment = string;

export const parseTyped = (input: string): File => parse(input)
