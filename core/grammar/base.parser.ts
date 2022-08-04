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

// No data on HashRefInner

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

export type Suffix = CallSuffix | TypeApplicationSuffix | AwaitSuffix | ArrowSuffix;

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

export type ArrowSuffix = {
  type: "ArrowSuffix";
  loc: Loc;
  name: Identifier;
  types: TypeApplicationSuffix | null;
  args: CallSuffix | null;
};

export type AwaitSuffix = {
  type: "AwaitSuffix";
  loc: Loc;
  pseudo: string;
};

export type _lineEnd = string;

export type _EOF = string;

export type Toplevel = Aliases | TypeAlias | ToplevelLet | Expression;

export type TypeToplevel = Aliases | TypeAlias | Type;

export type Aliases = {
  type: "Aliases";
  loc: Loc;
  items: AliasItem[];
};

export type AliasItem = {
  type: "AliasItem";
  loc: Loc;
  name: string;
  hash: string;
};

export type AliasName = string | string;

export type Expression = TypeAbstraction | Lambda | BinOp;

export type Identifier = {
  type: "Identifier";
  loc: Loc;
  text: string;
  hash: IdHash | null;
};

export type IdHash = string;

export type Atom = If | Switch | Number | Boolean | Identifier | ParenedOp | ParenedExpression | TemplateString | Enum | Record | Block;

export type ParenedExpression = {
  type: "ParenedExpression";
  loc: Loc;
  items: CommaExpr | null;
};

// No data on IdText

export type AttrText = string;

export type BinOp_inner = {
  type: "BinOp";
  loc: Loc;
  first: WithUnary;
  rest: BinOpRight[];
};

export type BinOp = BinOp_inner | WithUnary;

export type BinOpRight = {
  type: "BinOpRight";
  loc: Loc;
  op: binopWithHash;
  right: WithUnary;
};

export type WithUnary_inner = {
  type: "WithUnary";
  loc: Loc;
  op: UnaryOpWithHash;
  inner: DecoratedExpression;
};

export type WithUnary = WithUnary_inner | DecoratedExpression;

export type UnaryOpWithHash = {
  type: "UnaryOpWithHash";
  loc: Loc;
  op: UnaryOp;
  hash: IdHash | null;
};

export type UnaryOp = "-" | "!";

export type binopWithHash = {
  type: "binopWithHash";
  loc: Loc;
  op: binop;
  hash: IdHash | null;
};

export type binop = string;

export type ParenedOp = {
  type: "ParenedOp";
  loc: Loc;
  inner: binopWithHash;
};

export type Binop = Expression;

export type newline = string;

export type _nonnewline = string;

export type __nonnewline = string;

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
  payload: EnumPayload | null;
};

