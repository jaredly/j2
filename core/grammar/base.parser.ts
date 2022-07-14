import {parse} from './base.parser-untyped'

export type SyntaxError = {
    location: Loc;
};

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

export type TypeFile = {
  type: "TypeFile";
  loc: Loc;
  comments: Array<[Loc, string]>;
  toplevels: TypeToplevel[];
};

// No data on NamespacedIdText

// No data on JustSym

// No data on RecurHash

// No data on HashRef

// No data on ShortRef

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

export type _lineEnd = string;

export type _EOF = string;

export type Toplevel = TypeAlias | Expression;

export type TypeToplevel = TypeAlias | Type;

export type Expression = DecoratedExpression;

export type Identifier = {
  type: "Identifier";
  loc: Loc;
  text: string;
  hash: (string | string | string | string | string | string) | null;
};

export type Atom = Number | Boolean | Identifier | ParenedExpression | TemplateString | Enum;

export type ParenedExpression = {
  type: "ParenedExpression";
  loc: Loc;
  expr: Expression;
};

// No data on IdText

export type AttrText = string;

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

export type Enum = {
  type: "Enum";
  loc: Loc;
  text: string;
  payload: (Expression | null) | null;
};

export type TEnum = {
  type: "TEnum";
  loc: Loc;
  cases: EnumCases | null;
};

export type EnumCases = {
  type: "EnumCases";
  loc: Loc;
  items: EnumCase[];
};

export type EnumCase = TagDecl | Type | Star;

export type TagDecl = {
  type: "TagDecl";
  loc: Loc;
  decorators: Decorator[];
  text: string;
  payload: TagPayload | null;
};

export type TagPayload = {
  type: "TagPayload";
  loc: Loc;
  inner: Type;
};

export type Star = {
  type: "Star";
  loc: Loc;
  pseudo: string;
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

export type TRecord = {
  type: "TRecord";
  loc: Loc;
  items: TRecordItems | null;
};

export type TRecordItems = {
  type: "TRecordItems";
  loc: Loc;
  items: TRecordItem[];
};

export type TRecordItem = TRecordSpread | TRecordKeyValue | Star;

export type TRecordSpread = {
  type: "TRecordSpread";
  loc: Loc;
  inner: Type;
};

export type TRecordKeyValue = {
  type: "TRecordKeyValue";
  loc: Loc;
  key: string;
  value: Type;
};

export type TApply_inner = {
  type: "TApply";
  loc: Loc;
  inner: TAtom;
  args: TComma[];
};

export type TApply = TApply_inner | TAtom;

export type TComma = {
  type: "TComma";
  loc: Loc;
  items: Type[];
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
  default_: Type | null;
};

export type Type = TOps;

export type TDecorated = {
  type: "TDecorated";
  loc: Loc;
  decorators: Decorator[];
  inner: TApply;
};

export type TAtom = TRef | Number | String | TLambda | TVars | TParens | TEnum | TRecord;

export type TRef = {
  type: "TRef";
  loc: Loc;
  text: string;
  hash: (string | string | string | string | string) | null;
};

export type TOps_inner = {
  type: "TOps";
  loc: Loc;
  left: TOpInner;
  right: TRight[];
};

export type TOps = TOps_inner | TOpInner;

export type TRight = {
  type: "TRight";
  loc: Loc;
  top: string;
  right: TOpInner;
};

export type top = "-" | "+";

export type TOpInner = TDecorated | TApply;

export type TParens = {
  type: "TParens";
  loc: Loc;
  items: Type[];
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

export type TypeAlias = {
  type: "TypeAlias";
  loc: Loc;
  items: TypePair[];
};

export type TypePair = {
  type: "TypePair";
  loc: Loc;
  name: string;
  typ: Type;
};

export type AllTaggedTypes = File | TypeFile | Apply_inner | CallSuffix | CommaExpr | Identifier | ParenedExpression | Boolean | Number | String | TemplateString | TemplatePair | TemplateWrap | DecoratedExpression_inner | Decorator | DecoratorId | DecoratorArgs | LabeledDecoratorArg | DecType | DecExpr | Enum | TEnum | EnumCases | TagDecl | TagPayload | Star | TypeApplicationSuffix | TypeAppVbls | TypeVariables | TypeVbls | TypeVbl | TRecord | TRecordItems | TRecordSpread | TRecordKeyValue | TApply_inner | TComma | TVars | TBargs | TBArg | TDecorated | TRef | TOps_inner | TRight | TParens | TArg | TArgs | TLambda | TypeAlias | TypePair;

export const AllTaggedTypeNames: AllTaggedTypes["type"][] = ["File", "TypeFile", "Apply", "CallSuffix", "CommaExpr", "Identifier", "ParenedExpression", "Boolean", "Number", "String", "TemplateString", "TemplatePair", "TemplateWrap", "DecoratedExpression", "Decorator", "DecoratorId", "DecoratorArgs", "LabeledDecoratorArg", "DecType", "DecExpr", "Enum", "TEnum", "EnumCases", "TagDecl", "TagPayload", "Star", "TypeApplicationSuffix", "TypeAppVbls", "TypeVariables", "TypeVbls", "TypeVbl", "TRecord", "TRecordItems", "TRecordSpread", "TRecordKeyValue", "TApply", "TComma", "TVars", "TBargs", "TBArg", "TDecorated", "TRef", "TOps", "TRight", "TParens", "TArg", "TArgs", "TLambda", "TypeAlias", "TypePair"];

// @ts-ignore
export const parseFile = (input: string): File => parse(input, {startRule: 'File'});
// @ts-ignore
export const parseType = (input: string): Type => parse(input, {startRule: 'Type'});
// @ts-ignore
export const parseTypeFile = (input: string): TypeFile => parse(input, {startRule: 'TypeFile'});
