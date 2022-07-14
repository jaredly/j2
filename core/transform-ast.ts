import {
  SyntaxError,
  Loc,
  File,
  Toplevel,
  TypeAlias,
  TypePair,
  Type,
  TOps,
  TOps_inner,
  TOpInner,
  TDecorated,
  Decorator,
  DecoratorId,
  DecoratorArgs,
  LabeledDecoratorArg,
  DecoratorArg,
  DecType,
  DecExpr,
  Expression,
  DecoratedExpression,
  DecoratedExpression_inner,
  Apply,
  Apply_inner,
  Atom,
  Number,
  Boolean,
  Identifier,
  ParenedExpression,
  TemplateString,
  TemplatePair,
  TemplateWrap,
  Enum,
  Suffix,
  CallSuffix,
  CommaExpr,
  TypeApplicationSuffix,
  TypeAppVbls,
  TApply,
  TApply_inner,
  TAtom,
  TRef,
  String,
  TLambda,
  TArgs,
  TArg,
  TVars,
  TBargs,
  TBArg,
  TParens,
  TEnum,
  EnumCases,
  EnumCase,
  TagDecl,
  TagPayload,
  TRecord,
  TRecordItems,
  TRecordItem,
  TRecordSpread,
  TRecordKeyValue,
  Star,
  TComma,
  TRight,
  TypeFile,
  TypeToplevel,
  _lineEnd,
  _EOF,
  newline,
  _nonnewline,
  _,
  __,
  comment,
  lineComment,
  multiLineComment,
  finalLineComment,
  tplStringChars,
  stringChar,
  TypeVariables,
  TypeVbls,
  TypeVbl,
  top,
  AllTaggedTypes,
} from "./grammar/base.parser";

