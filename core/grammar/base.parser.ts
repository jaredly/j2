import {parse} from './base.parser-untyped'

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

export type Suffix = CallSuffix | TypeApplicationSuffix;

export type CallSuffix = {
  type: "CallSuffix";
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
  wrap: TemplateWrap;
  suffix: string;
};

export type TemplateWrap = {
  type: "TemplateWrap";
  loc: Loc;
  expr: Expression;
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

export type TypeApplicationSuffix = {
  type: "TypeApplicationSuffix";
  loc: Loc;
  vbls: TypeAppVbls;
};

export type TypeAppVbls = {
  type: "TypeAppVbls";
  loc: Loc;
  items: Type[];
};

export type TypeVariables = {
  type: "TypeVariables";
  loc: Loc;
  vbls: TypeVbls;
  body: Expression;
};

export type TypeVbls = {
  type: "TypeVbls";
  loc: Loc;
  items: TypeVbl[];
};

export type TypeVbl = {
  type: "TypeVbl";
  loc: Loc;
  vbl: Identifier;
  bound: Type | null;
};

export type Type = TRef | Number | String | TLambda | TVars;

export type TRef = {
  type: "TRef";
  loc: Loc;
  text: string;
  hash: (string | string | string | string) | null;
};

export type TVars = {
  type: "TVars";
  loc: Loc;
  args: TBargs;
  inner: Type;
};

export type TBargs = {
  type: "TBargs";
  loc: Loc;
  items: TBArg[];
};

export type TBArg = {
  type: "TBArg";
  loc: Loc;
  label: string;
  hash: string;
  bound: Type | null;
};

export type TArg = {
  type: "TArg";
  loc: Loc;
  label: string | null;
  typ: Type;
};

export type TArgs = {
  type: "TArgs";
  loc: Loc;
  items: TArg[];
};

export type TLambda = {
  type: "TLambda";
  loc: Loc;
  args: TArgs | null;
  result: Type;
};

export type AllTaggedTypes = File | ParenedExpression | Identifier | Apply_inner | CallSuffix | CommaExpr | Boolean | Number | String | TemplateString | TemplatePair | TemplateWrap | DecoratedExpression_inner | Decorator | DecoratorId | DecoratorArgs | LabeledDecoratorArg | DecType | DecExpr | TypeApplicationSuffix | TypeAppVbls | TypeVariables | TypeVbls | TypeVbl | TRef | TVars | TBargs | TBArg | TArg | TArgs | TLambda;

export const AllTaggedTypeNames: AllTaggedTypes["type"][] = ["File", "ParenedExpression", "Identifier", "Apply", "CallSuffix", "CommaExpr", "Boolean", "Number", "String", "TemplateString", "TemplatePair", "TemplateWrap", "DecoratedExpression", "Decorator", "DecoratorId", "DecoratorArgs", "LabeledDecoratorArg", "DecType", "DecExpr", "TypeApplicationSuffix", "TypeAppVbls", "TypeVariables", "TypeVbls", "TypeVbl", "TRef", "TVars", "TBargs", "TBArg", "TArg", "TArgs", "TLambda"];

// @ts-ignore
export const parseFile = (input: string): File => parse(input, {startRule: 'File'});
// @ts-ignore
export const parseType = (input: string): Type => parse(input, {startRule: 'Type'});
