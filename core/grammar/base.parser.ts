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

export type _lineEnd = string;

export type _EOF = string;

export type Toplevel = Expression;

export type Expression = DecoratedExpression;

export type Atom = Number | Boolean | Identifier | ParenedExpression | TemplateString;

export type ParenedExpression = {
  type: "ParenedExpression";
  loc: Loc;
  expr: Expression;
};

export type Identifier = {
  type: "Identifier";
  loc: Loc;
  text: string;
  hash: (string | string | string | string) | null;
};

// No data on IdText

// No data on NamespacedIdText

// No data on JustSym

// No data on HashRef

// No data on BuiltinHash

// No data on UnresolvedHash

export type Apply_inner = {
  type: "Apply";
  loc: Loc;
  target: Atom;
  suffixes: Suffix[];
};

export type Apply = Apply_inner | Atom;

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

export type newline = string;

export type _nonnewline = string;

export type _ = string;

export type __ = string;

export type comment = multiLineComment | lineComment;

export type multiLineComment = string;

export type lineComment = string;

export type finalLineComment = string;

export type Boolean = {
  type: "Boolean";
  loc: Loc;
  v: "true" | "false";
};

export type Number = {
  type: "Number";
  loc: Loc;
  contents: string;
};

export type String = {
  type: "String";
  loc: Loc;
  text: string;
};

export type TemplateString = {
  type: "TemplateString";
  loc: Loc;
  first: string;
  rest: TemplatePair[];
};

export type TemplatePair = {
  type: "TemplatePair";
  loc: Loc;
  expr: Expression;
  suffix: string;
};

export type tplStringChars = string;

export type stringChar = string;

// No data on escapedChar

export type DecoratedExpression_inner = {
  type: "DecoratedExpression";
  loc: Loc;
  decorators: Decorator[];
  inner: Apply;
};

export type DecoratedExpression = DecoratedExpression_inner | Apply;

export type Decorator = {
  type: "Decorator";
  loc: Loc;
  id: DecoratorId;
  args: DecoratorArgs | null;
};

export type DecoratorId = {
  type: "DecoratorId";
  loc: Loc;
  text: string;
  hash: (string | string) | null;
};

export type DecoratorArgs = {
  type: "DecoratorArgs";
  loc: Loc;
  items: LabeledDecoratorArg[];
};

export type DecoratorArg = DecType | DecExpr;

export type LabeledDecoratorArg = {
  type: "LabeledDecoratorArg";
  loc: Loc;
  label: string | null;
  arg: DecoratorArg;
};

export type DecType = {
  type: "DecType";
  loc: Loc;
  type_: Type;
};

export type DecExpr = {
  type: "DecExpr";
  loc: Loc;
  expr: Expression;
};

export type Type = TRef | Number | String;

export type TRef = {
  type: "TRef";
  loc: Loc;
  text: string;
  hash: (string | string | string | string) | null;
};

export type AllTaggedTypes = File | ParenedExpression | Identifier | Apply_inner | Parens | CommaExpr | Boolean | Number | String | TemplateString | TemplatePair | DecoratedExpression_inner | Decorator | DecoratorId | DecoratorArgs | LabeledDecoratorArg | DecType | DecExpr | TRef;

export const parseTyped = (input: string): File => parse(input)
