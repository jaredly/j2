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
    Lambda,
    LArgs,
    LArg,
    Pattern,
    PName,
    PTuple,
    PTupleItems,
    PRecord,
    PRecordFields,
    PRecordField,
    PRecordValue,
    PBlank,
    PHash,
    BinOp,
    BinOp_inner,
    WithUnary,
    WithUnary_inner,
    UnaryOpWithHash,
    UnaryOp,
    IdHash,
    DecoratedExpression,
    DecoratedExpression_inner,
    Apply,
    Apply_inner,
    Atom,
    If,
    Block,
    Stmts,
    Stmt,
    Let,
    Else,
    Number,
    Boolean,
    Identifier,
    ParenedOp,
    binopWithHash,
    binop,
    ParenedExpression,
    CommaExpr,
    TemplateString,
    TemplatePair,
    TemplateWrap,
    Enum,
    EnumPayload,
    Record,
    RecordItems,
    RecordItem,
    RecordSpread,
    RecordKeyValue,
    Suffix,
    CallSuffix,
    TypeApplicationSuffix,
    TypeAppVbls,
    BinOpRight,
    TApply,
    TApply_inner,
    TAtom,
    TBlank,
    TRef,
    String,
    TLambda,
    TArgs,
    TArg,
    TVars,
    TBargs,
    TBArg,
    TParens,
    TComma,
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
    TRight,
    ToplevelLet,
    LetPair,
    TypeFile,
    TypeToplevel,
    _lineEnd,
    _EOF,
    AttrText,
    Binop,
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
    PRecordPattern,
    top,
    AllTaggedTypes,
} from './grammar/base.parser';