export type Visitor<Ctx> = {
  SyntaxError?: (
    node: SyntaxError,
    ctx: Ctx
  ) => null | false | SyntaxError | [SyntaxError | null, Ctx];
  SyntaxErrorPost?: (node: SyntaxError, ctx: Ctx) => null | SyntaxError;
  Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx];
  LocPost?: (node: Loc, ctx: Ctx) => null | Loc;
  File?: (node: File, ctx: Ctx) => null | false | File | [File | null, Ctx];
  FilePost?: (node: File, ctx: Ctx) => null | File;
  TypeFile?: (
    node: TypeFile,
    ctx: Ctx
  ) => null | false | TypeFile | [TypeFile | null, Ctx];
  TypeFilePost?: (node: TypeFile, ctx: Ctx) => null | TypeFile;
  Apply_inner?: (
    node: Apply_inner,
    ctx: Ctx
  ) => null | false | Apply_inner | [Apply_inner | null, Ctx];
  Apply_innerPost?: (node: Apply_inner, ctx: Ctx) => null | Apply_inner;
  Apply?: (node: Apply, ctx: Ctx) => null | false | Apply | [Apply | null, Ctx];
  ApplyPost?: (node: Apply, ctx: Ctx) => null | Apply;
  Suffix?: (
    node: Suffix,
    ctx: Ctx
  ) => null | false | Suffix | [Suffix | null, Ctx];
  SuffixPost?: (node: Suffix, ctx: Ctx) => null | Suffix;
  CallSuffix?: (
    node: CallSuffix,
    ctx: Ctx
  ) => null | false | CallSuffix | [CallSuffix | null, Ctx];
  CallSuffixPost?: (node: CallSuffix, ctx: Ctx) => null | CallSuffix;
  CommaExpr?: (
    node: CommaExpr,
    ctx: Ctx
  ) => null | false | CommaExpr | [CommaExpr | null, Ctx];
  CommaExprPost?: (node: CommaExpr, ctx: Ctx) => null | CommaExpr;
  _lineEnd?: (
    node: _lineEnd,
    ctx: Ctx
  ) => null | false | _lineEnd | [_lineEnd | null, Ctx];
  _lineEndPost?: (node: _lineEnd, ctx: Ctx) => null | _lineEnd;
  _EOF?: (node: _EOF, ctx: Ctx) => null | false | _EOF | [_EOF | null, Ctx];
  _EOFPost?: (node: _EOF, ctx: Ctx) => null | _EOF;
  Toplevel?: (
    node: Toplevel,
    ctx: Ctx
  ) => null | false | Toplevel | [Toplevel | null, Ctx];
  ToplevelPost?: (node: Toplevel, ctx: Ctx) => null | Toplevel;
  TypeToplevel?: (
    node: TypeToplevel,
    ctx: Ctx
  ) => null | false | TypeToplevel | [TypeToplevel | null, Ctx];
  TypeToplevelPost?: (node: TypeToplevel, ctx: Ctx) => null | TypeToplevel;
  Expression?: (
    node: Expression,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  ExpressionPost?: (node: Expression, ctx: Ctx) => null | Expression;
  Identifier?: (
    node: Identifier,
    ctx: Ctx
  ) => null | false | Identifier | [Identifier | null, Ctx];
  IdentifierPost?: (node: Identifier, ctx: Ctx) => null | Identifier;
  Atom?: (node: Atom, ctx: Ctx) => null | false | Atom | [Atom | null, Ctx];
  AtomPost?: (node: Atom, ctx: Ctx) => null | Atom;
  ParenedExpression?: (
    node: ParenedExpression,
    ctx: Ctx
  ) => null | false | ParenedExpression | [ParenedExpression | null, Ctx];
  ParenedExpressionPost?: (
    node: ParenedExpression,
    ctx: Ctx
  ) => null | ParenedExpression;
  newline?: (
    node: newline,
    ctx: Ctx
  ) => null | false | newline | [newline | null, Ctx];
  newlinePost?: (node: newline, ctx: Ctx) => null | newline;
  _nonnewline?: (
    node: _nonnewline,
    ctx: Ctx
  ) => null | false | _nonnewline | [_nonnewline | null, Ctx];
  _nonnewlinePost?: (node: _nonnewline, ctx: Ctx) => null | _nonnewline;
  _?: (node: _, ctx: Ctx) => null | false | _ | [_ | null, Ctx];
  _Post?: (node: _, ctx: Ctx) => null | _;
  __?: (node: __, ctx: Ctx) => null | false | __ | [__ | null, Ctx];
  __Post?: (node: __, ctx: Ctx) => null | __;
  comment?: (
    node: comment,
    ctx: Ctx
  ) => null | false | comment | [comment | null, Ctx];
  commentPost?: (node: comment, ctx: Ctx) => null | comment;
  multiLineComment?: (
    node: multiLineComment,
    ctx: Ctx
  ) => null | false | multiLineComment | [multiLineComment | null, Ctx];
  multiLineCommentPost?: (
    node: multiLineComment,
    ctx: Ctx
  ) => null | multiLineComment;
  lineComment?: (
    node: lineComment,
    ctx: Ctx
  ) => null | false | lineComment | [lineComment | null, Ctx];
  lineCommentPost?: (node: lineComment, ctx: Ctx) => null | lineComment;
  finalLineComment?: (
    node: finalLineComment,
    ctx: Ctx
  ) => null | false | finalLineComment | [finalLineComment | null, Ctx];
  finalLineCommentPost?: (
    node: finalLineComment,
    ctx: Ctx
  ) => null | finalLineComment;
  Boolean?: (
    node: Boolean,
    ctx: Ctx
  ) => null | false | Boolean | [Boolean | null, Ctx];
  BooleanPost?: (node: Boolean, ctx: Ctx) => null | Boolean;
  Number?: (
    node: Number,
    ctx: Ctx
  ) => null | false | Number | [Number | null, Ctx];
  NumberPost?: (node: Number, ctx: Ctx) => null | Number;
  String?: (
    node: String,
    ctx: Ctx
  ) => null | false | String | [String | null, Ctx];
  StringPost?: (node: String, ctx: Ctx) => null | String;
  TemplateString?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | false | TemplateString | [TemplateString | null, Ctx];
  TemplateStringPost?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | TemplateString;
  TemplatePair?: (
    node: TemplatePair,
    ctx: Ctx
  ) => null | false | TemplatePair | [TemplatePair | null, Ctx];
  TemplatePairPost?: (node: TemplatePair, ctx: Ctx) => null | TemplatePair;
  TemplateWrap?: (
    node: TemplateWrap,
    ctx: Ctx
  ) => null | false | TemplateWrap | [TemplateWrap | null, Ctx];
  TemplateWrapPost?: (node: TemplateWrap, ctx: Ctx) => null | TemplateWrap;
  tplStringChars?: (
    node: tplStringChars,
    ctx: Ctx
  ) => null | false | tplStringChars | [tplStringChars | null, Ctx];
  tplStringCharsPost?: (
    node: tplStringChars,
    ctx: Ctx
  ) => null | tplStringChars;
  stringChar?: (
    node: stringChar,
    ctx: Ctx
  ) => null | false | stringChar | [stringChar | null, Ctx];
  stringCharPost?: (node: stringChar, ctx: Ctx) => null | stringChar;
  DecoratedExpression_inner?: (
    node: DecoratedExpression_inner,
    ctx: Ctx
  ) =>
    | null
    | false
    | DecoratedExpression_inner
    | [DecoratedExpression_inner | null, Ctx];
  DecoratedExpression_innerPost?: (
    node: DecoratedExpression_inner,
    ctx: Ctx
  ) => null | DecoratedExpression_inner;
  DecoratedExpression?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx];
  DecoratedExpressionPost?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | DecoratedExpression;
  Decorator?: (
    node: Decorator,
    ctx: Ctx
  ) => null | false | Decorator | [Decorator | null, Ctx];
  DecoratorPost?: (node: Decorator, ctx: Ctx) => null | Decorator;
  DecoratorId?: (
    node: DecoratorId,
    ctx: Ctx
  ) => null | false | DecoratorId | [DecoratorId | null, Ctx];
  DecoratorIdPost?: (node: DecoratorId, ctx: Ctx) => null | DecoratorId;
  DecoratorArgs?: (
    node: DecoratorArgs,
    ctx: Ctx
  ) => null | false | DecoratorArgs | [DecoratorArgs | null, Ctx];
  DecoratorArgsPost?: (node: DecoratorArgs, ctx: Ctx) => null | DecoratorArgs;
  DecoratorArg?: (
    node: DecoratorArg,
    ctx: Ctx
  ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
  DecoratorArgPost?: (node: DecoratorArg, ctx: Ctx) => null | DecoratorArg;
  LabeledDecoratorArg?: (
    node: LabeledDecoratorArg,
    ctx: Ctx
  ) => null | false | LabeledDecoratorArg | [LabeledDecoratorArg | null, Ctx];
  LabeledDecoratorArgPost?: (
    node: LabeledDecoratorArg,
    ctx: Ctx
  ) => null | LabeledDecoratorArg;
  DecType?: (
    node: DecType,
    ctx: Ctx
  ) => null | false | DecType | [DecType | null, Ctx];
  DecTypePost?: (node: DecType, ctx: Ctx) => null | DecType;
  DecExpr?: (
    node: DecExpr,
    ctx: Ctx
  ) => null | false | DecExpr | [DecExpr | null, Ctx];
  DecExprPost?: (node: DecExpr, ctx: Ctx) => null | DecExpr;
  Enum?: (node: Enum, ctx: Ctx) => null | false | Enum | [Enum | null, Ctx];
  EnumPost?: (node: Enum, ctx: Ctx) => null | Enum;
  TEnum?: (node: TEnum, ctx: Ctx) => null | false | TEnum | [TEnum | null, Ctx];
  TEnumPost?: (node: TEnum, ctx: Ctx) => null | TEnum;
  EnumCases?: (
    node: EnumCases,
    ctx: Ctx
  ) => null | false | EnumCases | [EnumCases | null, Ctx];
  EnumCasesPost?: (node: EnumCases, ctx: Ctx) => null | EnumCases;
  EnumCase?: (
    node: EnumCase,
    ctx: Ctx
  ) => null | false | EnumCase | [EnumCase | null, Ctx];
  EnumCasePost?: (node: EnumCase, ctx: Ctx) => null | EnumCase;
  TagDecl?: (
    node: TagDecl,
    ctx: Ctx
  ) => null | false | TagDecl | [TagDecl | null, Ctx];
  TagDeclPost?: (node: TagDecl, ctx: Ctx) => null | TagDecl;
  TagPayload?: (
    node: TagPayload,
    ctx: Ctx
  ) => null | false | TagPayload | [TagPayload | null, Ctx];
  TagPayloadPost?: (node: TagPayload, ctx: Ctx) => null | TagPayload;
  Star?: (node: Star, ctx: Ctx) => null | false | Star | [Star | null, Ctx];
  StarPost?: (node: Star, ctx: Ctx) => null | Star;
  TypeApplicationSuffix?: (
    node: TypeApplicationSuffix,
    ctx: Ctx
  ) =>
    | null
    | false
    | TypeApplicationSuffix
    | [TypeApplicationSuffix | null, Ctx];
  TypeApplicationSuffixPost?: (
    node: TypeApplicationSuffix,
    ctx: Ctx
  ) => null | TypeApplicationSuffix;
  TypeAppVbls?: (
    node: TypeAppVbls,
    ctx: Ctx
  ) => null | false | TypeAppVbls | [TypeAppVbls | null, Ctx];
  TypeAppVblsPost?: (node: TypeAppVbls, ctx: Ctx) => null | TypeAppVbls;
  TypeVariables?: (
    node: TypeVariables,
    ctx: Ctx
  ) => null | false | TypeVariables | [TypeVariables | null, Ctx];
  TypeVariablesPost?: (node: TypeVariables, ctx: Ctx) => null | TypeVariables;
  TypeVbls?: (
    node: TypeVbls,
    ctx: Ctx
  ) => null | false | TypeVbls | [TypeVbls | null, Ctx];
  TypeVblsPost?: (node: TypeVbls, ctx: Ctx) => null | TypeVbls;
  TypeVbl?: (
    node: TypeVbl,
    ctx: Ctx
  ) => null | false | TypeVbl | [TypeVbl | null, Ctx];
  TypeVblPost?: (node: TypeVbl, ctx: Ctx) => null | TypeVbl;
  TRecord?: (
    node: TRecord,
    ctx: Ctx
  ) => null | false | TRecord | [TRecord | null, Ctx];
  TRecordPost?: (node: TRecord, ctx: Ctx) => null | TRecord;
  TRecordItems?: (
    node: TRecordItems,
    ctx: Ctx
  ) => null | false | TRecordItems | [TRecordItems | null, Ctx];
  TRecordItemsPost?: (node: TRecordItems, ctx: Ctx) => null | TRecordItems;
  TRecordItem?: (
    node: TRecordItem,
    ctx: Ctx
  ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
  TRecordItemPost?: (node: TRecordItem, ctx: Ctx) => null | TRecordItem;
  TRecordSpread?: (
    node: TRecordSpread,
    ctx: Ctx
  ) => null | false | TRecordSpread | [TRecordSpread | null, Ctx];
  TRecordSpreadPost?: (node: TRecordSpread, ctx: Ctx) => null | TRecordSpread;
  TRecordKeyValue?: (
    node: TRecordKeyValue,
    ctx: Ctx
  ) => null | false | TRecordKeyValue | [TRecordKeyValue | null, Ctx];
  TRecordKeyValuePost?: (
    node: TRecordKeyValue,
    ctx: Ctx
  ) => null | TRecordKeyValue;
  TApply_inner?: (
    node: TApply_inner,
    ctx: Ctx
  ) => null | false | TApply_inner | [TApply_inner | null, Ctx];
  TApply_innerPost?: (node: TApply_inner, ctx: Ctx) => null | TApply_inner;
  TApply?: (
    node: TApply,
    ctx: Ctx
  ) => null | false | TApply | [TApply | null, Ctx];
  TApplyPost?: (node: TApply, ctx: Ctx) => null | TApply;
  TComma?: (
    node: TComma,
    ctx: Ctx
  ) => null | false | TComma | [TComma | null, Ctx];
  TCommaPost?: (node: TComma, ctx: Ctx) => null | TComma;
  TVars?: (node: TVars, ctx: Ctx) => null | false | TVars | [TVars | null, Ctx];
  TVarsPost?: (node: TVars, ctx: Ctx) => null | TVars;
  TBargs?: (
    node: TBargs,
    ctx: Ctx
  ) => null | false | TBargs | [TBargs | null, Ctx];
  TBargsPost?: (node: TBargs, ctx: Ctx) => null | TBargs;
  TBArg?: (node: TBArg, ctx: Ctx) => null | false | TBArg | [TBArg | null, Ctx];
  TBArgPost?: (node: TBArg, ctx: Ctx) => null | TBArg;
  Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx];
  TypePost?: (node: Type, ctx: Ctx) => null | Type;
  TDecorated?: (
    node: TDecorated,
    ctx: Ctx
  ) => null | false | TDecorated | [TDecorated | null, Ctx];
  TDecoratedPost?: (node: TDecorated, ctx: Ctx) => null | TDecorated;
  TAtom?: (node: TAtom, ctx: Ctx) => null | false | TAtom | [TAtom | null, Ctx];
  TAtomPost?: (node: TAtom, ctx: Ctx) => null | TAtom;
  TRef?: (node: TRef, ctx: Ctx) => null | false | TRef | [TRef | null, Ctx];
  TRefPost?: (node: TRef, ctx: Ctx) => null | TRef;
  TOps_inner?: (
    node: TOps_inner,
    ctx: Ctx
  ) => null | false | TOps_inner | [TOps_inner | null, Ctx];
  TOps_innerPost?: (node: TOps_inner, ctx: Ctx) => null | TOps_inner;
  TOps?: (node: TOps, ctx: Ctx) => null | false | TOps | [TOps | null, Ctx];
  TOpsPost?: (node: TOps, ctx: Ctx) => null | TOps;
  TRight?: (
    node: TRight,
    ctx: Ctx
  ) => null | false | TRight | [TRight | null, Ctx];
  TRightPost?: (node: TRight, ctx: Ctx) => null | TRight;
  top?: (node: top, ctx: Ctx) => null | false | top | [top | null, Ctx];
  topPost?: (node: top, ctx: Ctx) => null | top;
  TOpInner?: (
    node: TOpInner,
    ctx: Ctx
  ) => null | false | TOpInner | [TOpInner | null, Ctx];
  TOpInnerPost?: (node: TOpInner, ctx: Ctx) => null | TOpInner;
  TParens?: (
    node: TParens,
    ctx: Ctx
  ) => null | false | TParens | [TParens | null, Ctx];
  TParensPost?: (node: TParens, ctx: Ctx) => null | TParens;
  TArg?: (node: TArg, ctx: Ctx) => null | false | TArg | [TArg | null, Ctx];
  TArgPost?: (node: TArg, ctx: Ctx) => null | TArg;
  TArgs?: (node: TArgs, ctx: Ctx) => null | false | TArgs | [TArgs | null, Ctx];
  TArgsPost?: (node: TArgs, ctx: Ctx) => null | TArgs;
  TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | TLambda | [TLambda | null, Ctx];
  TLambdaPost?: (node: TLambda, ctx: Ctx) => null | TLambda;
  TypeAlias?: (
    node: TypeAlias,
    ctx: Ctx
  ) => null | false | TypeAlias | [TypeAlias | null, Ctx];
  TypeAliasPost?: (node: TypeAlias, ctx: Ctx) => null | TypeAlias;
  TypePair?: (
    node: TypePair,
    ctx: Ctx
  ) => null | false | TypePair | [TypePair | null, Ctx];
  TypePairPost?: (node: TypePair, ctx: Ctx) => null | TypePair;
  AllTaggedTypes?: (
    node: AllTaggedTypes,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypesPost?: (
    node: AllTaggedTypes,
    ctx: Ctx
  ) => null | AllTaggedTypes;
  Apply_Apply?: (
    node: Apply,
    ctx: Ctx
  ) => null | false | Apply | [Apply | null, Ctx];
  Suffix_CallSuffix?: (
    node: CallSuffix,
    ctx: Ctx
  ) => null | false | Suffix | [Suffix | null, Ctx];
  Suffix_TypeApplicationSuffix?: (
    node: TypeApplicationSuffix,
    ctx: Ctx
  ) => null | false | Suffix | [Suffix | null, Ctx];
  Toplevel_TypeAlias?: (
    node: TypeAlias,
    ctx: Ctx
  ) => null | false | Toplevel | [Toplevel | null, Ctx];
  TypeToplevel_TypeAlias?: (
    node: TypeAlias,
    ctx: Ctx
  ) => null | false | TypeToplevel | [TypeToplevel | null, Ctx];
  Atom_Number?: (
    node: Number,
    ctx: Ctx
  ) => null | false | Atom | [Atom | null, Ctx];
  Atom_Boolean?: (
    node: Boolean,
    ctx: Ctx
  ) => null | false | Atom | [Atom | null, Ctx];
  Atom_Identifier?: (
    node: Identifier,
    ctx: Ctx
  ) => null | false | Atom | [Atom | null, Ctx];
  Atom_ParenedExpression?: (
    node: ParenedExpression,
    ctx: Ctx
  ) => null | false | Atom | [Atom | null, Ctx];
  Atom_TemplateString?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | false | Atom | [Atom | null, Ctx];
  Atom_Enum?: (
    node: Enum,
    ctx: Ctx
  ) => null | false | Atom | [Atom | null, Ctx];
  DecoratedExpression_DecoratedExpression?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx];
  DecoratorArg_DecType?: (
    node: DecType,
    ctx: Ctx
  ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
  DecoratorArg_DecExpr?: (
    node: DecExpr,
    ctx: Ctx
  ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
  EnumCase_TagDecl?: (
    node: TagDecl,
    ctx: Ctx
  ) => null | false | EnumCase | [EnumCase | null, Ctx];
  EnumCase_Star?: (
    node: Star,
    ctx: Ctx
  ) => null | false | EnumCase | [EnumCase | null, Ctx];
  TRecordItem_TRecordSpread?: (
    node: TRecordSpread,
    ctx: Ctx
  ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
  TRecordItem_TRecordKeyValue?: (
    node: TRecordKeyValue,
    ctx: Ctx
  ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
  TRecordItem_Star?: (
    node: Star,
    ctx: Ctx
  ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
  TApply_TApply?: (
    node: TApply,
    ctx: Ctx
  ) => null | false | TApply | [TApply | null, Ctx];
  TAtom_TRef?: (
    node: TRef,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_Number?: (
    node: Number,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_String?: (
    node: String,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_TVars?: (
    node: TVars,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_TParens?: (
    node: TParens,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_TEnum?: (
    node: TEnum,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TAtom_TRecord?: (
    node: TRecord,
    ctx: Ctx
  ) => null | false | TAtom | [TAtom | null, Ctx];
  TOps_TOps?: (
    node: TOps,
    ctx: Ctx
  ) => null | false | TOps | [TOps | null, Ctx];
  TOpInner_TDecorated?: (
    node: TDecorated,
    ctx: Ctx
  ) => null | false | TOpInner | [TOpInner | null, Ctx];
  AllTaggedTypes_File?: (
    node: File,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeFile?: (
    node: TypeFile,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Apply?: (
    node: Apply,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_CallSuffix?: (
    node: CallSuffix,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_CommaExpr?: (
    node: CommaExpr,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Identifier?: (
    node: Identifier,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_ParenedExpression?: (
    node: ParenedExpression,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Boolean?: (
    node: Boolean,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Number?: (
    node: Number,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_String?: (
    node: String,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TemplateString?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TemplatePair?: (
    node: TemplatePair,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TemplateWrap?: (
    node: TemplateWrap,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_DecoratedExpression?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Decorator?: (
    node: Decorator,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_DecoratorId?: (
    node: DecoratorId,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_DecoratorArgs?: (
    node: DecoratorArgs,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_LabeledDecoratorArg?: (
    node: LabeledDecoratorArg,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_DecType?: (
    node: DecType,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_DecExpr?: (
    node: DecExpr,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Enum?: (
    node: Enum,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TEnum?: (
    node: TEnum,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_EnumCases?: (
    node: EnumCases,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TagDecl?: (
    node: TagDecl,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TagPayload?: (
    node: TagPayload,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Star?: (
    node: Star,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeApplicationSuffix?: (
    node: TypeApplicationSuffix,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeAppVbls?: (
    node: TypeAppVbls,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeVariables?: (
    node: TypeVariables,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeVbls?: (
    node: TypeVbls,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeVbl?: (
    node: TypeVbl,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TRecord?: (
    node: TRecord,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TRecordItems?: (
    node: TRecordItems,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TRecordSpread?: (
    node: TRecordSpread,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TRecordKeyValue?: (
    node: TRecordKeyValue,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TApply?: (
    node: TApply,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TComma?: (
    node: TComma,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TVars?: (
    node: TVars,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TBargs?: (
    node: TBargs,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TBArg?: (
    node: TBArg,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TDecorated?: (
    node: TDecorated,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TRef?: (
    node: TRef,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TOps?: (
    node: TOps,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TRight?: (
    node: TRight,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TParens?: (
    node: TParens,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TArg?: (
    node: TArg,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TArgs?: (
    node: TArgs,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypeAlias?: (
    node: TypeAlias,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_TypePair?: (
    node: TypePair,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
};
export const transformLoc = <Ctx>(
  node: Loc,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Loc => {
  if (!node) {
    throw new Error("No Loc provided");
  }

  const transformed = visitor.Loc ? visitor.Loc(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.LocPost) {
    const transformed = visitor.LocPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformSyntaxError = <Ctx>(
  node: SyntaxError,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): SyntaxError => {
  if (!node) {
    throw new Error("No SyntaxError provided");
  }

  const transformed = visitor.SyntaxError
    ? visitor.SyntaxError(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$location = transformLoc(node.location, visitor, ctx);
    changed1 = changed1 || updatedNode$location !== node.location;
    if (changed1) {
      updatedNode = { ...updatedNode, location: updatedNode$location };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.SyntaxErrorPost) {
    const transformed = visitor.SyntaxErrorPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecoratorId = <Ctx>(
  node: DecoratorId,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecoratorId => {
  if (!node) {
    throw new Error("No DecoratorId provided");
  }

  const transformed = visitor.DecoratorId
    ? visitor.DecoratorId(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.DecoratorIdPost) {
    const transformed = visitor.DecoratorIdPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecType = <Ctx>(
  node: DecType,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecType => {
  if (!node) {
    throw new Error("No DecType provided");
  }

  const transformed = visitor.DecType ? visitor.DecType(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$type_ = transformType(node.type_, visitor, ctx);
    changed1 = changed1 || updatedNode$type_ !== node.type_;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        type_: updatedNode$type_,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.DecTypePost) {
    const transformed = visitor.DecTypePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformNumber = <Ctx>(
  node: Number,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Number => {
  if (!node) {
    throw new Error("No Number provided");
  }

  const transformed = visitor.Number ? visitor.Number(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.NumberPost) {
    const transformed = visitor.NumberPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformBoolean = <Ctx>(
  node: Boolean,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Boolean => {
  if (!node) {
    throw new Error("No Boolean provided");
  }

  const transformed = visitor.Boolean ? visitor.Boolean(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.BooleanPost) {
    const transformed = visitor.BooleanPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformIdentifier = <Ctx>(
  node: Identifier,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Identifier => {
  if (!node) {
    throw new Error("No Identifier provided");
  }

  const transformed = visitor.Identifier ? visitor.Identifier(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.IdentifierPost) {
    const transformed = visitor.IdentifierPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformParenedExpression = <Ctx>(
  node: ParenedExpression,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): ParenedExpression => {
  if (!node) {
    throw new Error("No ParenedExpression provided");
  }

  const transformed = visitor.ParenedExpression
    ? visitor.ParenedExpression(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
    changed1 = changed1 || updatedNode$expr !== node.expr;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        expr: updatedNode$expr,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.ParenedExpressionPost) {
    const transformed = visitor.ParenedExpressionPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTemplateWrap = <Ctx>(
  node: TemplateWrap,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TemplateWrap => {
  if (!node) {
    throw new Error("No TemplateWrap provided");
  }

  const transformed = visitor.TemplateWrap
    ? visitor.TemplateWrap(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
    changed1 = changed1 || updatedNode$expr !== node.expr;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        expr: updatedNode$expr,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TemplateWrapPost) {
    const transformed = visitor.TemplateWrapPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTemplatePair = <Ctx>(
  node: TemplatePair,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TemplatePair => {
  if (!node) {
    throw new Error("No TemplatePair provided");
  }

  const transformed = visitor.TemplatePair
    ? visitor.TemplatePair(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$wrap = transformTemplateWrap(node.wrap, visitor, ctx);
    changed1 = changed1 || updatedNode$wrap !== node.wrap;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        wrap: updatedNode$wrap,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TemplatePairPost) {
    const transformed = visitor.TemplatePairPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTemplateString = <Ctx>(
  node: TemplateString,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TemplateString => {
  if (!node) {
    throw new Error("No TemplateString provided");
  }

  const transformed = visitor.TemplateString
    ? visitor.TemplateString(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$rest = node.rest;
    {
      let changed2 = false;
      const arr1 = node.rest.map((updatedNode$rest$item1) => {
        const result = transformTemplatePair(
          updatedNode$rest$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$rest$item1;
        return result;
      });
      if (changed2) {
        updatedNode$rest = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        rest: updatedNode$rest,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TemplateStringPost) {
    const transformed = visitor.TemplateStringPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformEnum = <Ctx>(
  node: Enum,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Enum => {
  if (!node) {
    throw new Error("No Enum provided");
  }

  const transformed = visitor.Enum ? visitor.Enum(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.EnumPost) {
    const transformed = visitor.EnumPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformAtom = <Ctx>(
  node: Atom,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Atom => {
  if (!node) {
    throw new Error("No Atom provided");
  }

  const transformed = visitor.Atom ? visitor.Atom(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "Number": {
      const transformed = visitor.Atom_Number
        ? visitor.Atom_Number(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Boolean": {
      const transformed = visitor.Atom_Boolean
        ? visitor.Atom_Boolean(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Identifier": {
      const transformed = visitor.Atom_Identifier
        ? visitor.Atom_Identifier(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "ParenedExpression": {
      const transformed = visitor.Atom_ParenedExpression
        ? visitor.Atom_ParenedExpression(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TemplateString": {
      const transformed = visitor.Atom_TemplateString
        ? visitor.Atom_TemplateString(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Enum": {
      const transformed = visitor.Atom_Enum
        ? visitor.Atom_Enum(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "Number": {
      updatedNode = transformNumber(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Boolean": {
      updatedNode = transformBoolean(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Identifier": {
      updatedNode = transformIdentifier(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "ParenedExpression": {
      updatedNode = transformParenedExpression(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TemplateString": {
      updatedNode = transformTemplateString(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformEnum(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.AtomPost) {
    const transformed = visitor.AtomPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformCommaExpr = <Ctx>(
  node: CommaExpr,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): CommaExpr => {
  if (!node) {
    throw new Error("No CommaExpr provided");
  }

  const transformed = visitor.CommaExpr ? visitor.CommaExpr(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformExpression(
          updatedNode$items$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.CommaExprPost) {
    const transformed = visitor.CommaExprPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformCallSuffix = <Ctx>(
  node: CallSuffix,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): CallSuffix => {
  if (!node) {
    throw new Error("No CallSuffix provided");
  }

  const transformed = visitor.CallSuffix ? visitor.CallSuffix(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$args = null;
    const updatedNode$args$current = node.args;
    if (updatedNode$args$current != null) {
      const updatedNode$args$1$ = transformCommaExpr(
        updatedNode$args$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$args$1$ !== updatedNode$args$current;
      updatedNode$args = updatedNode$args$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        args: updatedNode$args,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.CallSuffixPost) {
    const transformed = visitor.CallSuffixPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeAppVbls = <Ctx>(
  node: TypeAppVbls,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeAppVbls => {
  if (!node) {
    throw new Error("No TypeAppVbls provided");
  }

  const transformed = visitor.TypeAppVbls
    ? visitor.TypeAppVbls(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformType(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeAppVblsPost) {
    const transformed = visitor.TypeAppVblsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeApplicationSuffix = <Ctx>(
  node: TypeApplicationSuffix,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeApplicationSuffix => {
  if (!node) {
    throw new Error("No TypeApplicationSuffix provided");
  }

  const transformed = visitor.TypeApplicationSuffix
    ? visitor.TypeApplicationSuffix(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$vbls = transformTypeAppVbls(node.vbls, visitor, ctx);
    changed1 = changed1 || updatedNode$vbls !== node.vbls;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        vbls: updatedNode$vbls,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeApplicationSuffixPost) {
    const transformed = visitor.TypeApplicationSuffixPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformSuffix = <Ctx>(
  node: Suffix,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Suffix => {
  if (!node) {
    throw new Error("No Suffix provided");
  }

  const transformed = visitor.Suffix ? visitor.Suffix(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "CallSuffix": {
      const transformed = visitor.Suffix_CallSuffix
        ? visitor.Suffix_CallSuffix(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeApplicationSuffix": {
      const transformed = visitor.Suffix_TypeApplicationSuffix
        ? visitor.Suffix_TypeApplicationSuffix(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "CallSuffix": {
      updatedNode = transformCallSuffix(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTypeApplicationSuffix(
        node,
        visitor,
        ctx
      );
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.SuffixPost) {
    const transformed = visitor.SuffixPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformApply_inner = <Ctx>(
  node: Apply_inner,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Apply_inner => {
  if (!node) {
    throw new Error("No Apply_inner provided");
  }

  const transformed = visitor.Apply_inner
    ? visitor.Apply_inner(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$target = transformAtom(node.target, visitor, ctx);
    changed1 = changed1 || updatedNode$target !== node.target;

    let updatedNode$suffixes = node.suffixes;
    {
      let changed2 = false;
      const arr1 = node.suffixes.map((updatedNode$suffixes$item1) => {
        const result = transformSuffix(
          updatedNode$suffixes$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$suffixes$item1;
        return result;
      });
      if (changed2) {
        updatedNode$suffixes = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        target: updatedNode$target,
        suffixes: updatedNode$suffixes,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.Apply_innerPost) {
    const transformed = visitor.Apply_innerPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformApply = <Ctx>(
  node: Apply,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Apply => {
  if (!node) {
    throw new Error("No Apply provided");
  }

  const transformed = visitor.Apply ? visitor.Apply(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "Apply": {
      const transformed = visitor.Apply_Apply
        ? visitor.Apply_Apply(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "Apply": {
      updatedNode = transformApply_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformAtom(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.ApplyPost) {
    const transformed = visitor.ApplyPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecoratedExpression_inner = <Ctx>(
  node: DecoratedExpression_inner,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecoratedExpression_inner => {
  if (!node) {
    throw new Error("No DecoratedExpression_inner provided");
  }

  const transformed = visitor.DecoratedExpression_inner
    ? visitor.DecoratedExpression_inner(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$decorators = node.decorators;
    {
      let changed2 = false;
      const arr1 = node.decorators.map((updatedNode$decorators$item1) => {
        const result = transformDecorator(
          updatedNode$decorators$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$decorators$item1;
        return result;
      });
      if (changed2) {
        updatedNode$decorators = arr1;
        changed1 = true;
      }
    }

    const updatedNode$inner = transformApply(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        decorators: updatedNode$decorators,
        inner: updatedNode$inner,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.DecoratedExpression_innerPost) {
    const transformed = visitor.DecoratedExpression_innerPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecoratedExpression = <Ctx>(
  node: DecoratedExpression,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecoratedExpression => {
  if (!node) {
    throw new Error("No DecoratedExpression provided");
  }

  const transformed = visitor.DecoratedExpression
    ? visitor.DecoratedExpression(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "DecoratedExpression": {
      const transformed = visitor.DecoratedExpression_DecoratedExpression
        ? visitor.DecoratedExpression_DecoratedExpression(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "DecoratedExpression": {
      updatedNode = transformDecoratedExpression_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformApply(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.DecoratedExpressionPost) {
    const transformed = visitor.DecoratedExpressionPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformExpression = <Ctx>(
  node: Expression,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Expression => {
  if (!node) {
    throw new Error("No Expression provided");
  }

  const transformed = visitor.Expression ? visitor.Expression(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  const updatedNode = transformDecoratedExpression(node, visitor, ctx);
  changed0 = changed0 || updatedNode !== node;

  node = updatedNode;
  if (visitor.ExpressionPost) {
    const transformed = visitor.ExpressionPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecExpr = <Ctx>(
  node: DecExpr,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecExpr => {
  if (!node) {
    throw new Error("No DecExpr provided");
  }

  const transformed = visitor.DecExpr ? visitor.DecExpr(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
    changed1 = changed1 || updatedNode$expr !== node.expr;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        expr: updatedNode$expr,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.DecExprPost) {
    const transformed = visitor.DecExprPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecoratorArg = <Ctx>(
  node: DecoratorArg,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecoratorArg => {
  if (!node) {
    throw new Error("No DecoratorArg provided");
  }

  const transformed = visitor.DecoratorArg
    ? visitor.DecoratorArg(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "DecType": {
      const transformed = visitor.DecoratorArg_DecType
        ? visitor.DecoratorArg_DecType(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "DecExpr": {
      const transformed = visitor.DecoratorArg_DecExpr
        ? visitor.DecoratorArg_DecExpr(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "DecType": {
      updatedNode = transformDecType(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformDecExpr(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.DecoratorArgPost) {
    const transformed = visitor.DecoratorArgPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformLabeledDecoratorArg = <Ctx>(
  node: LabeledDecoratorArg,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): LabeledDecoratorArg => {
  if (!node) {
    throw new Error("No LabeledDecoratorArg provided");
  }

  const transformed = visitor.LabeledDecoratorArg
    ? visitor.LabeledDecoratorArg(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$arg = transformDecoratorArg(node.arg, visitor, ctx);
    changed1 = changed1 || updatedNode$arg !== node.arg;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        arg: updatedNode$arg,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.LabeledDecoratorArgPost) {
    const transformed = visitor.LabeledDecoratorArgPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecoratorArgs = <Ctx>(
  node: DecoratorArgs,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecoratorArgs => {
  if (!node) {
    throw new Error("No DecoratorArgs provided");
  }

  const transformed = visitor.DecoratorArgs
    ? visitor.DecoratorArgs(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformLabeledDecoratorArg(
          updatedNode$items$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.DecoratorArgsPost) {
    const transformed = visitor.DecoratorArgsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformDecorator = <Ctx>(
  node: Decorator,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Decorator => {
  if (!node) {
    throw new Error("No Decorator provided");
  }

  const transformed = visitor.Decorator ? visitor.Decorator(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$id = transformDecoratorId(node.id, visitor, ctx);
    changed1 = changed1 || updatedNode$id !== node.id;

    let updatedNode$args = null;
    const updatedNode$args$current = node.args;
    if (updatedNode$args$current != null) {
      const updatedNode$args$1$ = transformDecoratorArgs(
        updatedNode$args$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$args$1$ !== updatedNode$args$current;
      updatedNode$args = updatedNode$args$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        id: updatedNode$id,
        args: updatedNode$args,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.DecoratorPost) {
    const transformed = visitor.DecoratorPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRef = <Ctx>(
  node: TRef,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRef => {
  if (!node) {
    throw new Error("No TRef provided");
  }

  const transformed = visitor.TRef ? visitor.TRef(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TRefPost) {
    const transformed = visitor.TRefPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformString = <Ctx>(
  node: String,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): String => {
  if (!node) {
    throw new Error("No String provided");
  }

  const transformed = visitor.String ? visitor.String(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.StringPost) {
    const transformed = visitor.StringPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTArg = <Ctx>(
  node: TArg,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TArg => {
  if (!node) {
    throw new Error("No TArg provided");
  }

  const transformed = visitor.TArg ? visitor.TArg(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$typ = transformType(node.typ, visitor, ctx);
    changed1 = changed1 || updatedNode$typ !== node.typ;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        typ: updatedNode$typ,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TArgPost) {
    const transformed = visitor.TArgPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTArgs = <Ctx>(
  node: TArgs,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TArgs => {
  if (!node) {
    throw new Error("No TArgs provided");
  }

  const transformed = visitor.TArgs ? visitor.TArgs(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformTArg(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TArgsPost) {
    const transformed = visitor.TArgsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTLambda = <Ctx>(
  node: TLambda,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TLambda => {
  if (!node) {
    throw new Error("No TLambda provided");
  }

  const transformed = visitor.TLambda ? visitor.TLambda(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$args = null;
    const updatedNode$args$current = node.args;
    if (updatedNode$args$current != null) {
      const updatedNode$args$1$ = transformTArgs(
        updatedNode$args$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$args$1$ !== updatedNode$args$current;
      updatedNode$args = updatedNode$args$1$;
    }

    const updatedNode$result = transformType(node.result, visitor, ctx);
    changed1 = changed1 || updatedNode$result !== node.result;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        args: updatedNode$args,
        result: updatedNode$result,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TLambdaPost) {
    const transformed = visitor.TLambdaPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTBArg = <Ctx>(
  node: TBArg,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TBArg => {
  if (!node) {
    throw new Error("No TBArg provided");
  }

  const transformed = visitor.TBArg ? visitor.TBArg(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$bound = null;
    const updatedNode$bound$current = node.bound;
    if (updatedNode$bound$current != null) {
      const updatedNode$bound$1$ = transformType(
        updatedNode$bound$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
      updatedNode$bound = updatedNode$bound$1$;
    }

    let updatedNode$default_ = null;
    const updatedNode$default_$current = node.default_;
    if (updatedNode$default_$current != null) {
      const updatedNode$default_$1$ = transformType(
        updatedNode$default_$current,
        visitor,
        ctx
      );
      changed1 =
        changed1 || updatedNode$default_$1$ !== updatedNode$default_$current;
      updatedNode$default_ = updatedNode$default_$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        bound: updatedNode$bound,
        default_: updatedNode$default_,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TBArgPost) {
    const transformed = visitor.TBArgPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTBargs = <Ctx>(
  node: TBargs,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TBargs => {
  if (!node) {
    throw new Error("No TBargs provided");
  }

  const transformed = visitor.TBargs ? visitor.TBargs(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformTBArg(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TBargsPost) {
    const transformed = visitor.TBargsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTVars = <Ctx>(
  node: TVars,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TVars => {
  if (!node) {
    throw new Error("No TVars provided");
  }

  const transformed = visitor.TVars ? visitor.TVars(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$args = transformTBargs(node.args, visitor, ctx);
    changed1 = changed1 || updatedNode$args !== node.args;

    const updatedNode$inner = transformType(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        args: updatedNode$args,
        inner: updatedNode$inner,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TVarsPost) {
    const transformed = visitor.TVarsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTParens = <Ctx>(
  node: TParens,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TParens => {
  if (!node) {
    throw new Error("No TParens provided");
  }

  const transformed = visitor.TParens ? visitor.TParens(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$inner = transformType(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        inner: updatedNode$inner,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TParensPost) {
    const transformed = visitor.TParensPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTagPayload = <Ctx>(
  node: TagPayload,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TagPayload => {
  if (!node) {
    throw new Error("No TagPayload provided");
  }

  const transformed = visitor.TagPayload ? visitor.TagPayload(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$inner = transformType(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        inner: updatedNode$inner,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TagPayloadPost) {
    const transformed = visitor.TagPayloadPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTagDecl = <Ctx>(
  node: TagDecl,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TagDecl => {
  if (!node) {
    throw new Error("No TagDecl provided");
  }

  const transformed = visitor.TagDecl ? visitor.TagDecl(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$decorators = node.decorators;
    {
      let changed2 = false;
      const arr1 = node.decorators.map((updatedNode$decorators$item1) => {
        const result = transformDecorator(
          updatedNode$decorators$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$decorators$item1;
        return result;
      });
      if (changed2) {
        updatedNode$decorators = arr1;
        changed1 = true;
      }
    }

    let updatedNode$payload = null;
    const updatedNode$payload$current = node.payload;
    if (updatedNode$payload$current != null) {
      const updatedNode$payload$1$ = transformTagPayload(
        updatedNode$payload$current,
        visitor,
        ctx
      );
      changed1 =
        changed1 || updatedNode$payload$1$ !== updatedNode$payload$current;
      updatedNode$payload = updatedNode$payload$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        decorators: updatedNode$decorators,
        payload: updatedNode$payload,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TagDeclPost) {
    const transformed = visitor.TagDeclPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRecordSpread = <Ctx>(
  node: TRecordSpread,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRecordSpread => {
  if (!node) {
    throw new Error("No TRecordSpread provided");
  }

  const transformed = visitor.TRecordSpread
    ? visitor.TRecordSpread(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$inner = transformType(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        inner: updatedNode$inner,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TRecordSpreadPost) {
    const transformed = visitor.TRecordSpreadPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRecordKeyValue = <Ctx>(
  node: TRecordKeyValue,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRecordKeyValue => {
  if (!node) {
    throw new Error("No TRecordKeyValue provided");
  }

  const transformed = visitor.TRecordKeyValue
    ? visitor.TRecordKeyValue(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$value = transformType(node.value, visitor, ctx);
    changed1 = changed1 || updatedNode$value !== node.value;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        value: updatedNode$value,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TRecordKeyValuePost) {
    const transformed = visitor.TRecordKeyValuePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformStar = <Ctx>(
  node: Star,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Star => {
  if (!node) {
    throw new Error("No Star provided");
  }

  const transformed = visitor.Star ? visitor.Star(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;
    if (changed1) {
      updatedNode = { ...updatedNode, loc: updatedNode$loc };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.StarPost) {
    const transformed = visitor.StarPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRecordItem = <Ctx>(
  node: TRecordItem,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRecordItem => {
  if (!node) {
    throw new Error("No TRecordItem provided");
  }

  const transformed = visitor.TRecordItem
    ? visitor.TRecordItem(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TRecordSpread": {
      const transformed = visitor.TRecordItem_TRecordSpread
        ? visitor.TRecordItem_TRecordSpread(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRecordKeyValue": {
      const transformed = visitor.TRecordItem_TRecordKeyValue
        ? visitor.TRecordItem_TRecordKeyValue(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Star": {
      const transformed = visitor.TRecordItem_Star
        ? visitor.TRecordItem_Star(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TRecordSpread": {
      updatedNode = transformTRecordSpread(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRecordKeyValue": {
      updatedNode = transformTRecordKeyValue(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformStar(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.TRecordItemPost) {
    const transformed = visitor.TRecordItemPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRecordItems = <Ctx>(
  node: TRecordItems,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRecordItems => {
  if (!node) {
    throw new Error("No TRecordItems provided");
  }

  const transformed = visitor.TRecordItems
    ? visitor.TRecordItems(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformTRecordItem(
          updatedNode$items$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TRecordItemsPost) {
    const transformed = visitor.TRecordItemsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRecord = <Ctx>(
  node: TRecord,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRecord => {
  if (!node) {
    throw new Error("No TRecord provided");
  }

  const transformed = visitor.TRecord ? visitor.TRecord(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = null;
    const updatedNode$items$current = node.items;
    if (updatedNode$items$current != null) {
      const updatedNode$items$1$ = transformTRecordItems(
        updatedNode$items$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$items$1$ !== updatedNode$items$current;
      updatedNode$items = updatedNode$items$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TRecordPost) {
    const transformed = visitor.TRecordPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformEnumCase = <Ctx>(
  node: EnumCase,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): EnumCase => {
  if (!node) {
    throw new Error("No EnumCase provided");
  }

  const transformed = visitor.EnumCase ? visitor.EnumCase(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TagDecl": {
      const transformed = visitor.EnumCase_TagDecl
        ? visitor.EnumCase_TagDecl(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Star": {
      const transformed = visitor.EnumCase_Star
        ? visitor.EnumCase_Star(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TagDecl": {
      updatedNode = transformTagDecl(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TOps": {
      updatedNode = transformTOps_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TDecorated": {
      updatedNode = transformTDecorated(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TApply": {
      updatedNode = transformTApply_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRef": {
      updatedNode = transformTRef(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Number": {
      updatedNode = transformNumber(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "String": {
      updatedNode = transformString(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TLambda": {
      updatedNode = transformTLambda(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TVars": {
      updatedNode = transformTVars(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TParens": {
      updatedNode = transformTParens(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TEnum": {
      updatedNode = transformTEnum(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRecord": {
      updatedNode = transformTRecord(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformStar(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.EnumCasePost) {
    const transformed = visitor.EnumCasePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformEnumCases = <Ctx>(
  node: EnumCases,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): EnumCases => {
  if (!node) {
    throw new Error("No EnumCases provided");
  }

  const transformed = visitor.EnumCases ? visitor.EnumCases(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformEnumCase(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.EnumCasesPost) {
    const transformed = visitor.EnumCasesPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTEnum = <Ctx>(
  node: TEnum,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TEnum => {
  if (!node) {
    throw new Error("No TEnum provided");
  }

  const transformed = visitor.TEnum ? visitor.TEnum(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$cases = null;
    const updatedNode$cases$current = node.cases;
    if (updatedNode$cases$current != null) {
      const updatedNode$cases$1$ = transformEnumCases(
        updatedNode$cases$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$cases$1$ !== updatedNode$cases$current;
      updatedNode$cases = updatedNode$cases$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        cases: updatedNode$cases,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TEnumPost) {
    const transformed = visitor.TEnumPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTAtom = <Ctx>(
  node: TAtom,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TAtom => {
  if (!node) {
    throw new Error("No TAtom provided");
  }

  const transformed = visitor.TAtom ? visitor.TAtom(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TRef": {
      const transformed = visitor.TAtom_TRef
        ? visitor.TAtom_TRef(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Number": {
      const transformed = visitor.TAtom_Number
        ? visitor.TAtom_Number(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "String": {
      const transformed = visitor.TAtom_String
        ? visitor.TAtom_String(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TLambda": {
      const transformed = visitor.TAtom_TLambda
        ? visitor.TAtom_TLambda(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TVars": {
      const transformed = visitor.TAtom_TVars
        ? visitor.TAtom_TVars(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TParens": {
      const transformed = visitor.TAtom_TParens
        ? visitor.TAtom_TParens(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TEnum": {
      const transformed = visitor.TAtom_TEnum
        ? visitor.TAtom_TEnum(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRecord": {
      const transformed = visitor.TAtom_TRecord
        ? visitor.TAtom_TRecord(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TRef": {
      updatedNode = transformTRef(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Number": {
      updatedNode = transformNumber(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "String": {
      updatedNode = transformString(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TLambda": {
      updatedNode = transformTLambda(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TVars": {
      updatedNode = transformTVars(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TParens": {
      updatedNode = transformTParens(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TEnum": {
      updatedNode = transformTEnum(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTRecord(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.TAtomPost) {
    const transformed = visitor.TAtomPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTComma = <Ctx>(
  node: TComma,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TComma => {
  if (!node) {
    throw new Error("No TComma provided");
  }

  const transformed = visitor.TComma ? visitor.TComma(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformType(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TCommaPost) {
    const transformed = visitor.TCommaPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTApply_inner = <Ctx>(
  node: TApply_inner,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TApply_inner => {
  if (!node) {
    throw new Error("No TApply_inner provided");
  }

  const transformed = visitor.TApply_inner
    ? visitor.TApply_inner(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$inner = transformTAtom(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;

    let updatedNode$args = node.args;
    {
      let changed2 = false;
      const arr1 = node.args.map((updatedNode$args$item1) => {
        const result = transformTComma(updatedNode$args$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$args$item1;
        return result;
      });
      if (changed2) {
        updatedNode$args = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        inner: updatedNode$inner,
        args: updatedNode$args,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TApply_innerPost) {
    const transformed = visitor.TApply_innerPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTApply = <Ctx>(
  node: TApply,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TApply => {
  if (!node) {
    throw new Error("No TApply provided");
  }

  const transformed = visitor.TApply ? visitor.TApply(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TApply": {
      const transformed = visitor.TApply_TApply
        ? visitor.TApply_TApply(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TApply": {
      updatedNode = transformTApply_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTAtom(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.TApplyPost) {
    const transformed = visitor.TApplyPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTDecorated = <Ctx>(
  node: TDecorated,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TDecorated => {
  if (!node) {
    throw new Error("No TDecorated provided");
  }

  const transformed = visitor.TDecorated ? visitor.TDecorated(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$decorators = node.decorators;
    {
      let changed2 = false;
      const arr1 = node.decorators.map((updatedNode$decorators$item1) => {
        const result = transformDecorator(
          updatedNode$decorators$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$decorators$item1;
        return result;
      });
      if (changed2) {
        updatedNode$decorators = arr1;
        changed1 = true;
      }
    }

    const updatedNode$inner = transformTApply(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        decorators: updatedNode$decorators,
        inner: updatedNode$inner,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TDecoratedPost) {
    const transformed = visitor.TDecoratedPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTOpInner = <Ctx>(
  node: TOpInner,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TOpInner => {
  if (!node) {
    throw new Error("No TOpInner provided");
  }

  const transformed = visitor.TOpInner ? visitor.TOpInner(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TDecorated": {
      const transformed = visitor.TOpInner_TDecorated
        ? visitor.TOpInner_TDecorated(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TDecorated": {
      updatedNode = transformTDecorated(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTApply(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.TOpInnerPost) {
    const transformed = visitor.TOpInnerPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTRight = <Ctx>(
  node: TRight,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TRight => {
  if (!node) {
    throw new Error("No TRight provided");
  }

  const transformed = visitor.TRight ? visitor.TRight(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$right = transformTOpInner(node.right, visitor, ctx);
    changed1 = changed1 || updatedNode$right !== node.right;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        right: updatedNode$right,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TRightPost) {
    const transformed = visitor.TRightPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTOps_inner = <Ctx>(
  node: TOps_inner,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TOps_inner => {
  if (!node) {
    throw new Error("No TOps_inner provided");
  }

  const transformed = visitor.TOps_inner ? visitor.TOps_inner(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$left = transformTOpInner(node.left, visitor, ctx);
    changed1 = changed1 || updatedNode$left !== node.left;

    let updatedNode$right = node.right;
    {
      let changed2 = false;
      const arr1 = node.right.map((updatedNode$right$item1) => {
        const result = transformTRight(updatedNode$right$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$right$item1;
        return result;
      });
      if (changed2) {
        updatedNode$right = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        left: updatedNode$left,
        right: updatedNode$right,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TOps_innerPost) {
    const transformed = visitor.TOps_innerPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTOps = <Ctx>(
  node: TOps,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TOps => {
  if (!node) {
    throw new Error("No TOps provided");
  }

  const transformed = visitor.TOps ? visitor.TOps(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TOps": {
      const transformed = visitor.TOps_TOps
        ? visitor.TOps_TOps(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TOps": {
      updatedNode = transformTOps_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTOpInner(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.TOpsPost) {
    const transformed = visitor.TOpsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformType = <Ctx>(
  node: Type,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Type => {
  if (!node) {
    throw new Error("No Type provided");
  }

  const transformed = visitor.Type ? visitor.Type(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  const updatedNode = transformTOps(node, visitor, ctx);
  changed0 = changed0 || updatedNode !== node;

  node = updatedNode;
  if (visitor.TypePost) {
    const transformed = visitor.TypePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypePair = <Ctx>(
  node: TypePair,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypePair => {
  if (!node) {
    throw new Error("No TypePair provided");
  }

  const transformed = visitor.TypePair ? visitor.TypePair(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$typ = transformType(node.typ, visitor, ctx);
    changed1 = changed1 || updatedNode$typ !== node.typ;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        typ: updatedNode$typ,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypePairPost) {
    const transformed = visitor.TypePairPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeAlias = <Ctx>(
  node: TypeAlias,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeAlias => {
  if (!node) {
    throw new Error("No TypeAlias provided");
  }

  const transformed = visitor.TypeAlias ? visitor.TypeAlias(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformTypePair(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeAliasPost) {
    const transformed = visitor.TypeAliasPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformToplevel = <Ctx>(
  node: Toplevel,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Toplevel => {
  if (!node) {
    throw new Error("No Toplevel provided");
  }

  const transformed = visitor.Toplevel ? visitor.Toplevel(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TypeAlias": {
      const transformed = visitor.Toplevel_TypeAlias
        ? visitor.Toplevel_TypeAlias(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TypeAlias": {
      updatedNode = transformTypeAlias(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformExpression(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.ToplevelPost) {
    const transformed = visitor.ToplevelPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformFile = <Ctx>(
  node: File,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): File => {
  if (!node) {
    throw new Error("No File provided");
  }

  const transformed = visitor.File ? visitor.File(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$toplevels = node.toplevels;
    {
      let changed2 = false;
      const arr1 = node.toplevels.map((updatedNode$toplevels$item1) => {
        const result = transformToplevel(
          updatedNode$toplevels$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$toplevels$item1;
        return result;
      });
      if (changed2) {
        updatedNode$toplevels = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        toplevels: updatedNode$toplevels,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.FilePost) {
    const transformed = visitor.FilePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeToplevel = <Ctx>(
  node: TypeToplevel,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeToplevel => {
  if (!node) {
    throw new Error("No TypeToplevel provided");
  }

  const transformed = visitor.TypeToplevel
    ? visitor.TypeToplevel(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "TypeAlias": {
      const transformed = visitor.TypeToplevel_TypeAlias
        ? visitor.TypeToplevel_TypeAlias(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "TypeAlias": {
      updatedNode = transformTypeAlias(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformType(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.TypeToplevelPost) {
    const transformed = visitor.TypeToplevelPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeFile = <Ctx>(
  node: TypeFile,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeFile => {
  if (!node) {
    throw new Error("No TypeFile provided");
  }

  const transformed = visitor.TypeFile ? visitor.TypeFile(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$toplevels = node.toplevels;
    {
      let changed2 = false;
      const arr1 = node.toplevels.map((updatedNode$toplevels$item1) => {
        const result = transformTypeToplevel(
          updatedNode$toplevels$item1,
          visitor,
          ctx
        );
        changed2 = changed2 || result !== updatedNode$toplevels$item1;
        return result;
      });
      if (changed2) {
        updatedNode$toplevels = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        toplevels: updatedNode$toplevels,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeFilePost) {
    const transformed = visitor.TypeFilePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transform_lineEnd = <Ctx>(
  node: _lineEnd,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): _lineEnd => {
  if (!node) {
    throw new Error("No _lineEnd provided");
  }

  const transformed = visitor._lineEnd ? visitor._lineEnd(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor._lineEndPost) {
    const transformed = visitor._lineEndPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transform_EOF = <Ctx>(
  node: _EOF,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): _EOF => {
  if (!node) {
    throw new Error("No _EOF provided");
  }

  const transformed = visitor._EOF ? visitor._EOF(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor._EOFPost) {
    const transformed = visitor._EOFPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformnewline = <Ctx>(
  node: newline,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): newline => {
  if (!node) {
    throw new Error("No newline provided");
  }

  const transformed = visitor.newline ? visitor.newline(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.newlinePost) {
    const transformed = visitor.newlinePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transform_nonnewline = <Ctx>(
  node: _nonnewline,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): _nonnewline => {
  if (!node) {
    throw new Error("No _nonnewline provided");
  }

  const transformed = visitor._nonnewline
    ? visitor._nonnewline(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor._nonnewlinePost) {
    const transformed = visitor._nonnewlinePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transform_ = <Ctx>(
  node: _,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): _ => {
  if (!node) {
    throw new Error("No _ provided");
  }

  const transformed = visitor._ ? visitor._(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor._Post) {
    const transformed = visitor._Post(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transform__ = <Ctx>(
  node: __,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): __ => {
  if (!node) {
    throw new Error("No __ provided");
  }

  const transformed = visitor.__ ? visitor.__(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.__Post) {
    const transformed = visitor.__Post(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformlineComment = <Ctx>(
  node: lineComment,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): lineComment => {
  if (!node) {
    throw new Error("No lineComment provided");
  }

  const transformed = visitor.lineComment
    ? visitor.lineComment(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.lineCommentPost) {
    const transformed = visitor.lineCommentPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformcomment = <Ctx>(
  node: comment,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): comment => {
  if (!node) {
    throw new Error("No comment provided");
  }

  const transformed = visitor.comment ? visitor.comment(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.commentPost) {
    const transformed = visitor.commentPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformmultiLineComment = <Ctx>(
  node: multiLineComment,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): multiLineComment => {
  if (!node) {
    throw new Error("No multiLineComment provided");
  }

  const transformed = visitor.multiLineComment
    ? visitor.multiLineComment(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.multiLineCommentPost) {
    const transformed = visitor.multiLineCommentPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformfinalLineComment = <Ctx>(
  node: finalLineComment,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): finalLineComment => {
  if (!node) {
    throw new Error("No finalLineComment provided");
  }

  const transformed = visitor.finalLineComment
    ? visitor.finalLineComment(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.finalLineCommentPost) {
    const transformed = visitor.finalLineCommentPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformtplStringChars = <Ctx>(
  node: tplStringChars,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): tplStringChars => {
  if (!node) {
    throw new Error("No tplStringChars provided");
  }

  const transformed = visitor.tplStringChars
    ? visitor.tplStringChars(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.tplStringCharsPost) {
    const transformed = visitor.tplStringCharsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformstringChar = <Ctx>(
  node: stringChar,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): stringChar => {
  if (!node) {
    throw new Error("No stringChar provided");
  }

  const transformed = visitor.stringChar ? visitor.stringChar(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.stringCharPost) {
    const transformed = visitor.stringCharPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeVbl = <Ctx>(
  node: TypeVbl,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeVbl => {
  if (!node) {
    throw new Error("No TypeVbl provided");
  }

  const transformed = visitor.TypeVbl ? visitor.TypeVbl(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$vbl = transformIdentifier(node.vbl, visitor, ctx);
    changed1 = changed1 || updatedNode$vbl !== node.vbl;

    let updatedNode$bound = null;
    const updatedNode$bound$current = node.bound;
    if (updatedNode$bound$current != null) {
      const updatedNode$bound$1$ = transformType(
        updatedNode$bound$current,
        visitor,
        ctx
      );
      changed1 = changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
      updatedNode$bound = updatedNode$bound$1$;
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        vbl: updatedNode$vbl,
        bound: updatedNode$bound,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeVblPost) {
    const transformed = visitor.TypeVblPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeVbls = <Ctx>(
  node: TypeVbls,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeVbls => {
  if (!node) {
    throw new Error("No TypeVbls provided");
  }

  const transformed = visitor.TypeVbls ? visitor.TypeVbls(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    let updatedNode$items = node.items;
    {
      let changed2 = false;
      const arr1 = node.items.map((updatedNode$items$item1) => {
        const result = transformTypeVbl(updatedNode$items$item1, visitor, ctx);
        changed2 = changed2 || result !== updatedNode$items$item1;
        return result;
      });
      if (changed2) {
        updatedNode$items = arr1;
        changed1 = true;
      }
    }

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        items: updatedNode$items,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeVblsPost) {
    const transformed = visitor.TypeVblsPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeVariables = <Ctx>(
  node: TypeVariables,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeVariables => {
  if (!node) {
    throw new Error("No TypeVariables provided");
  }

  const transformed = visitor.TypeVariables
    ? visitor.TypeVariables(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
    changed1 = changed1 || updatedNode$loc !== node.loc;

    const updatedNode$vbls = transformTypeVbls(node.vbls, visitor, ctx);
    changed1 = changed1 || updatedNode$vbls !== node.vbls;

    const updatedNode$body = transformExpression(node.body, visitor, ctx);
    changed1 = changed1 || updatedNode$body !== node.body;
    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        vbls: updatedNode$vbls,
        body: updatedNode$body,
      };
      changed0 = true;
    }
  }

  node = updatedNode;
  if (visitor.TypeVariablesPost) {
    const transformed = visitor.TypeVariablesPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformtop = <Ctx>(
  node: top,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): top => {
  if (!node) {
    throw new Error("No top provided");
  }

  const transformed = visitor.top ? visitor.top(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;
  const updatedNode = node;

  node = updatedNode;
  if (visitor.topPost) {
    const transformed = visitor.topPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformAllTaggedTypes = <Ctx>(
  node: AllTaggedTypes,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): AllTaggedTypes => {
  if (!node) {
    throw new Error("No AllTaggedTypes provided");
  }

  const transformed = visitor.AllTaggedTypes
    ? visitor.AllTaggedTypes(node, ctx)
    : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
      ctx = transformed[1];
      if (transformed[0] != null) {
        node = transformed[0];
      }
    } else {
      node = transformed;
    }
  }

  let changed0 = false;

  switch (node.type) {
    case "File": {
      const transformed = visitor.AllTaggedTypes_File
        ? visitor.AllTaggedTypes_File(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeFile": {
      const transformed = visitor.AllTaggedTypes_TypeFile
        ? visitor.AllTaggedTypes_TypeFile(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Apply": {
      const transformed = visitor.AllTaggedTypes_Apply
        ? visitor.AllTaggedTypes_Apply(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "CallSuffix": {
      const transformed = visitor.AllTaggedTypes_CallSuffix
        ? visitor.AllTaggedTypes_CallSuffix(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "CommaExpr": {
      const transformed = visitor.AllTaggedTypes_CommaExpr
        ? visitor.AllTaggedTypes_CommaExpr(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Identifier": {
      const transformed = visitor.AllTaggedTypes_Identifier
        ? visitor.AllTaggedTypes_Identifier(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "ParenedExpression": {
      const transformed = visitor.AllTaggedTypes_ParenedExpression
        ? visitor.AllTaggedTypes_ParenedExpression(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Boolean": {
      const transformed = visitor.AllTaggedTypes_Boolean
        ? visitor.AllTaggedTypes_Boolean(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Number": {
      const transformed = visitor.AllTaggedTypes_Number
        ? visitor.AllTaggedTypes_Number(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "String": {
      const transformed = visitor.AllTaggedTypes_String
        ? visitor.AllTaggedTypes_String(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TemplateString": {
      const transformed = visitor.AllTaggedTypes_TemplateString
        ? visitor.AllTaggedTypes_TemplateString(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TemplatePair": {
      const transformed = visitor.AllTaggedTypes_TemplatePair
        ? visitor.AllTaggedTypes_TemplatePair(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TemplateWrap": {
      const transformed = visitor.AllTaggedTypes_TemplateWrap
        ? visitor.AllTaggedTypes_TemplateWrap(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "DecoratedExpression": {
      const transformed = visitor.AllTaggedTypes_DecoratedExpression
        ? visitor.AllTaggedTypes_DecoratedExpression(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Decorator": {
      const transformed = visitor.AllTaggedTypes_Decorator
        ? visitor.AllTaggedTypes_Decorator(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "DecoratorId": {
      const transformed = visitor.AllTaggedTypes_DecoratorId
        ? visitor.AllTaggedTypes_DecoratorId(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "DecoratorArgs": {
      const transformed = visitor.AllTaggedTypes_DecoratorArgs
        ? visitor.AllTaggedTypes_DecoratorArgs(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "LabeledDecoratorArg": {
      const transformed = visitor.AllTaggedTypes_LabeledDecoratorArg
        ? visitor.AllTaggedTypes_LabeledDecoratorArg(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "DecType": {
      const transformed = visitor.AllTaggedTypes_DecType
        ? visitor.AllTaggedTypes_DecType(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "DecExpr": {
      const transformed = visitor.AllTaggedTypes_DecExpr
        ? visitor.AllTaggedTypes_DecExpr(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Enum": {
      const transformed = visitor.AllTaggedTypes_Enum
        ? visitor.AllTaggedTypes_Enum(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TEnum": {
      const transformed = visitor.AllTaggedTypes_TEnum
        ? visitor.AllTaggedTypes_TEnum(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "EnumCases": {
      const transformed = visitor.AllTaggedTypes_EnumCases
        ? visitor.AllTaggedTypes_EnumCases(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TagDecl": {
      const transformed = visitor.AllTaggedTypes_TagDecl
        ? visitor.AllTaggedTypes_TagDecl(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TagPayload": {
      const transformed = visitor.AllTaggedTypes_TagPayload
        ? visitor.AllTaggedTypes_TagPayload(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "Star": {
      const transformed = visitor.AllTaggedTypes_Star
        ? visitor.AllTaggedTypes_Star(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeApplicationSuffix": {
      const transformed = visitor.AllTaggedTypes_TypeApplicationSuffix
        ? visitor.AllTaggedTypes_TypeApplicationSuffix(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeAppVbls": {
      const transformed = visitor.AllTaggedTypes_TypeAppVbls
        ? visitor.AllTaggedTypes_TypeAppVbls(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeVariables": {
      const transformed = visitor.AllTaggedTypes_TypeVariables
        ? visitor.AllTaggedTypes_TypeVariables(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeVbls": {
      const transformed = visitor.AllTaggedTypes_TypeVbls
        ? visitor.AllTaggedTypes_TypeVbls(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeVbl": {
      const transformed = visitor.AllTaggedTypes_TypeVbl
        ? visitor.AllTaggedTypes_TypeVbl(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRecord": {
      const transformed = visitor.AllTaggedTypes_TRecord
        ? visitor.AllTaggedTypes_TRecord(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRecordItems": {
      const transformed = visitor.AllTaggedTypes_TRecordItems
        ? visitor.AllTaggedTypes_TRecordItems(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRecordSpread": {
      const transformed = visitor.AllTaggedTypes_TRecordSpread
        ? visitor.AllTaggedTypes_TRecordSpread(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRecordKeyValue": {
      const transformed = visitor.AllTaggedTypes_TRecordKeyValue
        ? visitor.AllTaggedTypes_TRecordKeyValue(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TApply": {
      const transformed = visitor.AllTaggedTypes_TApply
        ? visitor.AllTaggedTypes_TApply(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TComma": {
      const transformed = visitor.AllTaggedTypes_TComma
        ? visitor.AllTaggedTypes_TComma(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TVars": {
      const transformed = visitor.AllTaggedTypes_TVars
        ? visitor.AllTaggedTypes_TVars(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TBargs": {
      const transformed = visitor.AllTaggedTypes_TBargs
        ? visitor.AllTaggedTypes_TBargs(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TBArg": {
      const transformed = visitor.AllTaggedTypes_TBArg
        ? visitor.AllTaggedTypes_TBArg(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TDecorated": {
      const transformed = visitor.AllTaggedTypes_TDecorated
        ? visitor.AllTaggedTypes_TDecorated(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRef": {
      const transformed = visitor.AllTaggedTypes_TRef
        ? visitor.AllTaggedTypes_TRef(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TOps": {
      const transformed = visitor.AllTaggedTypes_TOps
        ? visitor.AllTaggedTypes_TOps(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TRight": {
      const transformed = visitor.AllTaggedTypes_TRight
        ? visitor.AllTaggedTypes_TRight(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TParens": {
      const transformed = visitor.AllTaggedTypes_TParens
        ? visitor.AllTaggedTypes_TParens(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TArg": {
      const transformed = visitor.AllTaggedTypes_TArg
        ? visitor.AllTaggedTypes_TArg(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TArgs": {
      const transformed = visitor.AllTaggedTypes_TArgs
        ? visitor.AllTaggedTypes_TArgs(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TLambda": {
      const transformed = visitor.AllTaggedTypes_TLambda
        ? visitor.AllTaggedTypes_TLambda(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypeAlias": {
      const transformed = visitor.AllTaggedTypes_TypeAlias
        ? visitor.AllTaggedTypes_TypeAlias(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }

    case "TypePair": {
      const transformed = visitor.AllTaggedTypes_TypePair
        ? visitor.AllTaggedTypes_TypePair(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
          }
        } else if (transformed == false) {
          return node;
        } else {
          node = transformed;
        }
      }
      break;
    }
  }

  let updatedNode = node;

  switch (node.type) {
    case "File": {
      updatedNode = transformFile(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeFile": {
      updatedNode = transformTypeFile(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Apply": {
      updatedNode = transformApply_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "CallSuffix": {
      updatedNode = transformCallSuffix(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "CommaExpr": {
      updatedNode = transformCommaExpr(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Identifier": {
      updatedNode = transformIdentifier(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "ParenedExpression": {
      updatedNode = transformParenedExpression(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Boolean": {
      updatedNode = transformBoolean(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Number": {
      updatedNode = transformNumber(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "String": {
      updatedNode = transformString(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TemplateString": {
      updatedNode = transformTemplateString(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TemplatePair": {
      updatedNode = transformTemplatePair(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TemplateWrap": {
      updatedNode = transformTemplateWrap(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "DecoratedExpression": {
      updatedNode = transformDecoratedExpression_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Decorator": {
      updatedNode = transformDecorator(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "DecoratorId": {
      updatedNode = transformDecoratorId(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "DecoratorArgs": {
      updatedNode = transformDecoratorArgs(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "LabeledDecoratorArg": {
      updatedNode = transformLabeledDecoratorArg(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "DecType": {
      updatedNode = transformDecType(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "DecExpr": {
      updatedNode = transformDecExpr(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Enum": {
      updatedNode = transformEnum(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TEnum": {
      updatedNode = transformTEnum(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "EnumCases": {
      updatedNode = transformEnumCases(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TagDecl": {
      updatedNode = transformTagDecl(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TagPayload": {
      updatedNode = transformTagPayload(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Star": {
      updatedNode = transformStar(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeApplicationSuffix": {
      updatedNode = transformTypeApplicationSuffix(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeAppVbls": {
      updatedNode = transformTypeAppVbls(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeVariables": {
      updatedNode = transformTypeVariables(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeVbls": {
      updatedNode = transformTypeVbls(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeVbl": {
      updatedNode = transformTypeVbl(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRecord": {
      updatedNode = transformTRecord(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRecordItems": {
      updatedNode = transformTRecordItems(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRecordSpread": {
      updatedNode = transformTRecordSpread(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRecordKeyValue": {
      updatedNode = transformTRecordKeyValue(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TApply": {
      updatedNode = transformTApply_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TComma": {
      updatedNode = transformTComma(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TVars": {
      updatedNode = transformTVars(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TBargs": {
      updatedNode = transformTBargs(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TBArg": {
      updatedNode = transformTBArg(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TDecorated": {
      updatedNode = transformTDecorated(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRef": {
      updatedNode = transformTRef(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TOps": {
      updatedNode = transformTOps_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TRight": {
      updatedNode = transformTRight(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TParens": {
      updatedNode = transformTParens(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TArg": {
      updatedNode = transformTArg(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TArgs": {
      updatedNode = transformTArgs(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TLambda": {
      updatedNode = transformTLambda(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeAlias": {
      updatedNode = transformTypeAlias(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTypePair(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
    }
  }

  node = updatedNode;
  if (visitor.AllTaggedTypesPost) {
    const transformed = visitor.AllTaggedTypesPost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};