export type EnumPayload = {
  type: "EnumPayload";
  loc: Loc;
  items: CommaExpr | null;
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
  items: TComma | null;
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

export type TypeAbstraction = {
  type: "TypeAbstraction";
  loc: Loc;
  args: TBargs;
  inner: Expression;
};

export type If = {
  type: "If";
  loc: Loc;
  yes: IfYes;
  no: Else | null;
};

export type IfYes = {
  type: "IfYes";
  loc: Loc;
  conds: IfConds;
  block: Block;
};

export type IfConds = {
  type: "IfConds";
  loc: Loc;
  items: IfCond[];
};

export type IfCond = Let | Expression;

export type Else = Block | If;

export type Lambda = {
  type: "Lambda";
  loc: Loc;
  args: LArgs | null;
  res: Type | null;
  body: Expression;
};

export type LArgs = {
  type: "LArgs";
  loc: Loc;
  items: LArg[];
};

export type LArg = {
  type: "LArg";
  loc: Loc;
  pat: Pattern;
  typ: Type | null;
};

export type Block = {
  type: "Block";
  loc: Loc;
  stmts: Stmts | null;
};

export type Stmts = {
  type: "Stmts";
  loc: Loc;
  items: Stmt[];
};

export type Stmt = Let | Expression;

export type Let = {
  type: "Let";
  loc: Loc;
  pat: Pattern;
  expr: Expression;
};

export type ToplevelLet = {
  type: "ToplevelLet";
  loc: Loc;
  items: LetPair[];
};

export type LetPair = {
  type: "LetPair";
  loc: Loc;
  name: string;
  typ: Type | null;
  expr: Expression;
};

export type Pattern = PDecorated | PEnum | PName | PTuple | PRecord | PBlank | Number | String;

export type PBlank = {
  type: "PBlank";
  loc: Loc;
  pseudo: string;
};

export type PName = {
  type: "PName";
  loc: Loc;
  name: string;
  hash: string | null;
};

export type PTuple = {
  type: "PTuple";
  loc: Loc;
  items: PTupleItems | null;
};

export type PTupleItems = {
  type: "PTupleItems";
  loc: Loc;
  items: Pattern[];
};

export type PRecord = {
  type: "PRecord";
  loc: Loc;
  fields: PRecordFields | null;
};

export type PRecordFields = {
  type: "PRecordFields";
  loc: Loc;
  items: PRecordField[];
};

export type PRecordField = {
  type: "PRecordField";
  loc: Loc;
  name: string;
  pat: PRecordValue | null;
};

export type PRecordValue = PRecordPattern | PHash;

export type PRecordPattern = Pattern;

export type PHash = {
  type: "PHash";
  loc: Loc;
  hash: string;
};

export type PDecorated = {
  type: "PDecorated";
  loc: Loc;
  decorators: Decorator[];
  inner: Pattern;
};

export type PEnum = {
  type: "PEnum";
  loc: Loc;
  text: string;
  payload: PTuple | null;
};

export type Record = {
  type: "Record";
  loc: Loc;
  items: RecordItems | null;
};

export type RecordItems = {
  type: "RecordItems";
  loc: Loc;
  items: RecordItem[];
};

export type RecordItem = RecordSpread | RecordKeyValue;

export type RecordSpread = {
  type: "RecordSpread";
  loc: Loc;
  inner: Expression;
};

export type RecordKeyValue = {
  type: "RecordKeyValue";
  loc: Loc;
  key: string;
  value: Expression;
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
  default_: Expression | null;
};

export type Switch = {
  type: "Switch";
  loc: Loc;
  target: Expression;
  cases: Case[];
};

export type Case = {
  type: "Case";
  loc: Loc;
  pat: Pattern;
  expr: Expression;
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

export type TAtom = TConst | TBlank | TRef | Number | String | TLambda | TVars | TParens | TEnum | TRecord;

export type TRef = {
  type: "TRef";
  loc: Loc;
  text: string;
  hash: (string | string | string | string | string) | null;
};

export type TConst = {
  type: "TConst";
  loc: Loc;
  inner: TAtom;
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
  items: TComma | null;
  open: string | null;
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

export type TBlank = {
  type: "TBlank";
  loc: Loc;
  pseudo: string;
};

export type AllTaggedTypes = File | TypeFile | Apply_inner | CallSuffix | CommaExpr | ArrowSuffix | AwaitSuffix | Aliases | AliasItem | Identifier | ParenedExpression | BinOp_inner | BinOpRight | WithUnary_inner | UnaryOpWithHash | binopWithHash | ParenedOp | Boolean | Number | String | TemplateString | TemplatePair | TemplateWrap | DecoratedExpression_inner | Decorator | DecoratorId | DecoratorArgs | LabeledDecoratorArg | DecType | DecExpr | Enum | EnumPayload | TEnum | EnumCases | TagDecl | TagPayload | Star | TypeApplicationSuffix | TypeAppVbls | TypeAbstraction | If | IfYes | IfConds | Lambda | LArgs | LArg | Block | Stmts | Let | ToplevelLet | LetPair | PBlank | PName | PTuple | PTupleItems | PRecord | PRecordFields | PRecordField | PHash | PDecorated | PEnum | Record | RecordItems | RecordSpread | RecordKeyValue | TRecord | TRecordItems | TRecordSpread | TRecordKeyValue | Switch | Case | TApply_inner | TComma | TVars | TBargs | TBArg | TDecorated | TRef | TConst | TOps_inner | TRight | TParens | TArg | TArgs | TLambda | TypeAlias | TypePair | TBlank;

export const AllTaggedTypeNames: AllTaggedTypes["type"][] = ["File", "TypeFile", "Apply", "CallSuffix", "CommaExpr", "ArrowSuffix", "AwaitSuffix", "Aliases", "AliasItem", "Identifier", "ParenedExpression", "BinOp", "BinOpRight", "WithUnary", "UnaryOpWithHash", "binopWithHash", "ParenedOp", "Boolean", "Number", "String", "TemplateString", "TemplatePair", "TemplateWrap", "DecoratedExpression", "Decorator", "DecoratorId", "DecoratorArgs", "LabeledDecoratorArg", "DecType", "DecExpr", "Enum", "EnumPayload", "TEnum", "EnumCases", "TagDecl", "TagPayload", "Star", "TypeApplicationSuffix", "TypeAppVbls", "TypeAbstraction", "If", "IfYes", "IfConds", "Lambda", "LArgs", "LArg", "Block", "Stmts", "Let", "ToplevelLet", "LetPair", "PBlank", "PName", "PTuple", "PTupleItems", "PRecord", "PRecordFields", "PRecordField", "PHash", "PDecorated", "PEnum", "Record", "RecordItems", "RecordSpread", "RecordKeyValue", "TRecord", "TRecordItems", "TRecordSpread", "TRecordKeyValue", "Switch", "Case", "TApply", "TComma", "TVars", "TBargs", "TBArg", "TDecorated", "TRef", "TConst", "TOps", "TRight", "TParens", "TArg", "TArgs", "TLambda", "TypeAlias", "TypePair", "TBlank"];

// @ts-ignore
export const parseFile = (input: string): File => parse(input, {startRule: 'File'});
// @ts-ignore
export const parseType = (input: string): Type => parse(input, {startRule: 'Type'});
// @ts-ignore
export const parseTypeFile = (input: string): TypeFile => parse(input, {startRule: 'TypeFile'});