export type Visitor<Ctx> = {
    SyntaxError?: (
        node: SyntaxError,
        ctx: Ctx,
    ) => null | false | SyntaxError | [SyntaxError | null, Ctx];
    SyntaxErrorPost?: (node: SyntaxError, ctx: Ctx) => null | SyntaxError;
    Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx];
    LocPost?: (node: Loc, ctx: Ctx) => null | Loc;
    File?: (node: File, ctx: Ctx) => null | false | File | [File | null, Ctx];
    FilePost?: (node: File, ctx: Ctx) => null | File;
    TypeFile?: (
        node: TypeFile,
        ctx: Ctx,
    ) => null | false | TypeFile | [TypeFile | null, Ctx];
    TypeFilePost?: (node: TypeFile, ctx: Ctx) => null | TypeFile;
    Apply_inner?: (
        node: Apply_inner,
        ctx: Ctx,
    ) => null | false | Apply_inner | [Apply_inner | null, Ctx];
    Apply_innerPost?: (node: Apply_inner, ctx: Ctx) => null | Apply_inner;
    Apply?: (
        node: Apply,
        ctx: Ctx,
    ) => null | false | Apply | [Apply | null, Ctx];
    ApplyPost?: (node: Apply, ctx: Ctx) => null | Apply;
    Suffix?: (
        node: Suffix,
        ctx: Ctx,
    ) => null | false | Suffix | [Suffix | null, Ctx];
    SuffixPost?: (node: Suffix, ctx: Ctx) => null | Suffix;
    CallSuffix?: (
        node: CallSuffix,
        ctx: Ctx,
    ) => null | false | CallSuffix | [CallSuffix | null, Ctx];
    CallSuffixPost?: (node: CallSuffix, ctx: Ctx) => null | CallSuffix;
    CommaExpr?: (
        node: CommaExpr,
        ctx: Ctx,
    ) => null | false | CommaExpr | [CommaExpr | null, Ctx];
    CommaExprPost?: (node: CommaExpr, ctx: Ctx) => null | CommaExpr;
    _lineEnd?: (
        node: _lineEnd,
        ctx: Ctx,
    ) => null | false | _lineEnd | [_lineEnd | null, Ctx];
    _lineEndPost?: (node: _lineEnd, ctx: Ctx) => null | _lineEnd;
    _EOF?: (node: _EOF, ctx: Ctx) => null | false | _EOF | [_EOF | null, Ctx];
    _EOFPost?: (node: _EOF, ctx: Ctx) => null | _EOF;
    Toplevel?: (
        node: Toplevel,
        ctx: Ctx,
    ) => null | false | Toplevel | [Toplevel | null, Ctx];
    ToplevelPost?: (node: Toplevel, ctx: Ctx) => null | Toplevel;
    TypeToplevel?: (
        node: TypeToplevel,
        ctx: Ctx,
    ) => null | false | TypeToplevel | [TypeToplevel | null, Ctx];
    TypeToplevelPost?: (node: TypeToplevel, ctx: Ctx) => null | TypeToplevel;
    Expression?: (
        node: Expression,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost?: (node: Expression, ctx: Ctx) => null | Expression;
    Identifier?: (
        node: Identifier,
        ctx: Ctx,
    ) => null | false | Identifier | [Identifier | null, Ctx];
    IdentifierPost?: (node: Identifier, ctx: Ctx) => null | Identifier;
    IdHash?: (
        node: IdHash,
        ctx: Ctx,
    ) => null | false | IdHash | [IdHash | null, Ctx];
    IdHashPost?: (node: IdHash, ctx: Ctx) => null | IdHash;
    Atom?: (node: Atom, ctx: Ctx) => null | false | Atom | [Atom | null, Ctx];
    AtomPost?: (node: Atom, ctx: Ctx) => null | Atom;
    ParenedExpression?: (
        node: ParenedExpression,
        ctx: Ctx,
    ) => null | false | ParenedExpression | [ParenedExpression | null, Ctx];
    ParenedExpressionPost?: (
        node: ParenedExpression,
        ctx: Ctx,
    ) => null | ParenedExpression;
    AttrText?: (
        node: AttrText,
        ctx: Ctx,
    ) => null | false | AttrText | [AttrText | null, Ctx];
    AttrTextPost?: (node: AttrText, ctx: Ctx) => null | AttrText;
    BinOp_inner?: (
        node: BinOp_inner,
        ctx: Ctx,
    ) => null | false | BinOp_inner | [BinOp_inner | null, Ctx];
    BinOp_innerPost?: (node: BinOp_inner, ctx: Ctx) => null | BinOp_inner;
    BinOp?: (
        node: BinOp,
        ctx: Ctx,
    ) => null | false | BinOp | [BinOp | null, Ctx];
    BinOpPost?: (node: BinOp, ctx: Ctx) => null | BinOp;
    BinOpRight?: (
        node: BinOpRight,
        ctx: Ctx,
    ) => null | false | BinOpRight | [BinOpRight | null, Ctx];
    BinOpRightPost?: (node: BinOpRight, ctx: Ctx) => null | BinOpRight;
    WithUnary_inner?: (
        node: WithUnary_inner,
        ctx: Ctx,
    ) => null | false | WithUnary_inner | [WithUnary_inner | null, Ctx];
    WithUnary_innerPost?: (
        node: WithUnary_inner,
        ctx: Ctx,
    ) => null | WithUnary_inner;
    WithUnary?: (
        node: WithUnary,
        ctx: Ctx,
    ) => null | false | WithUnary | [WithUnary | null, Ctx];
    WithUnaryPost?: (node: WithUnary, ctx: Ctx) => null | WithUnary;
    UnaryOpWithHash?: (
        node: UnaryOpWithHash,
        ctx: Ctx,
    ) => null | false | UnaryOpWithHash | [UnaryOpWithHash | null, Ctx];
    UnaryOpWithHashPost?: (
        node: UnaryOpWithHash,
        ctx: Ctx,
    ) => null | UnaryOpWithHash;
    UnaryOp?: (
        node: UnaryOp,
        ctx: Ctx,
    ) => null | false | UnaryOp | [UnaryOp | null, Ctx];
    UnaryOpPost?: (node: UnaryOp, ctx: Ctx) => null | UnaryOp;
    binopWithHash?: (
        node: binopWithHash,
        ctx: Ctx,
    ) => null | false | binopWithHash | [binopWithHash | null, Ctx];
    binopWithHashPost?: (node: binopWithHash, ctx: Ctx) => null | binopWithHash;
    binop?: (
        node: binop,
        ctx: Ctx,
    ) => null | false | binop | [binop | null, Ctx];
    binopPost?: (node: binop, ctx: Ctx) => null | binop;
    ParenedOp?: (
        node: ParenedOp,
        ctx: Ctx,
    ) => null | false | ParenedOp | [ParenedOp | null, Ctx];
    ParenedOpPost?: (node: ParenedOp, ctx: Ctx) => null | ParenedOp;
    Binop?: (
        node: Binop,
        ctx: Ctx,
    ) => null | false | Binop | [Binop | null, Ctx];
    BinopPost?: (node: Binop, ctx: Ctx) => null | Binop;
    newline?: (
        node: newline,
        ctx: Ctx,
    ) => null | false | newline | [newline | null, Ctx];
    newlinePost?: (node: newline, ctx: Ctx) => null | newline;
    _nonnewline?: (
        node: _nonnewline,
        ctx: Ctx,
    ) => null | false | _nonnewline | [_nonnewline | null, Ctx];
    _nonnewlinePost?: (node: _nonnewline, ctx: Ctx) => null | _nonnewline;
    _?: (node: _, ctx: Ctx) => null | false | _ | [_ | null, Ctx];
    _Post?: (node: _, ctx: Ctx) => null | _;
    __?: (node: __, ctx: Ctx) => null | false | __ | [__ | null, Ctx];
    __Post?: (node: __, ctx: Ctx) => null | __;
    comment?: (
        node: comment,
        ctx: Ctx,
    ) => null | false | comment | [comment | null, Ctx];
    commentPost?: (node: comment, ctx: Ctx) => null | comment;
    multiLineComment?: (
        node: multiLineComment,
        ctx: Ctx,
    ) => null | false | multiLineComment | [multiLineComment | null, Ctx];
    multiLineCommentPost?: (
        node: multiLineComment,
        ctx: Ctx,
    ) => null | multiLineComment;
    lineComment?: (
        node: lineComment,
        ctx: Ctx,
    ) => null | false | lineComment | [lineComment | null, Ctx];
    lineCommentPost?: (node: lineComment, ctx: Ctx) => null | lineComment;
    finalLineComment?: (
        node: finalLineComment,
        ctx: Ctx,
    ) => null | false | finalLineComment | [finalLineComment | null, Ctx];
    finalLineCommentPost?: (
        node: finalLineComment,
        ctx: Ctx,
    ) => null | finalLineComment;
    Boolean?: (
        node: Boolean,
        ctx: Ctx,
    ) => null | false | Boolean | [Boolean | null, Ctx];
    BooleanPost?: (node: Boolean, ctx: Ctx) => null | Boolean;
    Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Number | [Number | null, Ctx];
    NumberPost?: (node: Number, ctx: Ctx) => null | Number;
    String?: (
        node: String,
        ctx: Ctx,
    ) => null | false | String | [String | null, Ctx];
    StringPost?: (node: String, ctx: Ctx) => null | String;
    TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | false | TemplateString | [TemplateString | null, Ctx];
    TemplateStringPost?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | TemplateString;
    TemplatePair?: (
        node: TemplatePair,
        ctx: Ctx,
    ) => null | false | TemplatePair | [TemplatePair | null, Ctx];
    TemplatePairPost?: (node: TemplatePair, ctx: Ctx) => null | TemplatePair;
    TemplateWrap?: (
        node: TemplateWrap,
        ctx: Ctx,
    ) => null | false | TemplateWrap | [TemplateWrap | null, Ctx];
    TemplateWrapPost?: (node: TemplateWrap, ctx: Ctx) => null | TemplateWrap;
    tplStringChars?: (
        node: tplStringChars,
        ctx: Ctx,
    ) => null | false | tplStringChars | [tplStringChars | null, Ctx];
    tplStringCharsPost?: (
        node: tplStringChars,
        ctx: Ctx,
    ) => null | tplStringChars;
    stringChar?: (
        node: stringChar,
        ctx: Ctx,
    ) => null | false | stringChar | [stringChar | null, Ctx];
    stringCharPost?: (node: stringChar, ctx: Ctx) => null | stringChar;
    DecoratedExpression_inner?: (
        node: DecoratedExpression_inner,
        ctx: Ctx,
    ) =>
        | null
        | false
        | DecoratedExpression_inner
        | [DecoratedExpression_inner | null, Ctx];
    DecoratedExpression_innerPost?: (
        node: DecoratedExpression_inner,
        ctx: Ctx,
    ) => null | DecoratedExpression_inner;
    DecoratedExpression?: (
        node: DecoratedExpression,
        ctx: Ctx,
    ) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx];
    DecoratedExpressionPost?: (
        node: DecoratedExpression,
        ctx: Ctx,
    ) => null | DecoratedExpression;
    Decorator?: (
        node: Decorator,
        ctx: Ctx,
    ) => null | false | Decorator | [Decorator | null, Ctx];
    DecoratorPost?: (node: Decorator, ctx: Ctx) => null | Decorator;
    DecoratorId?: (
        node: DecoratorId,
        ctx: Ctx,
    ) => null | false | DecoratorId | [DecoratorId | null, Ctx];
    DecoratorIdPost?: (node: DecoratorId, ctx: Ctx) => null | DecoratorId;
    DecoratorArgs?: (
        node: DecoratorArgs,
        ctx: Ctx,
    ) => null | false | DecoratorArgs | [DecoratorArgs | null, Ctx];
    DecoratorArgsPost?: (node: DecoratorArgs, ctx: Ctx) => null | DecoratorArgs;
    DecoratorArg?: (
        node: DecoratorArg,
        ctx: Ctx,
    ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
    DecoratorArgPost?: (node: DecoratorArg, ctx: Ctx) => null | DecoratorArg;
    LabeledDecoratorArg?: (
        node: LabeledDecoratorArg,
        ctx: Ctx,
    ) => null | false | LabeledDecoratorArg | [LabeledDecoratorArg | null, Ctx];
    LabeledDecoratorArgPost?: (
        node: LabeledDecoratorArg,
        ctx: Ctx,
    ) => null | LabeledDecoratorArg;
    DecType?: (
        node: DecType,
        ctx: Ctx,
    ) => null | false | DecType | [DecType | null, Ctx];
    DecTypePost?: (node: DecType, ctx: Ctx) => null | DecType;
    DecExpr?: (
        node: DecExpr,
        ctx: Ctx,
    ) => null | false | DecExpr | [DecExpr | null, Ctx];
    DecExprPost?: (node: DecExpr, ctx: Ctx) => null | DecExpr;
    Enum?: (node: Enum, ctx: Ctx) => null | false | Enum | [Enum | null, Ctx];
    EnumPost?: (node: Enum, ctx: Ctx) => null | Enum;
    EnumPayload?: (
        node: EnumPayload,
        ctx: Ctx,
    ) => null | false | EnumPayload | [EnumPayload | null, Ctx];
    EnumPayloadPost?: (node: EnumPayload, ctx: Ctx) => null | EnumPayload;
    TEnum?: (
        node: TEnum,
        ctx: Ctx,
    ) => null | false | TEnum | [TEnum | null, Ctx];
    TEnumPost?: (node: TEnum, ctx: Ctx) => null | TEnum;
    EnumCases?: (
        node: EnumCases,
        ctx: Ctx,
    ) => null | false | EnumCases | [EnumCases | null, Ctx];
    EnumCasesPost?: (node: EnumCases, ctx: Ctx) => null | EnumCases;
    EnumCase?: (
        node: EnumCase,
        ctx: Ctx,
    ) => null | false | EnumCase | [EnumCase | null, Ctx];
    EnumCasePost?: (node: EnumCase, ctx: Ctx) => null | EnumCase;
    TagDecl?: (
        node: TagDecl,
        ctx: Ctx,
    ) => null | false | TagDecl | [TagDecl | null, Ctx];
    TagDeclPost?: (node: TagDecl, ctx: Ctx) => null | TagDecl;
    TagPayload?: (
        node: TagPayload,
        ctx: Ctx,
    ) => null | false | TagPayload | [TagPayload | null, Ctx];
    TagPayloadPost?: (node: TagPayload, ctx: Ctx) => null | TagPayload;
    Star?: (node: Star, ctx: Ctx) => null | false | Star | [Star | null, Ctx];
    StarPost?: (node: Star, ctx: Ctx) => null | Star;
    TypeApplicationSuffix?: (
        node: TypeApplicationSuffix,
        ctx: Ctx,
    ) =>
        | null
        | false
        | TypeApplicationSuffix
        | [TypeApplicationSuffix | null, Ctx];
    TypeApplicationSuffixPost?: (
        node: TypeApplicationSuffix,
        ctx: Ctx,
    ) => null | TypeApplicationSuffix;
    TypeAppVbls?: (
        node: TypeAppVbls,
        ctx: Ctx,
    ) => null | false | TypeAppVbls | [TypeAppVbls | null, Ctx];
    TypeAppVblsPost?: (node: TypeAppVbls, ctx: Ctx) => null | TypeAppVbls;
    TypeVariables?: (
        node: TypeVariables,
        ctx: Ctx,
    ) => null | false | TypeVariables | [TypeVariables | null, Ctx];
    TypeVariablesPost?: (node: TypeVariables, ctx: Ctx) => null | TypeVariables;
    TypeVbls?: (
        node: TypeVbls,
        ctx: Ctx,
    ) => null | false | TypeVbls | [TypeVbls | null, Ctx];
    TypeVblsPost?: (node: TypeVbls, ctx: Ctx) => null | TypeVbls;
    TypeVbl?: (
        node: TypeVbl,
        ctx: Ctx,
    ) => null | false | TypeVbl | [TypeVbl | null, Ctx];
    TypeVblPost?: (node: TypeVbl, ctx: Ctx) => null | TypeVbl;
    If?: (node: If, ctx: Ctx) => null | false | If | [If | null, Ctx];
    IfPost?: (node: If, ctx: Ctx) => null | If;
    Else?: (node: Else, ctx: Ctx) => null | false | Else | [Else | null, Ctx];
    ElsePost?: (node: Else, ctx: Ctx) => null | Else;
    Lambda?: (
        node: Lambda,
        ctx: Ctx,
    ) => null | false | Lambda | [Lambda | null, Ctx];
    LambdaPost?: (node: Lambda, ctx: Ctx) => null | Lambda;
    LArgs?: (
        node: LArgs,
        ctx: Ctx,
    ) => null | false | LArgs | [LArgs | null, Ctx];
    LArgsPost?: (node: LArgs, ctx: Ctx) => null | LArgs;
    LArg?: (node: LArg, ctx: Ctx) => null | false | LArg | [LArg | null, Ctx];
    LArgPost?: (node: LArg, ctx: Ctx) => null | LArg;
    Block?: (
        node: Block,
        ctx: Ctx,
    ) => null | false | Block | [Block | null, Ctx];
    BlockPost?: (node: Block, ctx: Ctx) => null | Block;
    Stmts?: (
        node: Stmts,
        ctx: Ctx,
    ) => null | false | Stmts | [Stmts | null, Ctx];
    StmtsPost?: (node: Stmts, ctx: Ctx) => null | Stmts;
    Stmt?: (node: Stmt, ctx: Ctx) => null | false | Stmt | [Stmt | null, Ctx];
    StmtPost?: (node: Stmt, ctx: Ctx) => null | Stmt;
    Let?: (node: Let, ctx: Ctx) => null | false | Let | [Let | null, Ctx];
    LetPost?: (node: Let, ctx: Ctx) => null | Let;
    ToplevelLet?: (
        node: ToplevelLet,
        ctx: Ctx,
    ) => null | false | ToplevelLet | [ToplevelLet | null, Ctx];
    ToplevelLetPost?: (node: ToplevelLet, ctx: Ctx) => null | ToplevelLet;
    LetPair?: (
        node: LetPair,
        ctx: Ctx,
    ) => null | false | LetPair | [LetPair | null, Ctx];
    LetPairPost?: (node: LetPair, ctx: Ctx) => null | LetPair;
    Pattern?: (
        node: Pattern,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost?: (node: Pattern, ctx: Ctx) => null | Pattern;
    PBlank?: (
        node: PBlank,
        ctx: Ctx,
    ) => null | false | PBlank | [PBlank | null, Ctx];
    PBlankPost?: (node: PBlank, ctx: Ctx) => null | PBlank;
    PName?: (
        node: PName,
        ctx: Ctx,
    ) => null | false | PName | [PName | null, Ctx];
    PNamePost?: (node: PName, ctx: Ctx) => null | PName;
    PTuple?: (
        node: PTuple,
        ctx: Ctx,
    ) => null | false | PTuple | [PTuple | null, Ctx];
    PTuplePost?: (node: PTuple, ctx: Ctx) => null | PTuple;
    PTupleItems?: (
        node: PTupleItems,
        ctx: Ctx,
    ) => null | false | PTupleItems | [PTupleItems | null, Ctx];
    PTupleItemsPost?: (node: PTupleItems, ctx: Ctx) => null | PTupleItems;
    PRecord?: (
        node: PRecord,
        ctx: Ctx,
    ) => null | false | PRecord | [PRecord | null, Ctx];
    PRecordPost?: (node: PRecord, ctx: Ctx) => null | PRecord;
    PRecordFields?: (
        node: PRecordFields,
        ctx: Ctx,
    ) => null | false | PRecordFields | [PRecordFields | null, Ctx];
    PRecordFieldsPost?: (node: PRecordFields, ctx: Ctx) => null | PRecordFields;
    PRecordField?: (
        node: PRecordField,
        ctx: Ctx,
    ) => null | false | PRecordField | [PRecordField | null, Ctx];
    PRecordFieldPost?: (node: PRecordField, ctx: Ctx) => null | PRecordField;
    PRecordValue?: (
        node: PRecordValue,
        ctx: Ctx,
    ) => null | false | PRecordValue | [PRecordValue | null, Ctx];
    PRecordValuePost?: (node: PRecordValue, ctx: Ctx) => null | PRecordValue;
    PRecordPattern?: (
        node: PRecordPattern,
        ctx: Ctx,
    ) => null | false | PRecordPattern | [PRecordPattern | null, Ctx];
    PRecordPatternPost?: (
        node: PRecordPattern,
        ctx: Ctx,
    ) => null | PRecordPattern;
    PHash?: (
        node: PHash,
        ctx: Ctx,
    ) => null | false | PHash | [PHash | null, Ctx];
    PHashPost?: (node: PHash, ctx: Ctx) => null | PHash;
    Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | Record | [Record | null, Ctx];
    RecordPost?: (node: Record, ctx: Ctx) => null | Record;
    RecordItems?: (
        node: RecordItems,
        ctx: Ctx,
    ) => null | false | RecordItems | [RecordItems | null, Ctx];
    RecordItemsPost?: (node: RecordItems, ctx: Ctx) => null | RecordItems;
    RecordItem?: (
        node: RecordItem,
        ctx: Ctx,
    ) => null | false | RecordItem | [RecordItem | null, Ctx];
    RecordItemPost?: (node: RecordItem, ctx: Ctx) => null | RecordItem;
    RecordSpread?: (
        node: RecordSpread,
        ctx: Ctx,
    ) => null | false | RecordSpread | [RecordSpread | null, Ctx];
    RecordSpreadPost?: (node: RecordSpread, ctx: Ctx) => null | RecordSpread;
    RecordKeyValue?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | false | RecordKeyValue | [RecordKeyValue | null, Ctx];
    RecordKeyValuePost?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | RecordKeyValue;
    TRecord?: (
        node: TRecord,
        ctx: Ctx,
    ) => null | false | TRecord | [TRecord | null, Ctx];
    TRecordPost?: (node: TRecord, ctx: Ctx) => null | TRecord;
    TRecordItems?: (
        node: TRecordItems,
        ctx: Ctx,
    ) => null | false | TRecordItems | [TRecordItems | null, Ctx];
    TRecordItemsPost?: (node: TRecordItems, ctx: Ctx) => null | TRecordItems;
    TRecordItem?: (
        node: TRecordItem,
        ctx: Ctx,
    ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
    TRecordItemPost?: (node: TRecordItem, ctx: Ctx) => null | TRecordItem;
    TRecordSpread?: (
        node: TRecordSpread,
        ctx: Ctx,
    ) => null | false | TRecordSpread | [TRecordSpread | null, Ctx];
    TRecordSpreadPost?: (node: TRecordSpread, ctx: Ctx) => null | TRecordSpread;
    TRecordKeyValue?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | false | TRecordKeyValue | [TRecordKeyValue | null, Ctx];
    TRecordKeyValuePost?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | TRecordKeyValue;
    TApply_inner?: (
        node: TApply_inner,
        ctx: Ctx,
    ) => null | false | TApply_inner | [TApply_inner | null, Ctx];
    TApply_innerPost?: (node: TApply_inner, ctx: Ctx) => null | TApply_inner;
    TApply?: (
        node: TApply,
        ctx: Ctx,
    ) => null | false | TApply | [TApply | null, Ctx];
    TApplyPost?: (node: TApply, ctx: Ctx) => null | TApply;
    TComma?: (
        node: TComma,
        ctx: Ctx,
    ) => null | false | TComma | [TComma | null, Ctx];
    TCommaPost?: (node: TComma, ctx: Ctx) => null | TComma;
    TVars?: (
        node: TVars,
        ctx: Ctx,
    ) => null | false | TVars | [TVars | null, Ctx];
    TVarsPost?: (node: TVars, ctx: Ctx) => null | TVars;
    TBargs?: (
        node: TBargs,
        ctx: Ctx,
    ) => null | false | TBargs | [TBargs | null, Ctx];
    TBargsPost?: (node: TBargs, ctx: Ctx) => null | TBargs;
    TBArg?: (
        node: TBArg,
        ctx: Ctx,
    ) => null | false | TBArg | [TBArg | null, Ctx];
    TBArgPost?: (node: TBArg, ctx: Ctx) => null | TBArg;
    Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx];
    TypePost?: (node: Type, ctx: Ctx) => null | Type;
    TDecorated?: (
        node: TDecorated,
        ctx: Ctx,
    ) => null | false | TDecorated | [TDecorated | null, Ctx];
    TDecoratedPost?: (node: TDecorated, ctx: Ctx) => null | TDecorated;
    TAtom?: (
        node: TAtom,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost?: (node: TAtom, ctx: Ctx) => null | TAtom;
    TRef?: (node: TRef, ctx: Ctx) => null | false | TRef | [TRef | null, Ctx];
    TRefPost?: (node: TRef, ctx: Ctx) => null | TRef;
    TOps_inner?: (
        node: TOps_inner,
        ctx: Ctx,
    ) => null | false | TOps_inner | [TOps_inner | null, Ctx];
    TOps_innerPost?: (node: TOps_inner, ctx: Ctx) => null | TOps_inner;
    TOps?: (node: TOps, ctx: Ctx) => null | false | TOps | [TOps | null, Ctx];
    TOpsPost?: (node: TOps, ctx: Ctx) => null | TOps;
    TRight?: (
        node: TRight,
        ctx: Ctx,
    ) => null | false | TRight | [TRight | null, Ctx];
    TRightPost?: (node: TRight, ctx: Ctx) => null | TRight;
    top?: (node: top, ctx: Ctx) => null | false | top | [top | null, Ctx];
    topPost?: (node: top, ctx: Ctx) => null | top;
    TOpInner?: (
        node: TOpInner,
        ctx: Ctx,
    ) => null | false | TOpInner | [TOpInner | null, Ctx];
    TOpInnerPost?: (node: TOpInner, ctx: Ctx) => null | TOpInner;
    TParens?: (
        node: TParens,
        ctx: Ctx,
    ) => null | false | TParens | [TParens | null, Ctx];
    TParensPost?: (node: TParens, ctx: Ctx) => null | TParens;
    TArg?: (node: TArg, ctx: Ctx) => null | false | TArg | [TArg | null, Ctx];
    TArgPost?: (node: TArg, ctx: Ctx) => null | TArg;
    TArgs?: (
        node: TArgs,
        ctx: Ctx,
    ) => null | false | TArgs | [TArgs | null, Ctx];
    TArgsPost?: (node: TArgs, ctx: Ctx) => null | TArgs;
    TLambda?: (
        node: TLambda,
        ctx: Ctx,
    ) => null | false | TLambda | [TLambda | null, Ctx];
    TLambdaPost?: (node: TLambda, ctx: Ctx) => null | TLambda;
    TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | false | TypeAlias | [TypeAlias | null, Ctx];
    TypeAliasPost?: (node: TypeAlias, ctx: Ctx) => null | TypeAlias;
    TypePair?: (
        node: TypePair,
        ctx: Ctx,
    ) => null | false | TypePair | [TypePair | null, Ctx];
    TypePairPost?: (node: TypePair, ctx: Ctx) => null | TypePair;
    TBlank?: (
        node: TBlank,
        ctx: Ctx,
    ) => null | false | TBlank | [TBlank | null, Ctx];
    TBlankPost?: (node: TBlank, ctx: Ctx) => null | TBlank;
    AllTaggedTypes?: (
        node: AllTaggedTypes,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost?: (
        node: AllTaggedTypes,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    Apply_Apply?: (
        node: Apply_inner,
        ctx: Ctx,
    ) => null | false | Apply | [Apply | null, Ctx];
    ApplyPost_Apply?: (node: Apply_inner, ctx: Ctx) => null | Apply;
    Suffix_CallSuffix?: (
        node: CallSuffix,
        ctx: Ctx,
    ) => null | false | Suffix | [Suffix | null, Ctx];
    SuffixPost_CallSuffix?: (node: CallSuffix, ctx: Ctx) => null | Suffix;
    Suffix_TypeApplicationSuffix?: (
        node: TypeApplicationSuffix,
        ctx: Ctx,
    ) => null | false | Suffix | [Suffix | null, Ctx];
    SuffixPost_TypeApplicationSuffix?: (
        node: TypeApplicationSuffix,
        ctx: Ctx,
    ) => null | Suffix;
    Toplevel_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | false | Toplevel | [Toplevel | null, Ctx];
    ToplevelPost_TypeAlias?: (node: TypeAlias, ctx: Ctx) => null | Toplevel;
    Toplevel_ToplevelLet?: (
        node: ToplevelLet,
        ctx: Ctx,
    ) => null | false | Toplevel | [Toplevel | null, Ctx];
    ToplevelPost_ToplevelLet?: (node: ToplevelLet, ctx: Ctx) => null | Toplevel;
    TypeToplevel_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | false | TypeToplevel | [TypeToplevel | null, Ctx];
    TypeToplevelPost_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | TypeToplevel;
    Expression_Lambda?: (
        node: Lambda,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Lambda?: (node: Lambda, ctx: Ctx) => null | Expression;
    Atom_If?: (node: If, ctx: Ctx) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_If?: (node: If, ctx: Ctx) => null | Atom;
    Atom_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_Number?: (node: Number, ctx: Ctx) => null | Atom;
    Atom_Boolean?: (
        node: Boolean,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_Boolean?: (node: Boolean, ctx: Ctx) => null | Atom;
    Atom_Identifier?: (
        node: Identifier,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_Identifier?: (node: Identifier, ctx: Ctx) => null | Atom;
    Atom_ParenedOp?: (
        node: ParenedOp,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_ParenedOp?: (node: ParenedOp, ctx: Ctx) => null | Atom;
    Atom_ParenedExpression?: (
        node: ParenedExpression,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_ParenedExpression?: (
        node: ParenedExpression,
        ctx: Ctx,
    ) => null | Atom;
    Atom_TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_TemplateString?: (node: TemplateString, ctx: Ctx) => null | Atom;
    Atom_Enum?: (
        node: Enum,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_Enum?: (node: Enum, ctx: Ctx) => null | Atom;
    Atom_Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_Record?: (node: Record, ctx: Ctx) => null | Atom;
    Atom_Block?: (
        node: Block,
        ctx: Ctx,
    ) => null | false | Atom | [Atom | null, Ctx];
    AtomPost_Block?: (node: Block, ctx: Ctx) => null | Atom;
    BinOp_BinOp?: (
        node: BinOp_inner,
        ctx: Ctx,
    ) => null | false | BinOp | [BinOp | null, Ctx];
    BinOpPost_BinOp?: (node: BinOp_inner, ctx: Ctx) => null | BinOp;
    WithUnary_WithUnary?: (
        node: WithUnary_inner,
        ctx: Ctx,
    ) => null | false | WithUnary | [WithUnary | null, Ctx];
    WithUnaryPost_WithUnary?: (
        node: WithUnary_inner,
        ctx: Ctx,
    ) => null | WithUnary;
    DecoratedExpression_DecoratedExpression?: (
        node: DecoratedExpression_inner,
        ctx: Ctx,
    ) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx];
    DecoratedExpressionPost_DecoratedExpression?: (
        node: DecoratedExpression_inner,
        ctx: Ctx,
    ) => null | DecoratedExpression;
    DecoratorArg_DecType?: (
        node: DecType,
        ctx: Ctx,
    ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
    DecoratorArgPost_DecType?: (node: DecType, ctx: Ctx) => null | DecoratorArg;
    DecoratorArg_DecExpr?: (
        node: DecExpr,
        ctx: Ctx,
    ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
    DecoratorArgPost_DecExpr?: (node: DecExpr, ctx: Ctx) => null | DecoratorArg;
    EnumCase_TagDecl?: (
        node: TagDecl,
        ctx: Ctx,
    ) => null | false | EnumCase | [EnumCase | null, Ctx];
    EnumCasePost_TagDecl?: (node: TagDecl, ctx: Ctx) => null | EnumCase;
    EnumCase_Star?: (
        node: Star,
        ctx: Ctx,
    ) => null | false | EnumCase | [EnumCase | null, Ctx];
    EnumCasePost_Star?: (node: Star, ctx: Ctx) => null | EnumCase;
    Else_Block?: (
        node: Block,
        ctx: Ctx,
    ) => null | false | Else | [Else | null, Ctx];
    ElsePost_Block?: (node: Block, ctx: Ctx) => null | Else;
    Else_If?: (node: If, ctx: Ctx) => null | false | Else | [Else | null, Ctx];
    ElsePost_If?: (node: If, ctx: Ctx) => null | Else;
    Stmt_Let?: (
        node: Let,
        ctx: Ctx,
    ) => null | false | Stmt | [Stmt | null, Ctx];
    StmtPost_Let?: (node: Let, ctx: Ctx) => null | Stmt;
    Pattern_PName?: (
        node: PName,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PName?: (node: PName, ctx: Ctx) => null | Pattern;
    Pattern_PTuple?: (
        node: PTuple,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PTuple?: (node: PTuple, ctx: Ctx) => null | Pattern;
    Pattern_PRecord?: (
        node: PRecord,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PRecord?: (node: PRecord, ctx: Ctx) => null | Pattern;
    Pattern_PBlank?: (
        node: PBlank,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PBlank?: (node: PBlank, ctx: Ctx) => null | Pattern;
    PRecordValue_PHash?: (
        node: PHash,
        ctx: Ctx,
    ) => null | false | PRecordValue | [PRecordValue | null, Ctx];
    PRecordValuePost_PHash?: (node: PHash, ctx: Ctx) => null | PRecordValue;
    RecordItem_RecordSpread?: (
        node: RecordSpread,
        ctx: Ctx,
    ) => null | false | RecordItem | [RecordItem | null, Ctx];
    RecordItemPost_RecordSpread?: (
        node: RecordSpread,
        ctx: Ctx,
    ) => null | RecordItem;
    RecordItem_RecordKeyValue?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | false | RecordItem | [RecordItem | null, Ctx];
    RecordItemPost_RecordKeyValue?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | RecordItem;
    TRecordItem_TRecordSpread?: (
        node: TRecordSpread,
        ctx: Ctx,
    ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
    TRecordItemPost_TRecordSpread?: (
        node: TRecordSpread,
        ctx: Ctx,
    ) => null | TRecordItem;
    TRecordItem_TRecordKeyValue?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
    TRecordItemPost_TRecordKeyValue?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | TRecordItem;
    TRecordItem_Star?: (
        node: Star,
        ctx: Ctx,
    ) => null | false | TRecordItem | [TRecordItem | null, Ctx];
    TRecordItemPost_Star?: (node: Star, ctx: Ctx) => null | TRecordItem;
    TApply_TApply?: (
        node: TApply_inner,
        ctx: Ctx,
    ) => null | false | TApply | [TApply | null, Ctx];
    TApplyPost_TApply?: (node: TApply_inner, ctx: Ctx) => null | TApply;
    TAtom_TBlank?: (
        node: TBlank,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TBlank?: (node: TBlank, ctx: Ctx) => null | TAtom;
    TAtom_TRef?: (
        node: TRef,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TRef?: (node: TRef, ctx: Ctx) => null | TAtom;
    TAtom_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_Number?: (node: Number, ctx: Ctx) => null | TAtom;
    TAtom_String?: (
        node: String,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_String?: (node: String, ctx: Ctx) => null | TAtom;
    TAtom_TLambda?: (
        node: TLambda,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TLambda?: (node: TLambda, ctx: Ctx) => null | TAtom;
    TAtom_TVars?: (
        node: TVars,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TVars?: (node: TVars, ctx: Ctx) => null | TAtom;
    TAtom_TParens?: (
        node: TParens,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TParens?: (node: TParens, ctx: Ctx) => null | TAtom;
    TAtom_TEnum?: (
        node: TEnum,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TEnum?: (node: TEnum, ctx: Ctx) => null | TAtom;
    TAtom_TRecord?: (
        node: TRecord,
        ctx: Ctx,
    ) => null | false | TAtom | [TAtom | null, Ctx];
    TAtomPost_TRecord?: (node: TRecord, ctx: Ctx) => null | TAtom;
    TOps_TOps?: (
        node: TOps_inner,
        ctx: Ctx,
    ) => null | false | TOps | [TOps | null, Ctx];
    TOpsPost_TOps?: (node: TOps_inner, ctx: Ctx) => null | TOps;
    TOpInner_TDecorated?: (
        node: TDecorated,
        ctx: Ctx,
    ) => null | false | TOpInner | [TOpInner | null, Ctx];
    TOpInnerPost_TDecorated?: (node: TDecorated, ctx: Ctx) => null | TOpInner;
    AllTaggedTypes_File?: (
        node: File,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_File?: (node: File, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TypeFile?: (
        node: TypeFile,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeFile?: (
        node: TypeFile,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Apply?: (
        node: Apply_inner,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Apply?: (
        node: Apply_inner,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_CallSuffix?: (
        node: CallSuffix,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_CallSuffix?: (
        node: CallSuffix,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_CommaExpr?: (
        node: CommaExpr,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_CommaExpr?: (
        node: CommaExpr,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Identifier?: (
        node: Identifier,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Identifier?: (
        node: Identifier,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_ParenedExpression?: (
        node: ParenedExpression,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_ParenedExpression?: (
        node: ParenedExpression,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_BinOp?: (
        node: BinOp_inner,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_BinOp?: (
        node: BinOp_inner,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_BinOpRight?: (
        node: BinOpRight,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_BinOpRight?: (
        node: BinOpRight,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_WithUnary?: (
        node: WithUnary_inner,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_WithUnary?: (
        node: WithUnary_inner,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_UnaryOpWithHash?: (
        node: UnaryOpWithHash,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_UnaryOpWithHash?: (
        node: UnaryOpWithHash,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_binopWithHash?: (
        node: binopWithHash,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_binopWithHash?: (
        node: binopWithHash,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_ParenedOp?: (
        node: ParenedOp,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_ParenedOp?: (
        node: ParenedOp,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Boolean?: (
        node: Boolean,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Boolean?: (
        node: Boolean,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_String?: (
        node: String,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_String?: (
        node: String,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TemplatePair?: (
        node: TemplatePair,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TemplatePair?: (
        node: TemplatePair,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TemplateWrap?: (
        node: TemplateWrap,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TemplateWrap?: (
        node: TemplateWrap,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_DecoratedExpression?: (
        node: DecoratedExpression_inner,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_DecoratedExpression?: (
        node: DecoratedExpression_inner,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Decorator?: (
        node: Decorator,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Decorator?: (
        node: Decorator,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_DecoratorId?: (
        node: DecoratorId,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_DecoratorId?: (
        node: DecoratorId,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_DecoratorArgs?: (
        node: DecoratorArgs,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_DecoratorArgs?: (
        node: DecoratorArgs,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_LabeledDecoratorArg?: (
        node: LabeledDecoratorArg,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_LabeledDecoratorArg?: (
        node: LabeledDecoratorArg,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_DecType?: (
        node: DecType,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_DecType?: (
        node: DecType,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_DecExpr?: (
        node: DecExpr,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_DecExpr?: (
        node: DecExpr,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Enum?: (
        node: Enum,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Enum?: (node: Enum, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_EnumPayload?: (
        node: EnumPayload,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_EnumPayload?: (
        node: EnumPayload,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TEnum?: (
        node: TEnum,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TEnum?: (node: TEnum, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_EnumCases?: (
        node: EnumCases,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_EnumCases?: (
        node: EnumCases,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TagDecl?: (
        node: TagDecl,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TagDecl?: (
        node: TagDecl,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TagPayload?: (
        node: TagPayload,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TagPayload?: (
        node: TagPayload,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_Star?: (
        node: Star,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Star?: (node: Star, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TypeApplicationSuffix?: (
        node: TypeApplicationSuffix,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeApplicationSuffix?: (
        node: TypeApplicationSuffix,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TypeAppVbls?: (
        node: TypeAppVbls,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeAppVbls?: (
        node: TypeAppVbls,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TypeVariables?: (
        node: TypeVariables,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeVariables?: (
        node: TypeVariables,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TypeVbls?: (
        node: TypeVbls,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeVbls?: (
        node: TypeVbls,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TypeVbl?: (
        node: TypeVbl,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeVbl?: (
        node: TypeVbl,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_If?: (
        node: If,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_If?: (node: If, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_Lambda?: (
        node: Lambda,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Lambda?: (
        node: Lambda,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_LArgs?: (
        node: LArgs,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_LArgs?: (node: LArgs, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_LArg?: (
        node: LArg,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_LArg?: (node: LArg, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_Block?: (
        node: Block,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Block?: (node: Block, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_Stmts?: (
        node: Stmts,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Stmts?: (node: Stmts, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_Let?: (
        node: Let,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Let?: (node: Let, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_ToplevelLet?: (
        node: ToplevelLet,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_ToplevelLet?: (
        node: ToplevelLet,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_LetPair?: (
        node: LetPair,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_LetPair?: (
        node: LetPair,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PBlank?: (
        node: PBlank,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PBlank?: (
        node: PBlank,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PName?: (
        node: PName,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PName?: (node: PName, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_PTuple?: (
        node: PTuple,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PTuple?: (
        node: PTuple,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PTupleItems?: (
        node: PTupleItems,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PTupleItems?: (
        node: PTupleItems,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PRecord?: (
        node: PRecord,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PRecord?: (
        node: PRecord,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PRecordFields?: (
        node: PRecordFields,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PRecordFields?: (
        node: PRecordFields,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PRecordField?: (
        node: PRecordField,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PRecordField?: (
        node: PRecordField,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_PHash?: (
        node: PHash,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_PHash?: (node: PHash, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_RecordItems?: (
        node: RecordItems,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_RecordItems?: (
        node: RecordItems,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_RecordSpread?: (
        node: RecordSpread,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_RecordSpread?: (
        node: RecordSpread,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_RecordKeyValue?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_RecordKeyValue?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TRecord?: (
        node: TRecord,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TRecord?: (
        node: TRecord,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TRecordItems?: (
        node: TRecordItems,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TRecordItems?: (
        node: TRecordItems,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TRecordSpread?: (
        node: TRecordSpread,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TRecordSpread?: (
        node: TRecordSpread,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TRecordKeyValue?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TRecordKeyValue?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TApply?: (
        node: TApply_inner,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TApply?: (
        node: TApply_inner,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TComma?: (
        node: TComma,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TComma?: (
        node: TComma,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TVars?: (
        node: TVars,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TVars?: (node: TVars, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TBargs?: (
        node: TBargs,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TBargs?: (
        node: TBargs,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TBArg?: (
        node: TBArg,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TBArg?: (node: TBArg, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TDecorated?: (
        node: TDecorated,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TDecorated?: (
        node: TDecorated,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TRef?: (
        node: TRef,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TRef?: (node: TRef, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TOps?: (
        node: TOps_inner,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TOps?: (
        node: TOps_inner,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TRight?: (
        node: TRight,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TRight?: (
        node: TRight,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TParens?: (
        node: TParens,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TParens?: (
        node: TParens,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TArg?: (
        node: TArg,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TArg?: (node: TArg, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TArgs?: (
        node: TArgs,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TArgs?: (node: TArgs, ctx: Ctx) => null | AllTaggedTypes;
    AllTaggedTypes_TLambda?: (
        node: TLambda,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TLambda?: (
        node: TLambda,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TypePair?: (
        node: TypePair,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TypePair?: (
        node: TypePair,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
    AllTaggedTypes_TBlank?: (
        node: TBlank,
        ctx: Ctx,
    ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
    AllTaggedTypesPost_TBlank?: (
        node: TBlank,
        ctx: Ctx,
    ) => null | AllTaggedTypes;
};
export const transformLoc = <Ctx>(
    node: Loc,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Loc => {
    if (!node) {
        throw new Error('No Loc provided');
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
    ctx: Ctx,
): SyntaxError => {
    if (!node) {
        throw new Error('No SyntaxError provided');
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
    ctx: Ctx,
): DecoratorId => {
    if (!node) {
        throw new Error('No DecoratorId provided');
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
    ctx: Ctx,
): DecType => {
    if (!node) {
        throw new Error('No DecType provided');
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

export const transformPName = <Ctx>(
    node: PName,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PName => {
    if (!node) {
        throw new Error('No PName provided');
    }

    const transformed = visitor.PName ? visitor.PName(node, ctx) : null;
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
    if (visitor.PNamePost) {
        const transformed = visitor.PNamePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPTupleItems = <Ctx>(
    node: PTupleItems,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PTupleItems => {
    if (!node) {
        throw new Error('No PTupleItems provided');
    }

    const transformed = visitor.PTupleItems
        ? visitor.PTupleItems(node, ctx)
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
                const result = transformPattern(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.PTupleItemsPost) {
        const transformed = visitor.PTupleItemsPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPTuple = <Ctx>(
    node: PTuple,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PTuple => {
    if (!node) {
        throw new Error('No PTuple provided');
    }

    const transformed = visitor.PTuple ? visitor.PTuple(node, ctx) : null;
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
            const updatedNode$items$1$ = transformPTupleItems(
                updatedNode$items$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    if (visitor.PTuplePost) {
        const transformed = visitor.PTuplePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPBlank = <Ctx>(
    node: PBlank,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PBlank => {
    if (!node) {
        throw new Error('No PBlank provided');
    }

    const transformed = visitor.PBlank ? visitor.PBlank(node, ctx) : null;
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
    if (visitor.PBlankPost) {
        const transformed = visitor.PBlankPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPHash = <Ctx>(
    node: PHash,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PHash => {
    if (!node) {
        throw new Error('No PHash provided');
    }

    const transformed = visitor.PHash ? visitor.PHash(node, ctx) : null;
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
    if (visitor.PHashPost) {
        const transformed = visitor.PHashPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPRecordValue = <Ctx>(
    node: PRecordValue,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PRecordValue => {
    if (!node) {
        throw new Error('No PRecordValue provided');
    }

    const transformed = visitor.PRecordValue
        ? visitor.PRecordValue(node, ctx)
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
        case 'PHash': {
            const transformed = visitor.PRecordValue_PHash
                ? visitor.PRecordValue_PHash(node, ctx)
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
        case 'PName': {
            updatedNode = transformPName(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PTuple': {
            updatedNode = transformPTuple(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PRecord': {
            updatedNode = transformPRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PBlank': {
            updatedNode = transformPBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformPHash(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'PHash': {
            const transformed = visitor.PRecordValuePost_PHash
                ? visitor.PRecordValuePost_PHash(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.PRecordValuePost) {
        const transformed = visitor.PRecordValuePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPRecordField = <Ctx>(
    node: PRecordField,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PRecordField => {
    if (!node) {
        throw new Error('No PRecordField provided');
    }

    const transformed = visitor.PRecordField
        ? visitor.PRecordField(node, ctx)
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

        let updatedNode$pat = null;
        const updatedNode$pat$current = node.pat;
        if (updatedNode$pat$current != null) {
            const updatedNode$pat$1$ = transformPRecordValue(
                updatedNode$pat$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$pat$1$ !== updatedNode$pat$current;
            updatedNode$pat = updatedNode$pat$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                pat: updatedNode$pat,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.PRecordFieldPost) {
        const transformed = visitor.PRecordFieldPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPRecordFields = <Ctx>(
    node: PRecordFields,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PRecordFields => {
    if (!node) {
        throw new Error('No PRecordFields provided');
    }

    const transformed = visitor.PRecordFields
        ? visitor.PRecordFields(node, ctx)
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
                const result = transformPRecordField(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.PRecordFieldsPost) {
        const transformed = visitor.PRecordFieldsPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPRecord = <Ctx>(
    node: PRecord,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PRecord => {
    if (!node) {
        throw new Error('No PRecord provided');
    }

    const transformed = visitor.PRecord ? visitor.PRecord(node, ctx) : null;
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

        let updatedNode$fields = null;
        const updatedNode$fields$current = node.fields;
        if (updatedNode$fields$current != null) {
            const updatedNode$fields$1$ = transformPRecordFields(
                updatedNode$fields$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$fields$1$ !== updatedNode$fields$current;
            updatedNode$fields = updatedNode$fields$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                fields: updatedNode$fields,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.PRecordPost) {
        const transformed = visitor.PRecordPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPattern = <Ctx>(
    node: Pattern,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Pattern => {
    if (!node) {
        throw new Error('No Pattern provided');
    }

    const transformed = visitor.Pattern ? visitor.Pattern(node, ctx) : null;
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
        case 'PName': {
            const transformed = visitor.Pattern_PName
                ? visitor.Pattern_PName(node, ctx)
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

        case 'PTuple': {
            const transformed = visitor.Pattern_PTuple
                ? visitor.Pattern_PTuple(node, ctx)
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

        case 'PRecord': {
            const transformed = visitor.Pattern_PRecord
                ? visitor.Pattern_PRecord(node, ctx)
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

        case 'PBlank': {
            const transformed = visitor.Pattern_PBlank
                ? visitor.Pattern_PBlank(node, ctx)
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
        case 'PName': {
            updatedNode = transformPName(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PTuple': {
            updatedNode = transformPTuple(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PRecord': {
            updatedNode = transformPRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformPBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'PName': {
            const transformed = visitor.PatternPost_PName
                ? visitor.PatternPost_PName(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PTuple': {
            const transformed = visitor.PatternPost_PTuple
                ? visitor.PatternPost_PTuple(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PRecord': {
            const transformed = visitor.PatternPost_PRecord
                ? visitor.PatternPost_PRecord(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PBlank': {
            const transformed = visitor.PatternPost_PBlank
                ? visitor.PatternPost_PBlank(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.PatternPost) {
        const transformed = visitor.PatternPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformLArg = <Ctx>(
    node: LArg,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): LArg => {
    if (!node) {
        throw new Error('No LArg provided');
    }

    const transformed = visitor.LArg ? visitor.LArg(node, ctx) : null;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        let updatedNode$typ = null;
        const updatedNode$typ$current = node.typ;
        if (updatedNode$typ$current != null) {
            const updatedNode$typ$1$ = transformType(
                updatedNode$typ$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$typ$1$ !== updatedNode$typ$current;
            updatedNode$typ = updatedNode$typ$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                pat: updatedNode$pat,
                typ: updatedNode$typ,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.LArgPost) {
        const transformed = visitor.LArgPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformLArgs = <Ctx>(
    node: LArgs,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): LArgs => {
    if (!node) {
        throw new Error('No LArgs provided');
    }

    const transformed = visitor.LArgs ? visitor.LArgs(node, ctx) : null;
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
                const result = transformLArg(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.LArgsPost) {
        const transformed = visitor.LArgsPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformLambda = <Ctx>(
    node: Lambda,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Lambda => {
    if (!node) {
        throw new Error('No Lambda provided');
    }

    const transformed = visitor.Lambda ? visitor.Lambda(node, ctx) : null;
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
            const updatedNode$args$1$ = transformLArgs(
                updatedNode$args$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$args$1$ !== updatedNode$args$current;
            updatedNode$args = updatedNode$args$1$;
        }

        let updatedNode$res = null;
        const updatedNode$res$current = node.res;
        if (updatedNode$res$current != null) {
            const updatedNode$res$1$ = transformType(
                updatedNode$res$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$res$1$ !== updatedNode$res$current;
            updatedNode$res = updatedNode$res$1$;
        }

        const updatedNode$body = transformExpression(node.body, visitor, ctx);
        changed1 = changed1 || updatedNode$body !== node.body;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                args: updatedNode$args,
                res: updatedNode$res,
                body: updatedNode$body,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.LambdaPost) {
        const transformed = visitor.LambdaPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformUnaryOp = <Ctx>(
    node: UnaryOp,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): UnaryOp => {
    if (!node) {
        throw new Error('No UnaryOp provided');
    }

    const transformed = visitor.UnaryOp ? visitor.UnaryOp(node, ctx) : null;
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
    if (visitor.UnaryOpPost) {
        const transformed = visitor.UnaryOpPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIdHash = <Ctx>(
    node: IdHash,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IdHash => {
    if (!node) {
        throw new Error('No IdHash provided');
    }

    const transformed = visitor.IdHash ? visitor.IdHash(node, ctx) : null;
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
    if (visitor.IdHashPost) {
        const transformed = visitor.IdHashPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformUnaryOpWithHash = <Ctx>(
    node: UnaryOpWithHash,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): UnaryOpWithHash => {
    if (!node) {
        throw new Error('No UnaryOpWithHash provided');
    }

    const transformed = visitor.UnaryOpWithHash
        ? visitor.UnaryOpWithHash(node, ctx)
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

        const updatedNode$op = transformUnaryOp(node.op, visitor, ctx);
        changed1 = changed1 || updatedNode$op !== node.op;

        let updatedNode$hash = null;
        const updatedNode$hash$current = node.hash;
        if (updatedNode$hash$current != null) {
            const updatedNode$hash$1$ = transformIdHash(
                updatedNode$hash$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$hash$1$ !== updatedNode$hash$current;
            updatedNode$hash = updatedNode$hash$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                op: updatedNode$op,
                hash: updatedNode$hash,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.UnaryOpWithHashPost) {
        const transformed = visitor.UnaryOpWithHashPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformLet = <Ctx>(
    node: Let,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Let => {
    if (!node) {
        throw new Error('No Let provided');
    }

    const transformed = visitor.Let ? visitor.Let(node, ctx) : null;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                pat: updatedNode$pat,
                expr: updatedNode$expr,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.LetPost) {
        const transformed = visitor.LetPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformStmt = <Ctx>(
    node: Stmt,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Stmt => {
    if (!node) {
        throw new Error('No Stmt provided');
    }

    const transformed = visitor.Stmt ? visitor.Stmt(node, ctx) : null;
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
        case 'Let': {
            const transformed = visitor.Stmt_Let
                ? visitor.Stmt_Let(node, ctx)
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
        case 'Let': {
            updatedNode = transformLet(node, visitor, ctx);
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

    switch (updatedNode.type) {
        case 'Let': {
            const transformed = visitor.StmtPost_Let
                ? visitor.StmtPost_Let(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.StmtPost) {
        const transformed = visitor.StmtPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformStmts = <Ctx>(
    node: Stmts,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Stmts => {
    if (!node) {
        throw new Error('No Stmts provided');
    }

    const transformed = visitor.Stmts ? visitor.Stmts(node, ctx) : null;
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
                const result = transformStmt(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.StmtsPost) {
        const transformed = visitor.StmtsPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformBlock = <Ctx>(
    node: Block,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Block => {
    if (!node) {
        throw new Error('No Block provided');
    }

    const transformed = visitor.Block ? visitor.Block(node, ctx) : null;
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

        let updatedNode$stmts = null;
        const updatedNode$stmts$current = node.stmts;
        if (updatedNode$stmts$current != null) {
            const updatedNode$stmts$1$ = transformStmts(
                updatedNode$stmts$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$stmts$1$ !== updatedNode$stmts$current;
            updatedNode$stmts = updatedNode$stmts$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                stmts: updatedNode$stmts,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.BlockPost) {
        const transformed = visitor.BlockPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformElse = <Ctx>(
    node: Else,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Else => {
    if (!node) {
        throw new Error('No Else provided');
    }

    const transformed = visitor.Else ? visitor.Else(node, ctx) : null;
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
        case 'Block': {
            const transformed = visitor.Else_Block
                ? visitor.Else_Block(node, ctx)
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

        case 'If': {
            const transformed = visitor.Else_If
                ? visitor.Else_If(node, ctx)
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
        case 'Block': {
            updatedNode = transformBlock(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformIf(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'Block': {
            const transformed = visitor.ElsePost_Block
                ? visitor.ElsePost_Block(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'If': {
            const transformed = visitor.ElsePost_If
                ? visitor.ElsePost_If(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.ElsePost) {
        const transformed = visitor.ElsePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIf = <Ctx>(
    node: If,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): If => {
    if (!node) {
        throw new Error('No If provided');
    }

    const transformed = visitor.If ? visitor.If(node, ctx) : null;
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

        const updatedNode$cond = transformExpression(node.cond, visitor, ctx);
        changed1 = changed1 || updatedNode$cond !== node.cond;

        const updatedNode$yes = transformBlock(node.yes, visitor, ctx);
        changed1 = changed1 || updatedNode$yes !== node.yes;

        let updatedNode$no = null;
        const updatedNode$no$current = node.no;
        if (updatedNode$no$current != null) {
            const updatedNode$no$1$ = transformElse(
                updatedNode$no$current,
                visitor,
                ctx,
            );
            changed1 = changed1 || updatedNode$no$1$ !== updatedNode$no$current;
            updatedNode$no = updatedNode$no$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                cond: updatedNode$cond,
                yes: updatedNode$yes,
                no: updatedNode$no,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IfPost) {
        const transformed = visitor.IfPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformNumber = <Ctx>(
    node: Number,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Number => {
    if (!node) {
        throw new Error('No Number provided');
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
    ctx: Ctx,
): Boolean => {
    if (!node) {
        throw new Error('No Boolean provided');
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
    ctx: Ctx,
): Identifier => {
    if (!node) {
        throw new Error('No Identifier provided');
    }

    const transformed = visitor.Identifier
        ? visitor.Identifier(node, ctx)
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

        let updatedNode$hash = null;
        const updatedNode$hash$current = node.hash;
        if (updatedNode$hash$current != null) {
            const updatedNode$hash$1$ = transformIdHash(
                updatedNode$hash$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$hash$1$ !== updatedNode$hash$current;
            updatedNode$hash = updatedNode$hash$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                hash: updatedNode$hash,
            };
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

export const transformbinop = <Ctx>(
    node: binop,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): binop => {
    if (!node) {
        throw new Error('No binop provided');
    }

    const transformed = visitor.binop ? visitor.binop(node, ctx) : null;
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
    if (visitor.binopPost) {
        const transformed = visitor.binopPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformbinopWithHash = <Ctx>(
    node: binopWithHash,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): binopWithHash => {
    if (!node) {
        throw new Error('No binopWithHash provided');
    }

    const transformed = visitor.binopWithHash
        ? visitor.binopWithHash(node, ctx)
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

        const updatedNode$op = transformbinop(node.op, visitor, ctx);
        changed1 = changed1 || updatedNode$op !== node.op;

        let updatedNode$hash = null;
        const updatedNode$hash$current = node.hash;
        if (updatedNode$hash$current != null) {
            const updatedNode$hash$1$ = transformIdHash(
                updatedNode$hash$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$hash$1$ !== updatedNode$hash$current;
            updatedNode$hash = updatedNode$hash$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                op: updatedNode$op,
                hash: updatedNode$hash,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.binopWithHashPost) {
        const transformed = visitor.binopWithHashPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformParenedOp = <Ctx>(
    node: ParenedOp,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ParenedOp => {
    if (!node) {
        throw new Error('No ParenedOp provided');
    }

    const transformed = visitor.ParenedOp ? visitor.ParenedOp(node, ctx) : null;
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

        const updatedNode$inner = transformbinopWithHash(
            node.inner,
            visitor,
            ctx,
        );
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
    if (visitor.ParenedOpPost) {
        const transformed = visitor.ParenedOpPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformCommaExpr = <Ctx>(
    node: CommaExpr,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): CommaExpr => {
    if (!node) {
        throw new Error('No CommaExpr provided');
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
                    ctx,
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

export const transformParenedExpression = <Ctx>(
    node: ParenedExpression,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ParenedExpression => {
    if (!node) {
        throw new Error('No ParenedExpression provided');
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

        let updatedNode$items = null;
        const updatedNode$items$current = node.items;
        if (updatedNode$items$current != null) {
            const updatedNode$items$1$ = transformCommaExpr(
                updatedNode$items$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    ctx: Ctx,
): TemplateWrap => {
    if (!node) {
        throw new Error('No TemplateWrap provided');
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
    ctx: Ctx,
): TemplatePair => {
    if (!node) {
        throw new Error('No TemplatePair provided');
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
    ctx: Ctx,
): TemplateString => {
    if (!node) {
        throw new Error('No TemplateString provided');
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
                    ctx,
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

export const transformEnumPayload = <Ctx>(
    node: EnumPayload,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): EnumPayload => {
    if (!node) {
        throw new Error('No EnumPayload provided');
    }

    const transformed = visitor.EnumPayload
        ? visitor.EnumPayload(node, ctx)
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

        let updatedNode$items = null;
        const updatedNode$items$current = node.items;
        if (updatedNode$items$current != null) {
            const updatedNode$items$1$ = transformCommaExpr(
                updatedNode$items$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    if (visitor.EnumPayloadPost) {
        const transformed = visitor.EnumPayloadPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformEnum = <Ctx>(
    node: Enum,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Enum => {
    if (!node) {
        throw new Error('No Enum provided');
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

        let updatedNode$payload = null;
        const updatedNode$payload$current = node.payload;
        if (updatedNode$payload$current != null) {
            const updatedNode$payload$1$ = transformEnumPayload(
                updatedNode$payload$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$payload$1$ !== updatedNode$payload$current;
            updatedNode$payload = updatedNode$payload$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                payload: updatedNode$payload,
            };
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

export const transformRecordSpread = <Ctx>(
    node: RecordSpread,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): RecordSpread => {
    if (!node) {
        throw new Error('No RecordSpread provided');
    }

    const transformed = visitor.RecordSpread
        ? visitor.RecordSpread(node, ctx)
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

        const updatedNode$inner = transformExpression(node.inner, visitor, ctx);
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
    if (visitor.RecordSpreadPost) {
        const transformed = visitor.RecordSpreadPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformRecordKeyValue = <Ctx>(
    node: RecordKeyValue,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): RecordKeyValue => {
    if (!node) {
        throw new Error('No RecordKeyValue provided');
    }

    const transformed = visitor.RecordKeyValue
        ? visitor.RecordKeyValue(node, ctx)
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

        const updatedNode$value = transformExpression(node.value, visitor, ctx);
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
    if (visitor.RecordKeyValuePost) {
        const transformed = visitor.RecordKeyValuePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformRecordItem = <Ctx>(
    node: RecordItem,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): RecordItem => {
    if (!node) {
        throw new Error('No RecordItem provided');
    }

    const transformed = visitor.RecordItem
        ? visitor.RecordItem(node, ctx)
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
        case 'RecordSpread': {
            const transformed = visitor.RecordItem_RecordSpread
                ? visitor.RecordItem_RecordSpread(node, ctx)
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

        case 'RecordKeyValue': {
            const transformed = visitor.RecordItem_RecordKeyValue
                ? visitor.RecordItem_RecordKeyValue(node, ctx)
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
        case 'RecordSpread': {
            updatedNode = transformRecordSpread(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformRecordKeyValue(
                node,
                visitor,
                ctx,
            );
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'RecordSpread': {
            const transformed = visitor.RecordItemPost_RecordSpread
                ? visitor.RecordItemPost_RecordSpread(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'RecordKeyValue': {
            const transformed = visitor.RecordItemPost_RecordKeyValue
                ? visitor.RecordItemPost_RecordKeyValue(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.RecordItemPost) {
        const transformed = visitor.RecordItemPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformRecordItems = <Ctx>(
    node: RecordItems,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): RecordItems => {
    if (!node) {
        throw new Error('No RecordItems provided');
    }

    const transformed = visitor.RecordItems
        ? visitor.RecordItems(node, ctx)
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
                const result = transformRecordItem(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.RecordItemsPost) {
        const transformed = visitor.RecordItemsPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformRecord = <Ctx>(
    node: Record,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Record => {
    if (!node) {
        throw new Error('No Record provided');
    }

    const transformed = visitor.Record ? visitor.Record(node, ctx) : null;
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
            const updatedNode$items$1$ = transformRecordItems(
                updatedNode$items$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    if (visitor.RecordPost) {
        const transformed = visitor.RecordPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformAtom = <Ctx>(
    node: Atom,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Atom => {
    if (!node) {
        throw new Error('No Atom provided');
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
        case 'If': {
            const transformed = visitor.Atom_If
                ? visitor.Atom_If(node, ctx)
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

        case 'Number': {
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

        case 'Boolean': {
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

        case 'Identifier': {
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

        case 'ParenedOp': {
            const transformed = visitor.Atom_ParenedOp
                ? visitor.Atom_ParenedOp(node, ctx)
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

        case 'ParenedExpression': {
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

        case 'TemplateString': {
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

        case 'Enum': {
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

        case 'Record': {
            const transformed = visitor.Atom_Record
                ? visitor.Atom_Record(node, ctx)
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

        case 'Block': {
            const transformed = visitor.Atom_Block
                ? visitor.Atom_Block(node, ctx)
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
        case 'If': {
            updatedNode = transformIf(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Boolean': {
            updatedNode = transformBoolean(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Identifier': {
            updatedNode = transformIdentifier(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'ParenedOp': {
            updatedNode = transformParenedOp(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'ParenedExpression': {
            updatedNode = transformParenedExpression(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplateString': {
            updatedNode = transformTemplateString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Enum': {
            updatedNode = transformEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Record': {
            updatedNode = transformRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformBlock(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'If': {
            const transformed = visitor.AtomPost_If
                ? visitor.AtomPost_If(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.AtomPost_Number
                ? visitor.AtomPost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Boolean': {
            const transformed = visitor.AtomPost_Boolean
                ? visitor.AtomPost_Boolean(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Identifier': {
            const transformed = visitor.AtomPost_Identifier
                ? visitor.AtomPost_Identifier(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'ParenedOp': {
            const transformed = visitor.AtomPost_ParenedOp
                ? visitor.AtomPost_ParenedOp(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'ParenedExpression': {
            const transformed = visitor.AtomPost_ParenedExpression
                ? visitor.AtomPost_ParenedExpression(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TemplateString': {
            const transformed = visitor.AtomPost_TemplateString
                ? visitor.AtomPost_TemplateString(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Enum': {
            const transformed = visitor.AtomPost_Enum
                ? visitor.AtomPost_Enum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Record': {
            const transformed = visitor.AtomPost_Record
                ? visitor.AtomPost_Record(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Block': {
            const transformed = visitor.AtomPost_Block
                ? visitor.AtomPost_Block(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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

export const transformCallSuffix = <Ctx>(
    node: CallSuffix,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): CallSuffix => {
    if (!node) {
        throw new Error('No CallSuffix provided');
    }

    const transformed = visitor.CallSuffix
        ? visitor.CallSuffix(node, ctx)
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

        let updatedNode$args = null;
        const updatedNode$args$current = node.args;
        if (updatedNode$args$current != null) {
            const updatedNode$args$1$ = transformCommaExpr(
                updatedNode$args$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$args$1$ !== updatedNode$args$current;
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
    ctx: Ctx,
): TypeAppVbls => {
    if (!node) {
        throw new Error('No TypeAppVbls provided');
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
                const result = transformType(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    ctx: Ctx,
): TypeApplicationSuffix => {
    if (!node) {
        throw new Error('No TypeApplicationSuffix provided');
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
    ctx: Ctx,
): Suffix => {
    if (!node) {
        throw new Error('No Suffix provided');
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
        case 'CallSuffix': {
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

        case 'TypeApplicationSuffix': {
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
        case 'CallSuffix': {
            updatedNode = transformCallSuffix(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformTypeApplicationSuffix(
                node,
                visitor,
                ctx,
            );
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'CallSuffix': {
            const transformed = visitor.SuffixPost_CallSuffix
                ? visitor.SuffixPost_CallSuffix(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeApplicationSuffix': {
            const transformed = visitor.SuffixPost_TypeApplicationSuffix
                ? visitor.SuffixPost_TypeApplicationSuffix(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): Apply_inner => {
    if (!node) {
        throw new Error('No Apply_inner provided');
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
                    ctx,
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
    ctx: Ctx,
): Apply => {
    if (!node) {
        throw new Error('No Apply provided');
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
        case 'Apply': {
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
        case 'Apply': {
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

    switch (updatedNode.type) {
        case 'Apply': {
            const transformed = visitor.ApplyPost_Apply
                ? visitor.ApplyPost_Apply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): DecoratedExpression_inner => {
    if (!node) {
        throw new Error('No DecoratedExpression_inner provided');
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
                    ctx,
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
    ctx: Ctx,
): DecoratedExpression => {
    if (!node) {
        throw new Error('No DecoratedExpression provided');
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
        case 'DecoratedExpression': {
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
        case 'DecoratedExpression': {
            updatedNode = transformDecoratedExpression_inner(
                node,
                visitor,
                ctx,
            );
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

    switch (updatedNode.type) {
        case 'DecoratedExpression': {
            const transformed =
                visitor.DecoratedExpressionPost_DecoratedExpression
                    ? visitor.DecoratedExpressionPost_DecoratedExpression(
                          updatedNode,
                          ctx,
                      )
                    : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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

export const transformWithUnary_inner = <Ctx>(
    node: WithUnary_inner,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): WithUnary_inner => {
    if (!node) {
        throw new Error('No WithUnary_inner provided');
    }

    const transformed = visitor.WithUnary_inner
        ? visitor.WithUnary_inner(node, ctx)
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

        const updatedNode$op = transformUnaryOpWithHash(node.op, visitor, ctx);
        changed1 = changed1 || updatedNode$op !== node.op;

        const updatedNode$inner = transformDecoratedExpression(
            node.inner,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$inner !== node.inner;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                op: updatedNode$op,
                inner: updatedNode$inner,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.WithUnary_innerPost) {
        const transformed = visitor.WithUnary_innerPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformWithUnary = <Ctx>(
    node: WithUnary,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): WithUnary => {
    if (!node) {
        throw new Error('No WithUnary provided');
    }

    const transformed = visitor.WithUnary ? visitor.WithUnary(node, ctx) : null;
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
        case 'WithUnary': {
            const transformed = visitor.WithUnary_WithUnary
                ? visitor.WithUnary_WithUnary(node, ctx)
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
        case 'WithUnary': {
            updatedNode = transformWithUnary_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformDecoratedExpression(
                node,
                visitor,
                ctx,
            );
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'WithUnary': {
            const transformed = visitor.WithUnaryPost_WithUnary
                ? visitor.WithUnaryPost_WithUnary(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.WithUnaryPost) {
        const transformed = visitor.WithUnaryPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformBinOpRight = <Ctx>(
    node: BinOpRight,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): BinOpRight => {
    if (!node) {
        throw new Error('No BinOpRight provided');
    }

    const transformed = visitor.BinOpRight
        ? visitor.BinOpRight(node, ctx)
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

        const updatedNode$op = transformbinopWithHash(node.op, visitor, ctx);
        changed1 = changed1 || updatedNode$op !== node.op;

        const updatedNode$right = transformWithUnary(node.right, visitor, ctx);
        changed1 = changed1 || updatedNode$right !== node.right;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                op: updatedNode$op,
                right: updatedNode$right,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.BinOpRightPost) {
        const transformed = visitor.BinOpRightPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformBinOp_inner = <Ctx>(
    node: BinOp_inner,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): BinOp_inner => {
    if (!node) {
        throw new Error('No BinOp_inner provided');
    }

    const transformed = visitor.BinOp_inner
        ? visitor.BinOp_inner(node, ctx)
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

        const updatedNode$first = transformWithUnary(node.first, visitor, ctx);
        changed1 = changed1 || updatedNode$first !== node.first;

        let updatedNode$rest = node.rest;
        {
            let changed2 = false;
            const arr1 = node.rest.map((updatedNode$rest$item1) => {
                const result = transformBinOpRight(
                    updatedNode$rest$item1,
                    visitor,
                    ctx,
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
                first: updatedNode$first,
                rest: updatedNode$rest,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.BinOp_innerPost) {
        const transformed = visitor.BinOp_innerPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformBinOp = <Ctx>(
    node: BinOp,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): BinOp => {
    if (!node) {
        throw new Error('No BinOp provided');
    }

    const transformed = visitor.BinOp ? visitor.BinOp(node, ctx) : null;
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
        case 'BinOp': {
            const transformed = visitor.BinOp_BinOp
                ? visitor.BinOp_BinOp(node, ctx)
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
        case 'BinOp': {
            updatedNode = transformBinOp_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformWithUnary(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'BinOp': {
            const transformed = visitor.BinOpPost_BinOp
                ? visitor.BinOpPost_BinOp(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.BinOpPost) {
        const transformed = visitor.BinOpPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformExpression = <Ctx>(
    node: Expression,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Expression => {
    if (!node) {
        throw new Error('No Expression provided');
    }

    const transformed = visitor.Expression
        ? visitor.Expression(node, ctx)
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
        case 'Lambda': {
            const transformed = visitor.Expression_Lambda
                ? visitor.Expression_Lambda(node, ctx)
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
        case 'Lambda': {
            updatedNode = transformLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformBinOp(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'Lambda': {
            const transformed = visitor.ExpressionPost_Lambda
                ? visitor.ExpressionPost_Lambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

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
    ctx: Ctx,
): DecExpr => {
    if (!node) {
        throw new Error('No DecExpr provided');
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
    ctx: Ctx,
): DecoratorArg => {
    if (!node) {
        throw new Error('No DecoratorArg provided');
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
        case 'DecType': {
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

        case 'DecExpr': {
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
        case 'DecType': {
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

    switch (updatedNode.type) {
        case 'DecType': {
            const transformed = visitor.DecoratorArgPost_DecType
                ? visitor.DecoratorArgPost_DecType(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecExpr': {
            const transformed = visitor.DecoratorArgPost_DecExpr
                ? visitor.DecoratorArgPost_DecExpr(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): LabeledDecoratorArg => {
    if (!node) {
        throw new Error('No LabeledDecoratorArg provided');
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
    ctx: Ctx,
): DecoratorArgs => {
    if (!node) {
        throw new Error('No DecoratorArgs provided');
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
                    ctx,
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
    ctx: Ctx,
): Decorator => {
    if (!node) {
        throw new Error('No Decorator provided');
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
                ctx,
            );
            changed1 =
                changed1 || updatedNode$args$1$ !== updatedNode$args$current;
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

export const transformTBlank = <Ctx>(
    node: TBlank,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TBlank => {
    if (!node) {
        throw new Error('No TBlank provided');
    }

    const transformed = visitor.TBlank ? visitor.TBlank(node, ctx) : null;
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
    if (visitor.TBlankPost) {
        const transformed = visitor.TBlankPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformTRef = <Ctx>(
    node: TRef,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TRef => {
    if (!node) {
        throw new Error('No TRef provided');
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
    ctx: Ctx,
): String => {
    if (!node) {
        throw new Error('No String provided');
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
    ctx: Ctx,
): TArg => {
    if (!node) {
        throw new Error('No TArg provided');
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
    ctx: Ctx,
): TArgs => {
    if (!node) {
        throw new Error('No TArgs provided');
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
                const result = transformTArg(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    ctx: Ctx,
): TLambda => {
    if (!node) {
        throw new Error('No TLambda provided');
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
                ctx,
            );
            changed1 =
                changed1 || updatedNode$args$1$ !== updatedNode$args$current;
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
    ctx: Ctx,
): TBArg => {
    if (!node) {
        throw new Error('No TBArg provided');
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
                ctx,
            );
            changed1 =
                changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
            updatedNode$bound = updatedNode$bound$1$;
        }

        let updatedNode$default_ = null;
        const updatedNode$default_$current = node.default_;
        if (updatedNode$default_$current != null) {
            const updatedNode$default_$1$ = transformType(
                updatedNode$default_$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$default_$1$ !== updatedNode$default_$current;
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
    ctx: Ctx,
): TBargs => {
    if (!node) {
        throw new Error('No TBargs provided');
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
                const result = transformTBArg(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    ctx: Ctx,
): TVars => {
    if (!node) {
        throw new Error('No TVars provided');
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

export const transformTComma = <Ctx>(
    node: TComma,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TComma => {
    if (!node) {
        throw new Error('No TComma provided');
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
                const result = transformType(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.TCommaPost) {
        const transformed = visitor.TCommaPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformTParens = <Ctx>(
    node: TParens,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TParens => {
    if (!node) {
        throw new Error('No TParens provided');
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

        let updatedNode$items = null;
        const updatedNode$items$current = node.items;
        if (updatedNode$items$current != null) {
            const updatedNode$items$1$ = transformTComma(
                updatedNode$items$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    ctx: Ctx,
): TagPayload => {
    if (!node) {
        throw new Error('No TagPayload provided');
    }

    const transformed = visitor.TagPayload
        ? visitor.TagPayload(node, ctx)
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

        let updatedNode$items = null;
        const updatedNode$items$current = node.items;
        if (updatedNode$items$current != null) {
            const updatedNode$items$1$ = transformTComma(
                updatedNode$items$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    ctx: Ctx,
): TagDecl => {
    if (!node) {
        throw new Error('No TagDecl provided');
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
                    ctx,
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
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$payload$1$ !== updatedNode$payload$current;
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
    ctx: Ctx,
): TRecordSpread => {
    if (!node) {
        throw new Error('No TRecordSpread provided');
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
    ctx: Ctx,
): TRecordKeyValue => {
    if (!node) {
        throw new Error('No TRecordKeyValue provided');
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

        let updatedNode$default_ = null;
        const updatedNode$default_$current = node.default_;
        if (updatedNode$default_$current != null) {
            const updatedNode$default_$1$ = transformExpression(
                updatedNode$default_$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$default_$1$ !== updatedNode$default_$current;
            updatedNode$default_ = updatedNode$default_$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                value: updatedNode$value,
                default_: updatedNode$default_,
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
    ctx: Ctx,
): Star => {
    if (!node) {
        throw new Error('No Star provided');
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
    ctx: Ctx,
): TRecordItem => {
    if (!node) {
        throw new Error('No TRecordItem provided');
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
        case 'TRecordSpread': {
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

        case 'TRecordKeyValue': {
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

        case 'Star': {
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
        case 'TRecordSpread': {
            updatedNode = transformTRecordSpread(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRecordKeyValue': {
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

    switch (updatedNode.type) {
        case 'TRecordSpread': {
            const transformed = visitor.TRecordItemPost_TRecordSpread
                ? visitor.TRecordItemPost_TRecordSpread(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecordKeyValue': {
            const transformed = visitor.TRecordItemPost_TRecordKeyValue
                ? visitor.TRecordItemPost_TRecordKeyValue(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Star': {
            const transformed = visitor.TRecordItemPost_Star
                ? visitor.TRecordItemPost_Star(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): TRecordItems => {
    if (!node) {
        throw new Error('No TRecordItems provided');
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
                    ctx,
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
    ctx: Ctx,
): TRecord => {
    if (!node) {
        throw new Error('No TRecord provided');
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
                ctx,
            );
            changed1 =
                changed1 || updatedNode$items$1$ !== updatedNode$items$current;
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
    ctx: Ctx,
): EnumCase => {
    if (!node) {
        throw new Error('No EnumCase provided');
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
        case 'TagDecl': {
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

        case 'Star': {
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
        case 'TagDecl': {
            updatedNode = transformTagDecl(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TOps': {
            updatedNode = transformTOps_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TDecorated': {
            updatedNode = transformTDecorated(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TApply': {
            updatedNode = transformTApply_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TBlank': {
            updatedNode = transformTBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRef': {
            updatedNode = transformTRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'String': {
            updatedNode = transformString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TLambda': {
            updatedNode = transformTLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TVars': {
            updatedNode = transformTVars(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TParens': {
            updatedNode = transformTParens(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TEnum': {
            updatedNode = transformTEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRecord': {
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

    switch (updatedNode.type) {
        case 'TagDecl': {
            const transformed = visitor.EnumCasePost_TagDecl
                ? visitor.EnumCasePost_TagDecl(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Star': {
            const transformed = visitor.EnumCasePost_Star
                ? visitor.EnumCasePost_Star(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): EnumCases => {
    if (!node) {
        throw new Error('No EnumCases provided');
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
                const result = transformEnumCase(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    ctx: Ctx,
): TEnum => {
    if (!node) {
        throw new Error('No TEnum provided');
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
                ctx,
            );
            changed1 =
                changed1 || updatedNode$cases$1$ !== updatedNode$cases$current;
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
    ctx: Ctx,
): TAtom => {
    if (!node) {
        throw new Error('No TAtom provided');
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
        case 'TBlank': {
            const transformed = visitor.TAtom_TBlank
                ? visitor.TAtom_TBlank(node, ctx)
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

        case 'TRef': {
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

        case 'Number': {
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

        case 'String': {
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

        case 'TLambda': {
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

        case 'TVars': {
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

        case 'TParens': {
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

        case 'TEnum': {
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

        case 'TRecord': {
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
        case 'TBlank': {
            updatedNode = transformTBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRef': {
            updatedNode = transformTRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'String': {
            updatedNode = transformString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TLambda': {
            updatedNode = transformTLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TVars': {
            updatedNode = transformTVars(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TParens': {
            updatedNode = transformTParens(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TEnum': {
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

    switch (updatedNode.type) {
        case 'TBlank': {
            const transformed = visitor.TAtomPost_TBlank
                ? visitor.TAtomPost_TBlank(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRef': {
            const transformed = visitor.TAtomPost_TRef
                ? visitor.TAtomPost_TRef(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.TAtomPost_Number
                ? visitor.TAtomPost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'String': {
            const transformed = visitor.TAtomPost_String
                ? visitor.TAtomPost_String(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TLambda': {
            const transformed = visitor.TAtomPost_TLambda
                ? visitor.TAtomPost_TLambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TVars': {
            const transformed = visitor.TAtomPost_TVars
                ? visitor.TAtomPost_TVars(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TParens': {
            const transformed = visitor.TAtomPost_TParens
                ? visitor.TAtomPost_TParens(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TEnum': {
            const transformed = visitor.TAtomPost_TEnum
                ? visitor.TAtomPost_TEnum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecord': {
            const transformed = visitor.TAtomPost_TRecord
                ? visitor.TAtomPost_TRecord(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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

export const transformTApply_inner = <Ctx>(
    node: TApply_inner,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TApply_inner => {
    if (!node) {
        throw new Error('No TApply_inner provided');
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
                const result = transformTComma(
                    updatedNode$args$item1,
                    visitor,
                    ctx,
                );
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
    ctx: Ctx,
): TApply => {
    if (!node) {
        throw new Error('No TApply provided');
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
        case 'TApply': {
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
        case 'TApply': {
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

    switch (updatedNode.type) {
        case 'TApply': {
            const transformed = visitor.TApplyPost_TApply
                ? visitor.TApplyPost_TApply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): TDecorated => {
    if (!node) {
        throw new Error('No TDecorated provided');
    }

    const transformed = visitor.TDecorated
        ? visitor.TDecorated(node, ctx)
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
                    ctx,
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
    ctx: Ctx,
): TOpInner => {
    if (!node) {
        throw new Error('No TOpInner provided');
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
        case 'TDecorated': {
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
        case 'TDecorated': {
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

    switch (updatedNode.type) {
        case 'TDecorated': {
            const transformed = visitor.TOpInnerPost_TDecorated
                ? visitor.TOpInnerPost_TDecorated(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): TRight => {
    if (!node) {
        throw new Error('No TRight provided');
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
    ctx: Ctx,
): TOps_inner => {
    if (!node) {
        throw new Error('No TOps_inner provided');
    }

    const transformed = visitor.TOps_inner
        ? visitor.TOps_inner(node, ctx)
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

        const updatedNode$left = transformTOpInner(node.left, visitor, ctx);
        changed1 = changed1 || updatedNode$left !== node.left;

        let updatedNode$right = node.right;
        {
            let changed2 = false;
            const arr1 = node.right.map((updatedNode$right$item1) => {
                const result = transformTRight(
                    updatedNode$right$item1,
                    visitor,
                    ctx,
                );
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
    ctx: Ctx,
): TOps => {
    if (!node) {
        throw new Error('No TOps provided');
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
        case 'TOps': {
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
        case 'TOps': {
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

    switch (updatedNode.type) {
        case 'TOps': {
            const transformed = visitor.TOpsPost_TOps
                ? visitor.TOpsPost_TOps(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): Type => {
    if (!node) {
        throw new Error('No Type provided');
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
    ctx: Ctx,
): TypePair => {
    if (!node) {
        throw new Error('No TypePair provided');
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
    ctx: Ctx,
): TypeAlias => {
    if (!node) {
        throw new Error('No TypeAlias provided');
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
                const result = transformTypePair(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.TypeAliasPost) {
        const transformed = visitor.TypeAliasPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformLetPair = <Ctx>(
    node: LetPair,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): LetPair => {
    if (!node) {
        throw new Error('No LetPair provided');
    }

    const transformed = visitor.LetPair ? visitor.LetPair(node, ctx) : null;
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

        let updatedNode$typ = null;
        const updatedNode$typ$current = node.typ;
        if (updatedNode$typ$current != null) {
            const updatedNode$typ$1$ = transformType(
                updatedNode$typ$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$typ$1$ !== updatedNode$typ$current;
            updatedNode$typ = updatedNode$typ$1$;
        }

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                typ: updatedNode$typ,
                expr: updatedNode$expr,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.LetPairPost) {
        const transformed = visitor.LetPairPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformToplevelLet = <Ctx>(
    node: ToplevelLet,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ToplevelLet => {
    if (!node) {
        throw new Error('No ToplevelLet provided');
    }

    const transformed = visitor.ToplevelLet
        ? visitor.ToplevelLet(node, ctx)
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
                const result = transformLetPair(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    if (visitor.ToplevelLetPost) {
        const transformed = visitor.ToplevelLetPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformToplevel = <Ctx>(
    node: Toplevel,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Toplevel => {
    if (!node) {
        throw new Error('No Toplevel provided');
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
        case 'TypeAlias': {
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

        case 'ToplevelLet': {
            const transformed = visitor.Toplevel_ToplevelLet
                ? visitor.Toplevel_ToplevelLet(node, ctx)
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
        case 'TypeAlias': {
            updatedNode = transformTypeAlias(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'ToplevelLet': {
            updatedNode = transformToplevelLet(node, visitor, ctx);
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

    switch (updatedNode.type) {
        case 'TypeAlias': {
            const transformed = visitor.ToplevelPost_TypeAlias
                ? visitor.ToplevelPost_TypeAlias(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'ToplevelLet': {
            const transformed = visitor.ToplevelPost_ToplevelLet
                ? visitor.ToplevelPost_ToplevelLet(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): File => {
    if (!node) {
        throw new Error('No File provided');
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
                    ctx,
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
    ctx: Ctx,
): TypeToplevel => {
    if (!node) {
        throw new Error('No TypeToplevel provided');
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
        case 'TypeAlias': {
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
        case 'TypeAlias': {
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

    switch (updatedNode.type) {
        case 'TypeAlias': {
            const transformed = visitor.TypeToplevelPost_TypeAlias
                ? visitor.TypeToplevelPost_TypeAlias(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
    ctx: Ctx,
): TypeFile => {
    if (!node) {
        throw new Error('No TypeFile provided');
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
                    ctx,
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
    ctx: Ctx,
): _lineEnd => {
    if (!node) {
        throw new Error('No _lineEnd provided');
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
    ctx: Ctx,
): _EOF => {
    if (!node) {
        throw new Error('No _EOF provided');
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

export const transformAttrText = <Ctx>(
    node: AttrText,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): AttrText => {
    if (!node) {
        throw new Error('No AttrText provided');
    }

    const transformed = visitor.AttrText ? visitor.AttrText(node, ctx) : null;
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
    if (visitor.AttrTextPost) {
        const transformed = visitor.AttrTextPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformBinop = <Ctx>(
    node: Binop,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Binop => {
    if (!node) {
        throw new Error('No Binop provided');
    }

    const transformed = visitor.Binop ? visitor.Binop(node, ctx) : null;
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

    const updatedNode = transformExpression(node, visitor, ctx);
    changed0 = changed0 || updatedNode !== node;

    node = updatedNode;
    if (visitor.BinopPost) {
        const transformed = visitor.BinopPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformnewline = <Ctx>(
    node: newline,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): newline => {
    if (!node) {
        throw new Error('No newline provided');
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
    ctx: Ctx,
): _nonnewline => {
    if (!node) {
        throw new Error('No _nonnewline provided');
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
    ctx: Ctx,
): _ => {
    if (!node) {
        throw new Error('No _ provided');
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
    ctx: Ctx,
): __ => {
    if (!node) {
        throw new Error('No __ provided');
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
    ctx: Ctx,
): lineComment => {
    if (!node) {
        throw new Error('No lineComment provided');
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
    ctx: Ctx,
): comment => {
    if (!node) {
        throw new Error('No comment provided');
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
    ctx: Ctx,
): multiLineComment => {
    if (!node) {
        throw new Error('No multiLineComment provided');
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
    ctx: Ctx,
): finalLineComment => {
    if (!node) {
        throw new Error('No finalLineComment provided');
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
    ctx: Ctx,
): tplStringChars => {
    if (!node) {
        throw new Error('No tplStringChars provided');
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
    ctx: Ctx,
): stringChar => {
    if (!node) {
        throw new Error('No stringChar provided');
    }

    const transformed = visitor.stringChar
        ? visitor.stringChar(node, ctx)
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
    ctx: Ctx,
): TypeVbl => {
    if (!node) {
        throw new Error('No TypeVbl provided');
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
                ctx,
            );
            changed1 =
                changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
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
    ctx: Ctx,
): TypeVbls => {
    if (!node) {
        throw new Error('No TypeVbls provided');
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
                const result = transformTypeVbl(
                    updatedNode$items$item1,
                    visitor,
                    ctx,
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
    ctx: Ctx,
): TypeVariables => {
    if (!node) {
        throw new Error('No TypeVariables provided');
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

export const transformPRecordPattern = <Ctx>(
    node: PRecordPattern,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PRecordPattern => {
    if (!node) {
        throw new Error('No PRecordPattern provided');
    }

    const transformed = visitor.PRecordPattern
        ? visitor.PRecordPattern(node, ctx)
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

    const updatedNode = transformPattern(node, visitor, ctx);
    changed0 = changed0 || updatedNode !== node;

    node = updatedNode;
    if (visitor.PRecordPatternPost) {
        const transformed = visitor.PRecordPatternPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformtop = <Ctx>(
    node: top,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): top => {
    if (!node) {
        throw new Error('No top provided');
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
    ctx: Ctx,
): AllTaggedTypes => {
    if (!node) {
        throw new Error('No AllTaggedTypes provided');
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
        case 'File': {
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

        case 'TypeFile': {
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

        case 'Apply': {
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

        case 'CallSuffix': {
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

        case 'CommaExpr': {
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

        case 'Identifier': {
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

        case 'ParenedExpression': {
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

        case 'BinOp': {
            const transformed = visitor.AllTaggedTypes_BinOp
                ? visitor.AllTaggedTypes_BinOp(node, ctx)
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

        case 'BinOpRight': {
            const transformed = visitor.AllTaggedTypes_BinOpRight
                ? visitor.AllTaggedTypes_BinOpRight(node, ctx)
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

        case 'WithUnary': {
            const transformed = visitor.AllTaggedTypes_WithUnary
                ? visitor.AllTaggedTypes_WithUnary(node, ctx)
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

        case 'UnaryOpWithHash': {
            const transformed = visitor.AllTaggedTypes_UnaryOpWithHash
                ? visitor.AllTaggedTypes_UnaryOpWithHash(node, ctx)
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

        case 'binopWithHash': {
            const transformed = visitor.AllTaggedTypes_binopWithHash
                ? visitor.AllTaggedTypes_binopWithHash(node, ctx)
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

        case 'ParenedOp': {
            const transformed = visitor.AllTaggedTypes_ParenedOp
                ? visitor.AllTaggedTypes_ParenedOp(node, ctx)
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

        case 'Boolean': {
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

        case 'Number': {
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

        case 'String': {
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

        case 'TemplateString': {
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

        case 'TemplatePair': {
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

        case 'TemplateWrap': {
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

        case 'DecoratedExpression': {
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

        case 'Decorator': {
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

        case 'DecoratorId': {
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

        case 'DecoratorArgs': {
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

        case 'LabeledDecoratorArg': {
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

        case 'DecType': {
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

        case 'DecExpr': {
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

        case 'Enum': {
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

        case 'EnumPayload': {
            const transformed = visitor.AllTaggedTypes_EnumPayload
                ? visitor.AllTaggedTypes_EnumPayload(node, ctx)
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

        case 'TEnum': {
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

        case 'EnumCases': {
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

        case 'TagDecl': {
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

        case 'TagPayload': {
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

        case 'Star': {
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

        case 'TypeApplicationSuffix': {
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

        case 'TypeAppVbls': {
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

        case 'TypeVariables': {
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

        case 'TypeVbls': {
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

        case 'TypeVbl': {
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

        case 'If': {
            const transformed = visitor.AllTaggedTypes_If
                ? visitor.AllTaggedTypes_If(node, ctx)
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

        case 'Lambda': {
            const transformed = visitor.AllTaggedTypes_Lambda
                ? visitor.AllTaggedTypes_Lambda(node, ctx)
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

        case 'LArgs': {
            const transformed = visitor.AllTaggedTypes_LArgs
                ? visitor.AllTaggedTypes_LArgs(node, ctx)
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

        case 'LArg': {
            const transformed = visitor.AllTaggedTypes_LArg
                ? visitor.AllTaggedTypes_LArg(node, ctx)
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

        case 'Block': {
            const transformed = visitor.AllTaggedTypes_Block
                ? visitor.AllTaggedTypes_Block(node, ctx)
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

        case 'Stmts': {
            const transformed = visitor.AllTaggedTypes_Stmts
                ? visitor.AllTaggedTypes_Stmts(node, ctx)
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

        case 'Let': {
            const transformed = visitor.AllTaggedTypes_Let
                ? visitor.AllTaggedTypes_Let(node, ctx)
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

        case 'ToplevelLet': {
            const transformed = visitor.AllTaggedTypes_ToplevelLet
                ? visitor.AllTaggedTypes_ToplevelLet(node, ctx)
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

        case 'LetPair': {
            const transformed = visitor.AllTaggedTypes_LetPair
                ? visitor.AllTaggedTypes_LetPair(node, ctx)
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

        case 'PBlank': {
            const transformed = visitor.AllTaggedTypes_PBlank
                ? visitor.AllTaggedTypes_PBlank(node, ctx)
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

        case 'PName': {
            const transformed = visitor.AllTaggedTypes_PName
                ? visitor.AllTaggedTypes_PName(node, ctx)
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

        case 'PTuple': {
            const transformed = visitor.AllTaggedTypes_PTuple
                ? visitor.AllTaggedTypes_PTuple(node, ctx)
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

        case 'PTupleItems': {
            const transformed = visitor.AllTaggedTypes_PTupleItems
                ? visitor.AllTaggedTypes_PTupleItems(node, ctx)
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

        case 'PRecord': {
            const transformed = visitor.AllTaggedTypes_PRecord
                ? visitor.AllTaggedTypes_PRecord(node, ctx)
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

        case 'PRecordFields': {
            const transformed = visitor.AllTaggedTypes_PRecordFields
                ? visitor.AllTaggedTypes_PRecordFields(node, ctx)
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

        case 'PRecordField': {
            const transformed = visitor.AllTaggedTypes_PRecordField
                ? visitor.AllTaggedTypes_PRecordField(node, ctx)
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

        case 'PHash': {
            const transformed = visitor.AllTaggedTypes_PHash
                ? visitor.AllTaggedTypes_PHash(node, ctx)
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

        case 'Record': {
            const transformed = visitor.AllTaggedTypes_Record
                ? visitor.AllTaggedTypes_Record(node, ctx)
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

        case 'RecordItems': {
            const transformed = visitor.AllTaggedTypes_RecordItems
                ? visitor.AllTaggedTypes_RecordItems(node, ctx)
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

        case 'RecordSpread': {
            const transformed = visitor.AllTaggedTypes_RecordSpread
                ? visitor.AllTaggedTypes_RecordSpread(node, ctx)
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

        case 'RecordKeyValue': {
            const transformed = visitor.AllTaggedTypes_RecordKeyValue
                ? visitor.AllTaggedTypes_RecordKeyValue(node, ctx)
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

        case 'TRecord': {
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

        case 'TRecordItems': {
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

        case 'TRecordSpread': {
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

        case 'TRecordKeyValue': {
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

        case 'TApply': {
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

        case 'TComma': {
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

        case 'TVars': {
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

        case 'TBargs': {
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

        case 'TBArg': {
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

        case 'TDecorated': {
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

        case 'TRef': {
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

        case 'TOps': {
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

        case 'TRight': {
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

        case 'TParens': {
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

        case 'TArg': {
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

        case 'TArgs': {
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

        case 'TLambda': {
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

        case 'TypeAlias': {
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

        case 'TypePair': {
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

        case 'TBlank': {
            const transformed = visitor.AllTaggedTypes_TBlank
                ? visitor.AllTaggedTypes_TBlank(node, ctx)
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
        case 'File': {
            updatedNode = transformFile(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeFile': {
            updatedNode = transformTypeFile(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Apply': {
            updatedNode = transformApply_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'CallSuffix': {
            updatedNode = transformCallSuffix(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'CommaExpr': {
            updatedNode = transformCommaExpr(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Identifier': {
            updatedNode = transformIdentifier(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'ParenedExpression': {
            updatedNode = transformParenedExpression(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'BinOp': {
            updatedNode = transformBinOp_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'BinOpRight': {
            updatedNode = transformBinOpRight(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'WithUnary': {
            updatedNode = transformWithUnary_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'UnaryOpWithHash': {
            updatedNode = transformUnaryOpWithHash(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'binopWithHash': {
            updatedNode = transformbinopWithHash(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'ParenedOp': {
            updatedNode = transformParenedOp(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Boolean': {
            updatedNode = transformBoolean(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'String': {
            updatedNode = transformString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplateString': {
            updatedNode = transformTemplateString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplatePair': {
            updatedNode = transformTemplatePair(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplateWrap': {
            updatedNode = transformTemplateWrap(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'DecoratedExpression': {
            updatedNode = transformDecoratedExpression_inner(
                node,
                visitor,
                ctx,
            );
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Decorator': {
            updatedNode = transformDecorator(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'DecoratorId': {
            updatedNode = transformDecoratorId(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'DecoratorArgs': {
            updatedNode = transformDecoratorArgs(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'LabeledDecoratorArg': {
            updatedNode = transformLabeledDecoratorArg(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'DecType': {
            updatedNode = transformDecType(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'DecExpr': {
            updatedNode = transformDecExpr(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Enum': {
            updatedNode = transformEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'EnumPayload': {
            updatedNode = transformEnumPayload(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TEnum': {
            updatedNode = transformTEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'EnumCases': {
            updatedNode = transformEnumCases(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TagDecl': {
            updatedNode = transformTagDecl(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TagPayload': {
            updatedNode = transformTagPayload(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Star': {
            updatedNode = transformStar(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeApplicationSuffix': {
            updatedNode = transformTypeApplicationSuffix(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeAppVbls': {
            updatedNode = transformTypeAppVbls(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeVariables': {
            updatedNode = transformTypeVariables(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeVbls': {
            updatedNode = transformTypeVbls(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeVbl': {
            updatedNode = transformTypeVbl(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'If': {
            updatedNode = transformIf(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Lambda': {
            updatedNode = transformLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'LArgs': {
            updatedNode = transformLArgs(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'LArg': {
            updatedNode = transformLArg(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Block': {
            updatedNode = transformBlock(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Stmts': {
            updatedNode = transformStmts(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Let': {
            updatedNode = transformLet(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'ToplevelLet': {
            updatedNode = transformToplevelLet(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'LetPair': {
            updatedNode = transformLetPair(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PBlank': {
            updatedNode = transformPBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PName': {
            updatedNode = transformPName(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PTuple': {
            updatedNode = transformPTuple(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PTupleItems': {
            updatedNode = transformPTupleItems(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PRecord': {
            updatedNode = transformPRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PRecordFields': {
            updatedNode = transformPRecordFields(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PRecordField': {
            updatedNode = transformPRecordField(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'PHash': {
            updatedNode = transformPHash(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Record': {
            updatedNode = transformRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'RecordItems': {
            updatedNode = transformRecordItems(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'RecordSpread': {
            updatedNode = transformRecordSpread(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'RecordKeyValue': {
            updatedNode = transformRecordKeyValue(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRecord': {
            updatedNode = transformTRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRecordItems': {
            updatedNode = transformTRecordItems(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRecordSpread': {
            updatedNode = transformTRecordSpread(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRecordKeyValue': {
            updatedNode = transformTRecordKeyValue(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TApply': {
            updatedNode = transformTApply_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TComma': {
            updatedNode = transformTComma(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TVars': {
            updatedNode = transformTVars(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TBargs': {
            updatedNode = transformTBargs(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TBArg': {
            updatedNode = transformTBArg(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TDecorated': {
            updatedNode = transformTDecorated(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRef': {
            updatedNode = transformTRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TOps': {
            updatedNode = transformTOps_inner(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TRight': {
            updatedNode = transformTRight(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TParens': {
            updatedNode = transformTParens(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TArg': {
            updatedNode = transformTArg(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TArgs': {
            updatedNode = transformTArgs(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TLambda': {
            updatedNode = transformTLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeAlias': {
            updatedNode = transformTypeAlias(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypePair': {
            updatedNode = transformTypePair(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformTBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'File': {
            const transformed = visitor.AllTaggedTypesPost_File
                ? visitor.AllTaggedTypesPost_File(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeFile': {
            const transformed = visitor.AllTaggedTypesPost_TypeFile
                ? visitor.AllTaggedTypesPost_TypeFile(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Apply': {
            const transformed = visitor.AllTaggedTypesPost_Apply
                ? visitor.AllTaggedTypesPost_Apply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'CallSuffix': {
            const transformed = visitor.AllTaggedTypesPost_CallSuffix
                ? visitor.AllTaggedTypesPost_CallSuffix(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'CommaExpr': {
            const transformed = visitor.AllTaggedTypesPost_CommaExpr
                ? visitor.AllTaggedTypesPost_CommaExpr(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Identifier': {
            const transformed = visitor.AllTaggedTypesPost_Identifier
                ? visitor.AllTaggedTypesPost_Identifier(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'ParenedExpression': {
            const transformed = visitor.AllTaggedTypesPost_ParenedExpression
                ? visitor.AllTaggedTypesPost_ParenedExpression(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'BinOp': {
            const transformed = visitor.AllTaggedTypesPost_BinOp
                ? visitor.AllTaggedTypesPost_BinOp(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'BinOpRight': {
            const transformed = visitor.AllTaggedTypesPost_BinOpRight
                ? visitor.AllTaggedTypesPost_BinOpRight(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'WithUnary': {
            const transformed = visitor.AllTaggedTypesPost_WithUnary
                ? visitor.AllTaggedTypesPost_WithUnary(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'UnaryOpWithHash': {
            const transformed = visitor.AllTaggedTypesPost_UnaryOpWithHash
                ? visitor.AllTaggedTypesPost_UnaryOpWithHash(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'binopWithHash': {
            const transformed = visitor.AllTaggedTypesPost_binopWithHash
                ? visitor.AllTaggedTypesPost_binopWithHash(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'ParenedOp': {
            const transformed = visitor.AllTaggedTypesPost_ParenedOp
                ? visitor.AllTaggedTypesPost_ParenedOp(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Boolean': {
            const transformed = visitor.AllTaggedTypesPost_Boolean
                ? visitor.AllTaggedTypesPost_Boolean(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.AllTaggedTypesPost_Number
                ? visitor.AllTaggedTypesPost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'String': {
            const transformed = visitor.AllTaggedTypesPost_String
                ? visitor.AllTaggedTypesPost_String(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TemplateString': {
            const transformed = visitor.AllTaggedTypesPost_TemplateString
                ? visitor.AllTaggedTypesPost_TemplateString(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TemplatePair': {
            const transformed = visitor.AllTaggedTypesPost_TemplatePair
                ? visitor.AllTaggedTypesPost_TemplatePair(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TemplateWrap': {
            const transformed = visitor.AllTaggedTypesPost_TemplateWrap
                ? visitor.AllTaggedTypesPost_TemplateWrap(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecoratedExpression': {
            const transformed = visitor.AllTaggedTypesPost_DecoratedExpression
                ? visitor.AllTaggedTypesPost_DecoratedExpression(
                      updatedNode,
                      ctx,
                  )
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Decorator': {
            const transformed = visitor.AllTaggedTypesPost_Decorator
                ? visitor.AllTaggedTypesPost_Decorator(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecoratorId': {
            const transformed = visitor.AllTaggedTypesPost_DecoratorId
                ? visitor.AllTaggedTypesPost_DecoratorId(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecoratorArgs': {
            const transformed = visitor.AllTaggedTypesPost_DecoratorArgs
                ? visitor.AllTaggedTypesPost_DecoratorArgs(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'LabeledDecoratorArg': {
            const transformed = visitor.AllTaggedTypesPost_LabeledDecoratorArg
                ? visitor.AllTaggedTypesPost_LabeledDecoratorArg(
                      updatedNode,
                      ctx,
                  )
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecType': {
            const transformed = visitor.AllTaggedTypesPost_DecType
                ? visitor.AllTaggedTypesPost_DecType(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecExpr': {
            const transformed = visitor.AllTaggedTypesPost_DecExpr
                ? visitor.AllTaggedTypesPost_DecExpr(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Enum': {
            const transformed = visitor.AllTaggedTypesPost_Enum
                ? visitor.AllTaggedTypesPost_Enum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'EnumPayload': {
            const transformed = visitor.AllTaggedTypesPost_EnumPayload
                ? visitor.AllTaggedTypesPost_EnumPayload(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TEnum': {
            const transformed = visitor.AllTaggedTypesPost_TEnum
                ? visitor.AllTaggedTypesPost_TEnum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'EnumCases': {
            const transformed = visitor.AllTaggedTypesPost_EnumCases
                ? visitor.AllTaggedTypesPost_EnumCases(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TagDecl': {
            const transformed = visitor.AllTaggedTypesPost_TagDecl
                ? visitor.AllTaggedTypesPost_TagDecl(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TagPayload': {
            const transformed = visitor.AllTaggedTypesPost_TagPayload
                ? visitor.AllTaggedTypesPost_TagPayload(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Star': {
            const transformed = visitor.AllTaggedTypesPost_Star
                ? visitor.AllTaggedTypesPost_Star(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeApplicationSuffix': {
            const transformed = visitor.AllTaggedTypesPost_TypeApplicationSuffix
                ? visitor.AllTaggedTypesPost_TypeApplicationSuffix(
                      updatedNode,
                      ctx,
                  )
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeAppVbls': {
            const transformed = visitor.AllTaggedTypesPost_TypeAppVbls
                ? visitor.AllTaggedTypesPost_TypeAppVbls(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeVariables': {
            const transformed = visitor.AllTaggedTypesPost_TypeVariables
                ? visitor.AllTaggedTypesPost_TypeVariables(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeVbls': {
            const transformed = visitor.AllTaggedTypesPost_TypeVbls
                ? visitor.AllTaggedTypesPost_TypeVbls(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeVbl': {
            const transformed = visitor.AllTaggedTypesPost_TypeVbl
                ? visitor.AllTaggedTypesPost_TypeVbl(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'If': {
            const transformed = visitor.AllTaggedTypesPost_If
                ? visitor.AllTaggedTypesPost_If(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Lambda': {
            const transformed = visitor.AllTaggedTypesPost_Lambda
                ? visitor.AllTaggedTypesPost_Lambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'LArgs': {
            const transformed = visitor.AllTaggedTypesPost_LArgs
                ? visitor.AllTaggedTypesPost_LArgs(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'LArg': {
            const transformed = visitor.AllTaggedTypesPost_LArg
                ? visitor.AllTaggedTypesPost_LArg(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Block': {
            const transformed = visitor.AllTaggedTypesPost_Block
                ? visitor.AllTaggedTypesPost_Block(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Stmts': {
            const transformed = visitor.AllTaggedTypesPost_Stmts
                ? visitor.AllTaggedTypesPost_Stmts(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Let': {
            const transformed = visitor.AllTaggedTypesPost_Let
                ? visitor.AllTaggedTypesPost_Let(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'ToplevelLet': {
            const transformed = visitor.AllTaggedTypesPost_ToplevelLet
                ? visitor.AllTaggedTypesPost_ToplevelLet(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'LetPair': {
            const transformed = visitor.AllTaggedTypesPost_LetPair
                ? visitor.AllTaggedTypesPost_LetPair(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PBlank': {
            const transformed = visitor.AllTaggedTypesPost_PBlank
                ? visitor.AllTaggedTypesPost_PBlank(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PName': {
            const transformed = visitor.AllTaggedTypesPost_PName
                ? visitor.AllTaggedTypesPost_PName(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PTuple': {
            const transformed = visitor.AllTaggedTypesPost_PTuple
                ? visitor.AllTaggedTypesPost_PTuple(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PTupleItems': {
            const transformed = visitor.AllTaggedTypesPost_PTupleItems
                ? visitor.AllTaggedTypesPost_PTupleItems(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PRecord': {
            const transformed = visitor.AllTaggedTypesPost_PRecord
                ? visitor.AllTaggedTypesPost_PRecord(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PRecordFields': {
            const transformed = visitor.AllTaggedTypesPost_PRecordFields
                ? visitor.AllTaggedTypesPost_PRecordFields(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PRecordField': {
            const transformed = visitor.AllTaggedTypesPost_PRecordField
                ? visitor.AllTaggedTypesPost_PRecordField(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PHash': {
            const transformed = visitor.AllTaggedTypesPost_PHash
                ? visitor.AllTaggedTypesPost_PHash(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Record': {
            const transformed = visitor.AllTaggedTypesPost_Record
                ? visitor.AllTaggedTypesPost_Record(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'RecordItems': {
            const transformed = visitor.AllTaggedTypesPost_RecordItems
                ? visitor.AllTaggedTypesPost_RecordItems(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'RecordSpread': {
            const transformed = visitor.AllTaggedTypesPost_RecordSpread
                ? visitor.AllTaggedTypesPost_RecordSpread(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'RecordKeyValue': {
            const transformed = visitor.AllTaggedTypesPost_RecordKeyValue
                ? visitor.AllTaggedTypesPost_RecordKeyValue(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecord': {
            const transformed = visitor.AllTaggedTypesPost_TRecord
                ? visitor.AllTaggedTypesPost_TRecord(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecordItems': {
            const transformed = visitor.AllTaggedTypesPost_TRecordItems
                ? visitor.AllTaggedTypesPost_TRecordItems(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecordSpread': {
            const transformed = visitor.AllTaggedTypesPost_TRecordSpread
                ? visitor.AllTaggedTypesPost_TRecordSpread(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecordKeyValue': {
            const transformed = visitor.AllTaggedTypesPost_TRecordKeyValue
                ? visitor.AllTaggedTypesPost_TRecordKeyValue(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TApply': {
            const transformed = visitor.AllTaggedTypesPost_TApply
                ? visitor.AllTaggedTypesPost_TApply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TComma': {
            const transformed = visitor.AllTaggedTypesPost_TComma
                ? visitor.AllTaggedTypesPost_TComma(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TVars': {
            const transformed = visitor.AllTaggedTypesPost_TVars
                ? visitor.AllTaggedTypesPost_TVars(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TBargs': {
            const transformed = visitor.AllTaggedTypesPost_TBargs
                ? visitor.AllTaggedTypesPost_TBargs(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TBArg': {
            const transformed = visitor.AllTaggedTypesPost_TBArg
                ? visitor.AllTaggedTypesPost_TBArg(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TDecorated': {
            const transformed = visitor.AllTaggedTypesPost_TDecorated
                ? visitor.AllTaggedTypesPost_TDecorated(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRef': {
            const transformed = visitor.AllTaggedTypesPost_TRef
                ? visitor.AllTaggedTypesPost_TRef(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TOps': {
            const transformed = visitor.AllTaggedTypesPost_TOps
                ? visitor.AllTaggedTypesPost_TOps(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRight': {
            const transformed = visitor.AllTaggedTypesPost_TRight
                ? visitor.AllTaggedTypesPost_TRight(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TParens': {
            const transformed = visitor.AllTaggedTypesPost_TParens
                ? visitor.AllTaggedTypesPost_TParens(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TArg': {
            const transformed = visitor.AllTaggedTypesPost_TArg
                ? visitor.AllTaggedTypesPost_TArg(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TArgs': {
            const transformed = visitor.AllTaggedTypesPost_TArgs
                ? visitor.AllTaggedTypesPost_TArgs(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TLambda': {
            const transformed = visitor.AllTaggedTypesPost_TLambda
                ? visitor.AllTaggedTypesPost_TLambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeAlias': {
            const transformed = visitor.AllTaggedTypesPost_TypeAlias
                ? visitor.AllTaggedTypesPost_TypeAlias(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypePair': {
            const transformed = visitor.AllTaggedTypesPost_TypePair
                ? visitor.AllTaggedTypesPost_TypePair(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TBlank': {
            const transformed = visitor.AllTaggedTypesPost_TBlank
                ? visitor.AllTaggedTypesPost_TBlank(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
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
