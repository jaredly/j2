import {
    GlobalRef,
    Id,
    RefKind,
    Loc,
    File,
    Toplevel,
    ToplevelExpression,
    Expression,
    If,
    Block,
    Stmt,
    Let,
    Pattern,
    PName,
    Sym,
    PRecord,
    PBlank,
    PEnum,
    Number,
    String,
    PDecorated,
    Decorator,
    UnresolvedRef,
    DecoratorArg,
    DExpr,
    DType,
    Type,
    TRef,
    TVbl,
    TBlank,
    TLambda,
    TEnum,
    EnumCase,
    TVars,
    TVar,
    TDecorated,
    TApply,
    TRecord,
    TRecordKeyValue,
    TOps,
    Ref,
    Enum,
    Apply,
    Lambda,
    LArg,
    Record,
    RecordKeyValue,
    Switch,
    Case,
    Boolean,
    TemplateString,
    TypeApplication,
    DecoratedExpression,
    TypeAlias,
    ToplevelLet,
    ToplevelAliases,
    TypeToplevel,
    TypeFile,
    IExpression,
    ILambda,
    IApply,
    ITemplateString,
    IEnum,
    IRecord,
    IRecordKeyValue,
    IBlock,
    IStmt,
    ILet,
    IAssign,
    IReturn,
    IIf,
    ISwitch,
    ICase,
    DecoratorDecl,
    TypeVariables,
    TAdd,
    TSub,
    TOr,
} from './typed-ast';

export type Visitor<Ctx> = {
    GlobalRef?: (
        node: GlobalRef,
        ctx: Ctx,
    ) => null | false | GlobalRef | [GlobalRef | null, Ctx];
    GlobalRefPost?: (node: GlobalRef, ctx: Ctx) => null | GlobalRef;
    RefKind?: (
        node: RefKind,
        ctx: Ctx,
    ) => null | false | RefKind | [RefKind | null, Ctx];
    RefKindPost?: (node: RefKind, ctx: Ctx) => null | RefKind;
    Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx];
    LocPost?: (node: Loc, ctx: Ctx) => null | Loc;
    File?: (node: File, ctx: Ctx) => null | false | File | [File | null, Ctx];
    FilePost?: (node: File, ctx: Ctx) => null | File;
    TypeToplevel?: (
        node: TypeToplevel,
        ctx: Ctx,
    ) => null | false | TypeToplevel | [TypeToplevel | null, Ctx];
    TypeToplevelPost?: (node: TypeToplevel, ctx: Ctx) => null | TypeToplevel;
    TypeFile?: (
        node: TypeFile,
        ctx: Ctx,
    ) => null | false | TypeFile | [TypeFile | null, Ctx];
    TypeFilePost?: (node: TypeFile, ctx: Ctx) => null | TypeFile;
    UnresolvedRef?: (
        node: UnresolvedRef,
        ctx: Ctx,
    ) => null | false | UnresolvedRef | [UnresolvedRef | null, Ctx];
    UnresolvedRefPost?: (node: UnresolvedRef, ctx: Ctx) => null | UnresolvedRef;
    Ref?: (node: Ref, ctx: Ctx) => null | false | Ref | [Ref | null, Ctx];
    RefPost?: (node: Ref, ctx: Ctx) => null | Ref;
    ToplevelExpression?: (
        node: ToplevelExpression,
        ctx: Ctx,
    ) => null | false | ToplevelExpression | [ToplevelExpression | null, Ctx];
    ToplevelExpressionPost?: (
        node: ToplevelExpression,
        ctx: Ctx,
    ) => null | ToplevelExpression;
    ToplevelLet?: (
        node: ToplevelLet,
        ctx: Ctx,
    ) => null | false | ToplevelLet | [ToplevelLet | null, Ctx];
    ToplevelLetPost?: (node: ToplevelLet, ctx: Ctx) => null | ToplevelLet;
    Toplevel?: (
        node: Toplevel,
        ctx: Ctx,
    ) => null | false | Toplevel | [Toplevel | null, Ctx];
    ToplevelPost?: (node: Toplevel, ctx: Ctx) => null | Toplevel;
    ToplevelAliases?: (
        node: ToplevelAliases,
        ctx: Ctx,
    ) => null | false | ToplevelAliases | [ToplevelAliases | null, Ctx];
    ToplevelAliasesPost?: (
        node: ToplevelAliases,
        ctx: Ctx,
    ) => null | ToplevelAliases;
    TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | false | TypeAlias | [TypeAlias | null, Ctx];
    TypeAliasPost?: (node: TypeAlias, ctx: Ctx) => null | TypeAlias;
    Expression?: (
        node: Expression,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost?: (node: Expression, ctx: Ctx) => null | Expression;
    IExpression?: (
        node: IExpression,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost?: (node: IExpression, ctx: Ctx) => null | IExpression;
    Sym?: (node: Sym, ctx: Ctx) => null | false | Sym | [Sym | null, Ctx];
    SymPost?: (node: Sym, ctx: Ctx) => null | Sym;
    Apply?: (
        node: Apply,
        ctx: Ctx,
    ) => null | false | Apply | [Apply | null, Ctx];
    ApplyPost?: (node: Apply, ctx: Ctx) => null | Apply;
    IApply?: (
        node: IApply,
        ctx: Ctx,
    ) => null | false | IApply | [IApply | null, Ctx];
    IApplyPost?: (node: IApply, ctx: Ctx) => null | IApply;
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
    TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | false | TemplateString | [TemplateString | null, Ctx];
    TemplateStringPost?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | TemplateString;
    ITemplateString?: (
        node: ITemplateString,
        ctx: Ctx,
    ) => null | false | ITemplateString | [ITemplateString | null, Ctx];
    ITemplateStringPost?: (
        node: ITemplateString,
        ctx: Ctx,
    ) => null | ITemplateString;
    String?: (
        node: String,
        ctx: Ctx,
    ) => null | false | String | [String | null, Ctx];
    StringPost?: (node: String, ctx: Ctx) => null | String;
    DecoratorDecl?: (
        node: DecoratorDecl,
        ctx: Ctx,
    ) => null | false | DecoratorDecl | [DecoratorDecl | null, Ctx];
    DecoratorDeclPost?: (node: DecoratorDecl, ctx: Ctx) => null | DecoratorDecl;
    Decorator?: (
        node: Decorator,
        ctx: Ctx,
    ) => null | false | Decorator | [Decorator | null, Ctx];
    DecoratorPost?: (node: Decorator, ctx: Ctx) => null | Decorator;
    DType?: (
        node: DType,
        ctx: Ctx,
    ) => null | false | DType | [DType | null, Ctx];
    DTypePost?: (node: DType, ctx: Ctx) => null | DType;
    DExpr?: (
        node: DExpr,
        ctx: Ctx,
    ) => null | false | DExpr | [DExpr | null, Ctx];
    DExprPost?: (node: DExpr, ctx: Ctx) => null | DExpr;
    DecoratorArg?: (
        node: DecoratorArg,
        ctx: Ctx,
    ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
    DecoratorArgPost?: (node: DecoratorArg, ctx: Ctx) => null | DecoratorArg;
    DecoratedExpression?: (
        node: DecoratedExpression,
        ctx: Ctx,
    ) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx];
    DecoratedExpressionPost?: (
        node: DecoratedExpression,
        ctx: Ctx,
    ) => null | DecoratedExpression;
    Enum?: (node: Enum, ctx: Ctx) => null | false | Enum | [Enum | null, Ctx];
    EnumPost?: (node: Enum, ctx: Ctx) => null | Enum;
    IEnum?: (
        node: IEnum,
        ctx: Ctx,
    ) => null | false | IEnum | [IEnum | null, Ctx];
    IEnumPost?: (node: IEnum, ctx: Ctx) => null | IEnum;
    TypeApplication?: (
        node: TypeApplication,
        ctx: Ctx,
    ) => null | false | TypeApplication | [TypeApplication | null, Ctx];
    TypeApplicationPost?: (
        node: TypeApplication,
        ctx: Ctx,
    ) => null | TypeApplication;
    TypeVariables?: (
        node: TypeVariables,
        ctx: Ctx,
    ) => null | false | TypeVariables | [TypeVariables | null, Ctx];
    TypeVariablesPost?: (node: TypeVariables, ctx: Ctx) => null | TypeVariables;
    TOps?: (node: TOps, ctx: Ctx) => null | false | TOps | [TOps | null, Ctx];
    TOpsPost?: (node: TOps, ctx: Ctx) => null | TOps;
    TRef?: (node: TRef, ctx: Ctx) => null | false | TRef | [TRef | null, Ctx];
    TRefPost?: (node: TRef, ctx: Ctx) => null | TRef;
    TDecorated?: (
        node: TDecorated,
        ctx: Ctx,
    ) => null | false | TDecorated | [TDecorated | null, Ctx];
    TDecoratedPost?: (node: TDecorated, ctx: Ctx) => null | TDecorated;
    TLambda?: (
        node: TLambda,
        ctx: Ctx,
    ) => null | false | TLambda | [TLambda | null, Ctx];
    TLambdaPost?: (node: TLambda, ctx: Ctx) => null | TLambda;
    TVbl?: (node: TVbl, ctx: Ctx) => null | false | TVbl | [TVbl | null, Ctx];
    TVblPost?: (node: TVbl, ctx: Ctx) => null | TVbl;
    TBlank?: (
        node: TBlank,
        ctx: Ctx,
    ) => null | false | TBlank | [TBlank | null, Ctx];
    TBlankPost?: (node: TBlank, ctx: Ctx) => null | TBlank;
    Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx];
    TypePost?: (node: Type, ctx: Ctx) => null | Type;
    TAdd?: (node: TAdd, ctx: Ctx) => null | false | TAdd | [TAdd | null, Ctx];
    TAddPost?: (node: TAdd, ctx: Ctx) => null | TAdd;
    TSub?: (node: TSub, ctx: Ctx) => null | false | TSub | [TSub | null, Ctx];
    TSubPost?: (node: TSub, ctx: Ctx) => null | TSub;
    TOr?: (node: TOr, ctx: Ctx) => null | false | TOr | [TOr | null, Ctx];
    TOrPost?: (node: TOr, ctx: Ctx) => null | TOr;
    Id?: (node: Id, ctx: Ctx) => null | false | Id | [Id | null, Ctx];
    IdPost?: (node: Id, ctx: Ctx) => null | Id;
    Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | Record | [Record | null, Ctx];
    RecordPost?: (node: Record, ctx: Ctx) => null | Record;
    RecordKeyValue?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | false | RecordKeyValue | [RecordKeyValue | null, Ctx];
    RecordKeyValuePost?: (
        node: RecordKeyValue,
        ctx: Ctx,
    ) => null | RecordKeyValue;
    IRecord?: (
        node: IRecord,
        ctx: Ctx,
    ) => null | false | IRecord | [IRecord | null, Ctx];
    IRecordPost?: (node: IRecord, ctx: Ctx) => null | IRecord;
    IRecordKeyValue?: (
        node: IRecordKeyValue,
        ctx: Ctx,
    ) => null | false | IRecordKeyValue | [IRecordKeyValue | null, Ctx];
    IRecordKeyValuePost?: (
        node: IRecordKeyValue,
        ctx: Ctx,
    ) => null | IRecordKeyValue;
    Lambda?: (
        node: Lambda,
        ctx: Ctx,
    ) => null | false | Lambda | [Lambda | null, Ctx];
    LambdaPost?: (node: Lambda, ctx: Ctx) => null | Lambda;
    LArg?: (node: LArg, ctx: Ctx) => null | false | LArg | [LArg | null, Ctx];
    LArgPost?: (node: LArg, ctx: Ctx) => null | LArg;
    ILambda?: (
        node: ILambda,
        ctx: Ctx,
    ) => null | false | ILambda | [ILambda | null, Ctx];
    ILambdaPost?: (node: ILambda, ctx: Ctx) => null | ILambda;
    Block?: (
        node: Block,
        ctx: Ctx,
    ) => null | false | Block | [Block | null, Ctx];
    BlockPost?: (node: Block, ctx: Ctx) => null | Block;
    Stmt?: (node: Stmt, ctx: Ctx) => null | false | Stmt | [Stmt | null, Ctx];
    StmtPost?: (node: Stmt, ctx: Ctx) => null | Stmt;
    Let?: (node: Let, ctx: Ctx) => null | false | Let | [Let | null, Ctx];
    LetPost?: (node: Let, ctx: Ctx) => null | Let;
    IBlock?: (
        node: IBlock,
        ctx: Ctx,
    ) => null | false | IBlock | [IBlock | null, Ctx];
    IBlockPost?: (node: IBlock, ctx: Ctx) => null | IBlock;
    IStmt?: (
        node: IStmt,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost?: (node: IStmt, ctx: Ctx) => null | IStmt;
    IReturn?: (
        node: IReturn,
        ctx: Ctx,
    ) => null | false | IReturn | [IReturn | null, Ctx];
    IReturnPost?: (node: IReturn, ctx: Ctx) => null | IReturn;
    ILet?: (node: ILet, ctx: Ctx) => null | false | ILet | [ILet | null, Ctx];
    ILetPost?: (node: ILet, ctx: Ctx) => null | ILet;
    IAssign?: (
        node: IAssign,
        ctx: Ctx,
    ) => null | false | IAssign | [IAssign | null, Ctx];
    IAssignPost?: (node: IAssign, ctx: Ctx) => null | IAssign;
    TApply?: (
        node: TApply,
        ctx: Ctx,
    ) => null | false | TApply | [TApply | null, Ctx];
    TApplyPost?: (node: TApply, ctx: Ctx) => null | TApply;
    TVar?: (node: TVar, ctx: Ctx) => null | false | TVar | [TVar | null, Ctx];
    TVarPost?: (node: TVar, ctx: Ctx) => null | TVar;
    TVars?: (
        node: TVars,
        ctx: Ctx,
    ) => null | false | TVars | [TVars | null, Ctx];
    TVarsPost?: (node: TVars, ctx: Ctx) => null | TVars;
    TEnum?: (
        node: TEnum,
        ctx: Ctx,
    ) => null | false | TEnum | [TEnum | null, Ctx];
    TEnumPost?: (node: TEnum, ctx: Ctx) => null | TEnum;
    EnumCase?: (
        node: EnumCase,
        ctx: Ctx,
    ) => null | false | EnumCase | [EnumCase | null, Ctx];
    EnumCasePost?: (node: EnumCase, ctx: Ctx) => null | EnumCase;
    TRecord?: (
        node: TRecord,
        ctx: Ctx,
    ) => null | false | TRecord | [TRecord | null, Ctx];
    TRecordPost?: (node: TRecord, ctx: Ctx) => null | TRecord;
    TRecordKeyValue?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | false | TRecordKeyValue | [TRecordKeyValue | null, Ctx];
    TRecordKeyValuePost?: (
        node: TRecordKeyValue,
        ctx: Ctx,
    ) => null | TRecordKeyValue;
    PName?: (
        node: PName,
        ctx: Ctx,
    ) => null | false | PName | [PName | null, Ctx];
    PNamePost?: (node: PName, ctx: Ctx) => null | PName;
    PRecord?: (
        node: PRecord,
        ctx: Ctx,
    ) => null | false | PRecord | [PRecord | null, Ctx];
    PRecordPost?: (node: PRecord, ctx: Ctx) => null | PRecord;
    PEnum?: (
        node: PEnum,
        ctx: Ctx,
    ) => null | false | PEnum | [PEnum | null, Ctx];
    PEnumPost?: (node: PEnum, ctx: Ctx) => null | PEnum;
    Pattern?: (
        node: Pattern,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost?: (node: Pattern, ctx: Ctx) => null | Pattern;
    PDecorated?: (
        node: PDecorated,
        ctx: Ctx,
    ) => null | false | PDecorated | [PDecorated | null, Ctx];
    PDecoratedPost?: (node: PDecorated, ctx: Ctx) => null | PDecorated;
    PBlank?: (
        node: PBlank,
        ctx: Ctx,
    ) => null | false | PBlank | [PBlank | null, Ctx];
    PBlankPost?: (node: PBlank, ctx: Ctx) => null | PBlank;
    If?: (node: If, ctx: Ctx) => null | false | If | [If | null, Ctx];
    IfPost?: (node: If, ctx: Ctx) => null | If;
    IIf?: (node: IIf, ctx: Ctx) => null | false | IIf | [IIf | null, Ctx];
    IIfPost?: (node: IIf, ctx: Ctx) => null | IIf;
    Switch?: (
        node: Switch,
        ctx: Ctx,
    ) => null | false | Switch | [Switch | null, Ctx];
    SwitchPost?: (node: Switch, ctx: Ctx) => null | Switch;
    Case?: (node: Case, ctx: Ctx) => null | false | Case | [Case | null, Ctx];
    CasePost?: (node: Case, ctx: Ctx) => null | Case;
    ISwitch?: (
        node: ISwitch,
        ctx: Ctx,
    ) => null | false | ISwitch | [ISwitch | null, Ctx];
    ISwitchPost?: (node: ISwitch, ctx: Ctx) => null | ISwitch;
    ICase?: (
        node: ICase,
        ctx: Ctx,
    ) => null | false | ICase | [ICase | null, Ctx];
    ICasePost?: (node: ICase, ctx: Ctx) => null | ICase;
    RefKind_Global?: (
        node: GlobalRef,
        ctx: Ctx,
    ) => null | false | RefKind | [RefKind | null, Ctx];
    RefKindPost_Global?: (node: GlobalRef, ctx: Ctx) => null | RefKind;
    TypeToplevel_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | false | TypeToplevel | [TypeToplevel | null, Ctx];
    TypeToplevelPost_TypeAlias?: (
        node: TypeAlias,
        ctx: Ctx,
    ) => null | TypeToplevel;
    Toplevel_ToplevelExpression?: (
        node: ToplevelExpression,
        ctx: Ctx,
    ) => null | false | Toplevel | [Toplevel | null, Ctx];
    ToplevelPost_ToplevelExpression?: (
        node: ToplevelExpression,
        ctx: Ctx,
    ) => null | Toplevel;
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
    Toplevel_ToplevelAliases?: (
        node: ToplevelAliases,
        ctx: Ctx,
    ) => null | false | Toplevel | [Toplevel | null, Ctx];
    ToplevelPost_ToplevelAliases?: (
        node: ToplevelAliases,
        ctx: Ctx,
    ) => null | Toplevel;
    Expression_If?: (
        node: If,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_If?: (node: If, ctx: Ctx) => null | Expression;
    Expression_Ref?: (
        node: Ref,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Ref?: (node: Ref, ctx: Ctx) => null | Expression;
    Expression_Enum?: (
        node: Enum,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Enum?: (node: Enum, ctx: Ctx) => null | Expression;
    Expression_Block?: (
        node: Block,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Block?: (node: Block, ctx: Ctx) => null | Expression;
    Expression_Apply?: (
        node: Apply,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Apply?: (node: Apply, ctx: Ctx) => null | Expression;
    Expression_Lambda?: (
        node: Lambda,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Lambda?: (node: Lambda, ctx: Ctx) => null | Expression;
    Expression_Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Record?: (node: Record, ctx: Ctx) => null | Expression;
    Expression_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Number?: (node: Number, ctx: Ctx) => null | Expression;
    Expression_Switch?: (
        node: Switch,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Switch?: (node: Switch, ctx: Ctx) => null | Expression;
    Expression_Boolean?: (
        node: Boolean,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_Boolean?: (node: Boolean, ctx: Ctx) => null | Expression;
    Expression_TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_TemplateString?: (
        node: TemplateString,
        ctx: Ctx,
    ) => null | Expression;
    Expression_TypeApplication?: (
        node: TypeApplication,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_TypeApplication?: (
        node: TypeApplication,
        ctx: Ctx,
    ) => null | Expression;
    Expression_DecoratedExpression?: (
        node: DecoratedExpression,
        ctx: Ctx,
    ) => null | false | Expression | [Expression | null, Ctx];
    ExpressionPost_DecoratedExpression?: (
        node: DecoratedExpression,
        ctx: Ctx,
    ) => null | Expression;
    IExpression_Ref?: (
        node: Ref,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Ref?: (node: Ref, ctx: Ctx) => null | IExpression;
    IExpression_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Number?: (node: Number, ctx: Ctx) => null | IExpression;
    IExpression_Lambda?: (
        node: ILambda,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Lambda?: (node: ILambda, ctx: Ctx) => null | IExpression;
    IExpression_Boolean?: (
        node: Boolean,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Boolean?: (node: Boolean, ctx: Ctx) => null | IExpression;
    IExpression_Apply?: (
        node: IApply,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Apply?: (node: IApply, ctx: Ctx) => null | IExpression;
    IExpression_TemplateString?: (
        node: ITemplateString,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_TemplateString?: (
        node: ITemplateString,
        ctx: Ctx,
    ) => null | IExpression;
    IExpression_Enum?: (
        node: IEnum,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Enum?: (node: IEnum, ctx: Ctx) => null | IExpression;
    IExpression_Record?: (
        node: IRecord,
        ctx: Ctx,
    ) => null | false | IExpression | [IExpression | null, Ctx];
    IExpressionPost_Record?: (node: IRecord, ctx: Ctx) => null | IExpression;
    DecoratorArg_DExpr?: (
        node: DExpr,
        ctx: Ctx,
    ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
    DecoratorArgPost_DExpr?: (node: DExpr, ctx: Ctx) => null | DecoratorArg;
    DecoratorArg_DType?: (
        node: DType,
        ctx: Ctx,
    ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
    DecoratorArgPost_DType?: (node: DType, ctx: Ctx) => null | DecoratorArg;
    Type_TRef?: (
        node: TRef,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TRef?: (node: TRef, ctx: Ctx) => null | Type;
    Type_TVbl?: (
        node: TVbl,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TVbl?: (node: TVbl, ctx: Ctx) => null | Type;
    Type_TBlank?: (
        node: TBlank,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TBlank?: (node: TBlank, ctx: Ctx) => null | Type;
    Type_TLambda?: (
        node: TLambda,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TLambda?: (node: TLambda, ctx: Ctx) => null | Type;
    Type_TEnum?: (
        node: TEnum,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TEnum?: (node: TEnum, ctx: Ctx) => null | Type;
    Type_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_Number?: (node: Number, ctx: Ctx) => null | Type;
    Type_String?: (
        node: String,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_String?: (node: String, ctx: Ctx) => null | Type;
    Type_TVars?: (
        node: TVars,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TVars?: (node: TVars, ctx: Ctx) => null | Type;
    Type_TDecorated?: (
        node: TDecorated,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TDecorated?: (node: TDecorated, ctx: Ctx) => null | Type;
    Type_TApply?: (
        node: TApply,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TApply?: (node: TApply, ctx: Ctx) => null | Type;
    Type_TRecord?: (
        node: TRecord,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TRecord?: (node: TRecord, ctx: Ctx) => null | Type;
    Type_TOps?: (
        node: TOps,
        ctx: Ctx,
    ) => null | false | Type | [Type | null, Ctx];
    TypePost_TOps?: (node: TOps, ctx: Ctx) => null | Type;
    Stmt_Let?: (
        node: Let,
        ctx: Ctx,
    ) => null | false | Stmt | [Stmt | null, Ctx];
    StmtPost_Let?: (node: Let, ctx: Ctx) => null | Stmt;
    IStmt_Let?: (
        node: ILet,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost_Let?: (node: ILet, ctx: Ctx) => null | IStmt;
    IStmt_Assign?: (
        node: IAssign,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost_Assign?: (node: IAssign, ctx: Ctx) => null | IStmt;
    IStmt_Block?: (
        node: IBlock,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost_Block?: (node: IBlock, ctx: Ctx) => null | IStmt;
    IStmt_Return?: (
        node: IReturn,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost_Return?: (node: IReturn, ctx: Ctx) => null | IStmt;
    IStmt_If?: (
        node: IIf,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost_If?: (node: IIf, ctx: Ctx) => null | IStmt;
    IStmt_Switch?: (
        node: ISwitch,
        ctx: Ctx,
    ) => null | false | IStmt | [IStmt | null, Ctx];
    IStmtPost_Switch?: (node: ISwitch, ctx: Ctx) => null | IStmt;
    Pattern_PName?: (
        node: PName,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PName?: (node: PName, ctx: Ctx) => null | Pattern;
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
    Pattern_PEnum?: (
        node: PEnum,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PEnum?: (node: PEnum, ctx: Ctx) => null | Pattern;
    Pattern_Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_Number?: (node: Number, ctx: Ctx) => null | Pattern;
    Pattern_String?: (
        node: String,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_String?: (node: String, ctx: Ctx) => null | Pattern;
    Pattern_PDecorated?: (
        node: PDecorated,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_PDecorated?: (node: PDecorated, ctx: Ctx) => null | Pattern;
};
export const transformId = <Ctx>(
    node: Id,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Id => {
    if (!node) {
        throw new Error('No Id provided');
    }

    const transformed = visitor.Id ? visitor.Id(node, ctx) : null;
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
    if (visitor.IdPost) {
        const transformed = visitor.IdPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformGlobalRef = <Ctx>(
    node: GlobalRef,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): GlobalRef => {
    if (!node) {
        throw new Error('No GlobalRef provided');
    }

    const transformed = visitor.GlobalRef ? visitor.GlobalRef(node, ctx) : null;
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

        const updatedNode$id = transformId(node.id, visitor, ctx);
        changed1 = changed1 || updatedNode$id !== node.id;
        if (changed1) {
            updatedNode = { ...updatedNode, id: updatedNode$id };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.GlobalRefPost) {
        const transformed = visitor.GlobalRefPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformRefKind = <Ctx>(
    node: RefKind,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): RefKind => {
    if (!node) {
        throw new Error('No RefKind provided');
    }

    const transformed = visitor.RefKind ? visitor.RefKind(node, ctx) : null;
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
        case 'Global': {
            const transformed = visitor.RefKind_Global
                ? visitor.RefKind_Global(node, ctx)
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
        case 'Global': {
            updatedNode = transformGlobalRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Local':
            break;

        case 'Recur':
            break;
    }

    switch (updatedNode.type) {
        case 'Global': {
            const transformed = visitor.RefKindPost_Global
                ? visitor.RefKindPost_Global(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.RefKindPost) {
        const transformed = visitor.RefKindPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
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

export const transformSym = <Ctx>(
    node: Sym,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Sym => {
    if (!node) {
        throw new Error('No Sym provided');
    }

    const transformed = visitor.Sym ? visitor.Sym(node, ctx) : null;
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
    if (visitor.SymPost) {
        const transformed = visitor.SymPost(node, ctx);
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

        const updatedNode$sym = transformSym(node.sym, visitor, ctx);
        changed1 = changed1 || updatedNode$sym !== node.sym;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                sym: updatedNode$sym,
                loc: updatedNode$loc,
            };
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

        let updatedNode$items = node.items;
        {
            let changed2 = false;
            const arr1 = node.items.map((updatedNode$items$item1) => {
                let result = updatedNode$items$item1;
                {
                    let changed3 = false;

                    const result$pat = transformPattern(
                        updatedNode$items$item1.pat,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$pat !== updatedNode$items$item1.pat;
                    if (changed3) {
                        result = { ...result, pat: result$pat };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$items = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                items: updatedNode$items,
                loc: updatedNode$loc,
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

export const transformPEnum = <Ctx>(
    node: PEnum,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PEnum => {
    if (!node) {
        throw new Error('No PEnum provided');
    }

    const transformed = visitor.PEnum ? visitor.PEnum(node, ctx) : null;
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

        let updatedNode$payload = null;
        const updatedNode$payload$current = node.payload;
        if (updatedNode$payload$current != null) {
            const updatedNode$payload$1$ = transformPattern(
                updatedNode$payload$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$payload$1$ !== updatedNode$payload$current;
            updatedNode$payload = updatedNode$payload$1$;
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                payload: updatedNode$payload,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.PEnumPost) {
        const transformed = visitor.PEnumPost(node, ctx);
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

export const transformUnresolvedRef = <Ctx>(
    node: UnresolvedRef,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): UnresolvedRef => {
    if (!node) {
        throw new Error('No UnresolvedRef provided');
    }

    const transformed = visitor.UnresolvedRef
        ? visitor.UnresolvedRef(node, ctx)
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
    if (visitor.UnresolvedRefPost) {
        const transformed = visitor.UnresolvedRefPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformDExpr = <Ctx>(
    node: DExpr,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): DExpr => {
    if (!node) {
        throw new Error('No DExpr provided');
    }

    const transformed = visitor.DExpr ? visitor.DExpr(node, ctx) : null;
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

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.DExprPost) {
        const transformed = visitor.DExprPost(node, ctx);
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

        let updatedNode$ref = node.ref;

        switch (node.ref.type) {
            case 'Global': {
                updatedNode$ref = transformGlobalRef(node.ref, visitor, ctx);
                changed1 = changed1 || updatedNode$ref !== node.ref;
                break;
            }

            case 'Local':
                break;

            case 'Recur':
                break;

            default: {
                // let changed2 = false;

                const updatedNode$ref$1node = transformUnresolvedRef(
                    node.ref,
                    visitor,
                    ctx,
                );
                changed1 = changed1 || updatedNode$ref$1node !== node.ref;
                updatedNode$ref = updatedNode$ref$1node;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                ref: updatedNode$ref,
                loc: updatedNode$loc,
            };
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

export const transformTVbl = <Ctx>(
    node: TVbl,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TVbl => {
    if (!node) {
        throw new Error('No TVbl provided');
    }

    const transformed = visitor.TVbl ? visitor.TVbl(node, ctx) : null;
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
    if (visitor.TVblPost) {
        const transformed = visitor.TVblPost(node, ctx);
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

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                let result = updatedNode$args$item1;
                {
                    let changed3 = false;

                    const result$typ = transformType(
                        updatedNode$args$item1.typ,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$typ !== updatedNode$args$item1.typ;

                    const result$loc = transformLoc(
                        updatedNode$args$item1.loc,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$loc !== updatedNode$args$item1.loc;
                    if (changed3) {
                        result = {
                            ...result,
                            typ: result$typ,
                            loc: result$loc,
                        };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$args = arr1;
                changed1 = true;
            }
        }

        const updatedNode$result = transformType(node.result, visitor, ctx);
        changed1 = changed1 || updatedNode$result !== node.result;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                args: updatedNode$args,
                result: updatedNode$result,
                loc: updatedNode$loc,
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

    let updatedNode = node;
    {
        let changed1 = false;

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

        let updatedNode$payload = undefined;
        const updatedNode$payload$current = node.payload;
        if (updatedNode$payload$current != null) {
            const updatedNode$payload$1$ = transformType(
                updatedNode$payload$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$payload$1$ !== updatedNode$payload$current;
            updatedNode$payload = updatedNode$payload$1$;
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                decorators: updatedNode$decorators,
                payload: updatedNode$payload,
                loc: updatedNode$loc,
            };
            changed0 = true;
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

        let updatedNode$cases = node.cases;
        {
            let changed2 = false;
            const arr1 = node.cases.map((updatedNode$cases$item1) => {
                let result = updatedNode$cases$item1;

                switch (updatedNode$cases$item1.type) {
                    case 'EnumCase': {
                        result = transformEnumCase(
                            updatedNode$cases$item1,
                            visitor,
                            ctx,
                        );
                        changed2 =
                            changed2 || result !== updatedNode$cases$item1;
                        break;
                    }

                    default: {
                        // let changed3 = false;

                        const result$2node = transformType(
                            updatedNode$cases$item1,
                            visitor,
                            ctx,
                        );
                        changed2 =
                            changed2 ||
                            result$2node !== updatedNode$cases$item1;
                        result = result$2node;
                    }
                }
                return result;
            });
            if (changed2) {
                updatedNode$cases = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                cases: updatedNode$cases,
                loc: updatedNode$loc,
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

export const transformTVar = <Ctx>(
    node: TVar,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TVar => {
    if (!node) {
        throw new Error('No TVar provided');
    }

    const transformed = visitor.TVar ? visitor.TVar(node, ctx) : null;
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

        const updatedNode$sym = transformSym(node.sym, visitor, ctx);
        changed1 = changed1 || updatedNode$sym !== node.sym;

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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;

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
                sym: updatedNode$sym,
                bound: updatedNode$bound,
                loc: updatedNode$loc,
                default_: updatedNode$default_,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TVarPost) {
        const transformed = visitor.TVarPost(node, ctx);
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

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformTVar(
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

        const updatedNode$inner = transformType(node.inner, visitor, ctx);
        changed1 = changed1 || updatedNode$inner !== node.inner;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                args: updatedNode$args,
                inner: updatedNode$inner,
                loc: updatedNode$loc,
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

        const updatedNode$inner = transformType(node.inner, visitor, ctx);
        changed1 = changed1 || updatedNode$inner !== node.inner;

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

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                inner: updatedNode$inner,
                decorators: updatedNode$decorators,
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

    let updatedNode = node;
    {
        let changed1 = false;

        const updatedNode$target = transformType(node.target, visitor, ctx);
        changed1 = changed1 || updatedNode$target !== node.target;

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformType(
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                target: updatedNode$target,
                args: updatedNode$args,
                loc: updatedNode$loc,
            };
            changed0 = true;
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                value: updatedNode$value,
                default_: updatedNode$default_,
                loc: updatedNode$loc,
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

        let updatedNode$items = node.items;
        {
            let changed2 = false;
            const arr1 = node.items.map((updatedNode$items$item1) => {
                const result = transformTRecordKeyValue(
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

        let updatedNode$spreads = node.spreads;
        {
            let changed2 = false;
            const arr1 = node.spreads.map((updatedNode$spreads$item1) => {
                const result = transformType(
                    updatedNode$spreads$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$spreads$item1;
                return result;
            });
            if (changed2) {
                updatedNode$spreads = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                items: updatedNode$items,
                spreads: updatedNode$spreads,
                loc: updatedNode$loc,
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

    let updatedNode = node;
    {
        let changed1 = false;

        const updatedNode$left = transformType(node.left, visitor, ctx);
        changed1 = changed1 || updatedNode$left !== node.left;

        let updatedNode$right = node.right;
        {
            let changed2 = false;
            const arr1 = node.right.map((updatedNode$right$item1) => {
                let result = updatedNode$right$item1;
                {
                    let changed3 = false;

                    const result$right = transformType(
                        updatedNode$right$item1.right,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$right !== updatedNode$right$item1.right;
                    if (changed3) {
                        result = { ...result, right: result$right };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$right = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                left: updatedNode$left,
                right: updatedNode$right,
                loc: updatedNode$loc,
            };
            changed0 = true;
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

    switch (node.type) {
        case 'TRef': {
            const transformed = visitor.Type_TRef
                ? visitor.Type_TRef(node, ctx)
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

        case 'TVbl': {
            const transformed = visitor.Type_TVbl
                ? visitor.Type_TVbl(node, ctx)
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
            const transformed = visitor.Type_TBlank
                ? visitor.Type_TBlank(node, ctx)
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
            const transformed = visitor.Type_TLambda
                ? visitor.Type_TLambda(node, ctx)
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
            const transformed = visitor.Type_TEnum
                ? visitor.Type_TEnum(node, ctx)
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
            const transformed = visitor.Type_Number
                ? visitor.Type_Number(node, ctx)
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
            const transformed = visitor.Type_String
                ? visitor.Type_String(node, ctx)
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
            const transformed = visitor.Type_TVars
                ? visitor.Type_TVars(node, ctx)
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
            const transformed = visitor.Type_TDecorated
                ? visitor.Type_TDecorated(node, ctx)
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
            const transformed = visitor.Type_TApply
                ? visitor.Type_TApply(node, ctx)
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
            const transformed = visitor.Type_TRecord
                ? visitor.Type_TRecord(node, ctx)
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
            const transformed = visitor.Type_TOps
                ? visitor.Type_TOps(node, ctx)
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
        case 'TRef': {
            updatedNode = transformTRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TVbl': {
            updatedNode = transformTVbl(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TBlank': {
            updatedNode = transformTBlank(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TLambda': {
            updatedNode = transformTLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TEnum': {
            updatedNode = transformTEnum(node, visitor, ctx);
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

        case 'TVars': {
            updatedNode = transformTVars(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TDecorated': {
            updatedNode = transformTDecorated(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TApply': {
            updatedNode = transformTApply(node, visitor, ctx);
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

            const updatedNode$0node = transformTOps(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'TRef': {
            const transformed = visitor.TypePost_TRef
                ? visitor.TypePost_TRef(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TVbl': {
            const transformed = visitor.TypePost_TVbl
                ? visitor.TypePost_TVbl(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TBlank': {
            const transformed = visitor.TypePost_TBlank
                ? visitor.TypePost_TBlank(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TLambda': {
            const transformed = visitor.TypePost_TLambda
                ? visitor.TypePost_TLambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TEnum': {
            const transformed = visitor.TypePost_TEnum
                ? visitor.TypePost_TEnum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.TypePost_Number
                ? visitor.TypePost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'String': {
            const transformed = visitor.TypePost_String
                ? visitor.TypePost_String(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TVars': {
            const transformed = visitor.TypePost_TVars
                ? visitor.TypePost_TVars(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TDecorated': {
            const transformed = visitor.TypePost_TDecorated
                ? visitor.TypePost_TDecorated(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TApply': {
            const transformed = visitor.TypePost_TApply
                ? visitor.TypePost_TApply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TRecord': {
            const transformed = visitor.TypePost_TRecord
                ? visitor.TypePost_TRecord(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TOps': {
            const transformed = visitor.TypePost_TOps
                ? visitor.TypePost_TOps(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.TypePost) {
        const transformed = visitor.TypePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformDType = <Ctx>(
    node: DType,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): DType => {
    if (!node) {
        throw new Error('No DType provided');
    }

    const transformed = visitor.DType ? visitor.DType(node, ctx) : null;
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

        const updatedNode$typ = transformType(node.typ, visitor, ctx);
        changed1 = changed1 || updatedNode$typ !== node.typ;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                typ: updatedNode$typ,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.DTypePost) {
        const transformed = visitor.DTypePost(node, ctx);
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
        case 'DExpr': {
            const transformed = visitor.DecoratorArg_DExpr
                ? visitor.DecoratorArg_DExpr(node, ctx)
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

        case 'DType': {
            const transformed = visitor.DecoratorArg_DType
                ? visitor.DecoratorArg_DType(node, ctx)
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
        case 'DExpr': {
            updatedNode = transformDExpr(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformDType(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'DExpr': {
            const transformed = visitor.DecoratorArgPost_DExpr
                ? visitor.DecoratorArgPost_DExpr(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DType': {
            const transformed = visitor.DecoratorArgPost_DType
                ? visitor.DecoratorArgPost_DType(updatedNode, ctx)
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

        let updatedNode$id = node.id;
        {
            let changed2 = false;

            let updatedNode$id$ref = node.id.ref;

            switch (node.id.ref.type) {
                case 'Global': {
                    updatedNode$id$ref = transformGlobalRef(
                        node.id.ref,
                        visitor,
                        ctx,
                    );
                    changed2 = changed2 || updatedNode$id$ref !== node.id.ref;
                    break;
                }

                case 'Local':
                    break;

                case 'Recur':
                    break;

                default: {
                    // let changed3 = false;

                    const updatedNode$id$ref$2node = transformUnresolvedRef(
                        node.id.ref,
                        visitor,
                        ctx,
                    );
                    changed2 =
                        changed2 || updatedNode$id$ref$2node !== node.id.ref;
                    updatedNode$id$ref = updatedNode$id$ref$2node;
                }
            }

            const updatedNode$id$loc = transformLoc(node.id.loc, visitor, ctx);
            changed2 = changed2 || updatedNode$id$loc !== node.id.loc;
            if (changed2) {
                updatedNode$id = {
                    ...updatedNode$id,
                    ref: updatedNode$id$ref,
                    loc: updatedNode$id$loc,
                };
                changed1 = true;
            }
        }

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                let result = updatedNode$args$item1;
                {
                    let changed3 = false;

                    const result$arg = transformDecoratorArg(
                        updatedNode$args$item1.arg,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$arg !== updatedNode$args$item1.arg;

                    const result$loc = transformLoc(
                        updatedNode$args$item1.loc,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$loc !== updatedNode$args$item1.loc;
                    if (changed3) {
                        result = {
                            ...result,
                            arg: result$arg,
                            loc: result$loc,
                        };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$args = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                id: updatedNode$id,
                args: updatedNode$args,
                loc: updatedNode$loc,
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

export const transformPDecorated = <Ctx>(
    node: PDecorated,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): PDecorated => {
    if (!node) {
        throw new Error('No PDecorated provided');
    }

    const transformed = visitor.PDecorated
        ? visitor.PDecorated(node, ctx)
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

        const updatedNode$inner = transformPattern(node.inner, visitor, ctx);
        changed1 = changed1 || updatedNode$inner !== node.inner;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                decorators: updatedNode$decorators,
                inner: updatedNode$inner,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.PDecoratedPost) {
        const transformed = visitor.PDecoratedPost(node, ctx);
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

        case 'PEnum': {
            const transformed = visitor.Pattern_PEnum
                ? visitor.Pattern_PEnum(node, ctx)
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
            const transformed = visitor.Pattern_Number
                ? visitor.Pattern_Number(node, ctx)
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
            const transformed = visitor.Pattern_String
                ? visitor.Pattern_String(node, ctx)
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

        case 'PDecorated': {
            const transformed = visitor.Pattern_PDecorated
                ? visitor.Pattern_PDecorated(node, ctx)
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

        case 'PEnum': {
            updatedNode = transformPEnum(node, visitor, ctx);
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

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformPDecorated(node, visitor, ctx);
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

        case 'PEnum': {
            const transformed = visitor.PatternPost_PEnum
                ? visitor.PatternPost_PEnum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.PatternPost_Number
                ? visitor.PatternPost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'String': {
            const transformed = visitor.PatternPost_String
                ? visitor.PatternPost_String(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'PDecorated': {
            const transformed = visitor.PatternPost_PDecorated
                ? visitor.PatternPost_PDecorated(updatedNode, ctx)
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                pat: updatedNode$pat,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
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

        let updatedNode$stmts = node.stmts;
        {
            let changed2 = false;
            const arr1 = node.stmts.map((updatedNode$stmts$item1) => {
                const result = transformStmt(
                    updatedNode$stmts$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$stmts$item1;
                return result;
            });
            if (changed2) {
                updatedNode$stmts = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                stmts: updatedNode$stmts,
                loc: updatedNode$loc,
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

        const updatedNode$cond = transformExpression(node.cond, visitor, ctx);
        changed1 = changed1 || updatedNode$cond !== node.cond;

        const updatedNode$yes = transformBlock(node.yes, visitor, ctx);
        changed1 = changed1 || updatedNode$yes !== node.yes;

        let updatedNode$no = undefined;
        const updatedNode$no$current = node.no;
        if (updatedNode$no$current != null) {
            let updatedNode$no$1$ = updatedNode$no$current;

            switch (updatedNode$no$current.type) {
                case 'Block': {
                    updatedNode$no$1$ = transformBlock(
                        updatedNode$no$current,
                        visitor,
                        ctx,
                    );
                    changed1 =
                        changed1 ||
                        updatedNode$no$1$ !== updatedNode$no$current;
                    break;
                }

                default: {
                    // let changed2 = false;

                    const updatedNode$no$1$$1node = transformIf(
                        updatedNode$no$current,
                        visitor,
                        ctx,
                    );
                    changed1 =
                        changed1 ||
                        updatedNode$no$1$$1node !== updatedNode$no$current;
                    updatedNode$no$1$ = updatedNode$no$1$$1node;
                }
            }
            updatedNode$no = updatedNode$no$1$;
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                cond: updatedNode$cond,
                yes: updatedNode$yes,
                no: updatedNode$no,
                loc: updatedNode$loc,
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

export const transformRef = <Ctx>(
    node: Ref,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Ref => {
    if (!node) {
        throw new Error('No Ref provided');
    }

    const transformed = visitor.Ref ? visitor.Ref(node, ctx) : null;
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

        let updatedNode$kind = node.kind;

        switch (node.kind.type) {
            case 'Unresolved': {
                updatedNode$kind = transformUnresolvedRef(
                    node.kind,
                    visitor,
                    ctx,
                );
                changed1 = changed1 || updatedNode$kind !== node.kind;
                break;
            }

            default: {
                // let changed2 = false;

                const updatedNode$kind$1node = transformRefKind(
                    node.kind,
                    visitor,
                    ctx,
                );
                changed1 = changed1 || updatedNode$kind$1node !== node.kind;
                updatedNode$kind = updatedNode$kind$1node;
            }
        }
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                loc: updatedNode$loc,
                kind: updatedNode$kind,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.RefPost) {
        const transformed = visitor.RefPost(node, ctx);
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

        let updatedNode$payload = undefined;
        const updatedNode$payload$current = node.payload;
        if (updatedNode$payload$current != null) {
            const updatedNode$payload$1$ = transformExpression(
                updatedNode$payload$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$payload$1$ !== updatedNode$payload$current;
            updatedNode$payload = updatedNode$payload$1$;
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                payload: updatedNode$payload,
                loc: updatedNode$loc,
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

    let updatedNode = node;
    {
        let changed1 = false;

        const updatedNode$target = transformExpression(
            node.target,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$target !== node.target;

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformExpression(
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                target: updatedNode$target,
                args: updatedNode$args,
                loc: updatedNode$loc,
            };
            changed0 = true;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        const updatedNode$typ = transformType(node.typ, visitor, ctx);
        changed1 = changed1 || updatedNode$typ !== node.typ;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                pat: updatedNode$pat,
                typ: updatedNode$typ,
                loc: updatedNode$loc,
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

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformLArg(
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                args: updatedNode$args,
                res: updatedNode$res,
                body: updatedNode$body,
                loc: updatedNode$loc,
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

        const updatedNode$value = transformExpression(node.value, visitor, ctx);
        changed1 = changed1 || updatedNode$value !== node.value;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                value: updatedNode$value,
                loc: updatedNode$loc,
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

        let updatedNode$items = node.items;
        {
            let changed2 = false;
            const arr1 = node.items.map((updatedNode$items$item1) => {
                const result = transformRecordKeyValue(
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

        let updatedNode$spreads = node.spreads;
        {
            let changed2 = false;
            const arr1 = node.spreads.map((updatedNode$spreads$item1) => {
                const result = transformExpression(
                    updatedNode$spreads$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$spreads$item1;
                return result;
            });
            if (changed2) {
                updatedNode$spreads = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                items: updatedNode$items,
                spreads: updatedNode$spreads,
                loc: updatedNode$loc,
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

export const transformCase = <Ctx>(
    node: Case,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Case => {
    if (!node) {
        throw new Error('No Case provided');
    }

    const transformed = visitor.Case ? visitor.Case(node, ctx) : null;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                pat: updatedNode$pat,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.CasePost) {
        const transformed = visitor.CasePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformSwitch = <Ctx>(
    node: Switch,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Switch => {
    if (!node) {
        throw new Error('No Switch provided');
    }

    const transformed = visitor.Switch ? visitor.Switch(node, ctx) : null;
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

        const updatedNode$target = transformExpression(
            node.target,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$target !== node.target;

        let updatedNode$cases = node.cases;
        {
            let changed2 = false;
            const arr1 = node.cases.map((updatedNode$cases$item1) => {
                const result = transformCase(
                    updatedNode$cases$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$cases$item1;
                return result;
            });
            if (changed2) {
                updatedNode$cases = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                target: updatedNode$target,
                cases: updatedNode$cases,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.SwitchPost) {
        const transformed = visitor.SwitchPost(node, ctx);
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

        let updatedNode$rest = node.rest;
        {
            let changed2 = false;
            const arr1 = node.rest.map((updatedNode$rest$item1) => {
                let result = updatedNode$rest$item1;
                {
                    let changed3 = false;

                    const result$expr = transformExpression(
                        updatedNode$rest$item1.expr,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$expr !== updatedNode$rest$item1.expr;

                    const result$loc = transformLoc(
                        updatedNode$rest$item1.loc,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$loc !== updatedNode$rest$item1.loc;
                    if (changed3) {
                        result = {
                            ...result,
                            expr: result$expr,
                            loc: result$loc,
                        };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$rest = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                rest: updatedNode$rest,
                loc: updatedNode$loc,
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

export const transformTypeApplication = <Ctx>(
    node: TypeApplication,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TypeApplication => {
    if (!node) {
        throw new Error('No TypeApplication provided');
    }

    const transformed = visitor.TypeApplication
        ? visitor.TypeApplication(node, ctx)
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

        const updatedNode$target = transformExpression(
            node.target,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$target !== node.target;

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformType(
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                target: updatedNode$target,
                args: updatedNode$args,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TypeApplicationPost) {
        const transformed = visitor.TypeApplicationPost(node, ctx);
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

    let updatedNode = node;
    {
        let changed1 = false;

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

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                decorators: updatedNode$decorators,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
            };
            changed0 = true;
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
        case 'If': {
            const transformed = visitor.Expression_If
                ? visitor.Expression_If(node, ctx)
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

        case 'Ref': {
            const transformed = visitor.Expression_Ref
                ? visitor.Expression_Ref(node, ctx)
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
            const transformed = visitor.Expression_Enum
                ? visitor.Expression_Enum(node, ctx)
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
            const transformed = visitor.Expression_Block
                ? visitor.Expression_Block(node, ctx)
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
            const transformed = visitor.Expression_Apply
                ? visitor.Expression_Apply(node, ctx)
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

        case 'Record': {
            const transformed = visitor.Expression_Record
                ? visitor.Expression_Record(node, ctx)
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
            const transformed = visitor.Expression_Number
                ? visitor.Expression_Number(node, ctx)
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

        case 'Switch': {
            const transformed = visitor.Expression_Switch
                ? visitor.Expression_Switch(node, ctx)
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
            const transformed = visitor.Expression_Boolean
                ? visitor.Expression_Boolean(node, ctx)
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
            const transformed = visitor.Expression_TemplateString
                ? visitor.Expression_TemplateString(node, ctx)
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

        case 'TypeApplication': {
            const transformed = visitor.Expression_TypeApplication
                ? visitor.Expression_TypeApplication(node, ctx)
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
            const transformed = visitor.Expression_DecoratedExpression
                ? visitor.Expression_DecoratedExpression(node, ctx)
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

        case 'Ref': {
            updatedNode = transformRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Enum': {
            updatedNode = transformEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Block': {
            updatedNode = transformBlock(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Apply': {
            updatedNode = transformApply(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Lambda': {
            updatedNode = transformLambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Record': {
            updatedNode = transformRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Switch': {
            updatedNode = transformSwitch(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Boolean': {
            updatedNode = transformBoolean(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplateString': {
            updatedNode = transformTemplateString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TypeApplication': {
            updatedNode = transformTypeApplication(node, visitor, ctx);
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
        case 'If': {
            const transformed = visitor.ExpressionPost_If
                ? visitor.ExpressionPost_If(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Ref': {
            const transformed = visitor.ExpressionPost_Ref
                ? visitor.ExpressionPost_Ref(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Enum': {
            const transformed = visitor.ExpressionPost_Enum
                ? visitor.ExpressionPost_Enum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Block': {
            const transformed = visitor.ExpressionPost_Block
                ? visitor.ExpressionPost_Block(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Apply': {
            const transformed = visitor.ExpressionPost_Apply
                ? visitor.ExpressionPost_Apply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Lambda': {
            const transformed = visitor.ExpressionPost_Lambda
                ? visitor.ExpressionPost_Lambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Record': {
            const transformed = visitor.ExpressionPost_Record
                ? visitor.ExpressionPost_Record(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.ExpressionPost_Number
                ? visitor.ExpressionPost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Switch': {
            const transformed = visitor.ExpressionPost_Switch
                ? visitor.ExpressionPost_Switch(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Boolean': {
            const transformed = visitor.ExpressionPost_Boolean
                ? visitor.ExpressionPost_Boolean(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TemplateString': {
            const transformed = visitor.ExpressionPost_TemplateString
                ? visitor.ExpressionPost_TemplateString(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TypeApplication': {
            const transformed = visitor.ExpressionPost_TypeApplication
                ? visitor.ExpressionPost_TypeApplication(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'DecoratedExpression': {
            const transformed = visitor.ExpressionPost_DecoratedExpression
                ? visitor.ExpressionPost_DecoratedExpression(updatedNode, ctx)
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

export const transformToplevelExpression = <Ctx>(
    node: ToplevelExpression,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ToplevelExpression => {
    if (!node) {
        throw new Error('No ToplevelExpression provided');
    }

    const transformed = visitor.ToplevelExpression
        ? visitor.ToplevelExpression(node, ctx)
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

        const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ToplevelExpressionPost) {
        const transformed = visitor.ToplevelExpressionPost(node, ctx);
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

        let updatedNode$elements = node.elements;
        {
            let changed2 = false;
            const arr1 = node.elements.map((updatedNode$elements$item1) => {
                let result = updatedNode$elements$item1;
                {
                    let changed3 = false;

                    const result$type = transformType(
                        updatedNode$elements$item1.type,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$type !== updatedNode$elements$item1.type;
                    if (changed3) {
                        result = { ...result, type: result$type };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$elements = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                elements: updatedNode$elements,
                loc: updatedNode$loc,
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

        let updatedNode$elements = node.elements;
        {
            let changed2 = false;
            const arr1 = node.elements.map((updatedNode$elements$item1) => {
                let result = updatedNode$elements$item1;
                {
                    let changed3 = false;

                    let result$typ = null;
                    const result$typ$current = updatedNode$elements$item1.typ;
                    if (result$typ$current != null) {
                        const result$typ$3$ = transformType(
                            result$typ$current,
                            visitor,
                            ctx,
                        );
                        changed3 =
                            changed3 || result$typ$3$ !== result$typ$current;
                        result$typ = result$typ$3$;
                    }

                    const result$expr = transformExpression(
                        updatedNode$elements$item1.expr,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$expr !== updatedNode$elements$item1.expr;

                    const result$loc = transformLoc(
                        updatedNode$elements$item1.loc,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$loc !== updatedNode$elements$item1.loc;
                    if (changed3) {
                        result = {
                            ...result,
                            typ: result$typ,
                            expr: result$expr,
                            loc: result$loc,
                        };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$elements = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                elements: updatedNode$elements,
                loc: updatedNode$loc,
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

export const transformToplevelAliases = <Ctx>(
    node: ToplevelAliases,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ToplevelAliases => {
    if (!node) {
        throw new Error('No ToplevelAliases provided');
    }

    const transformed = visitor.ToplevelAliases
        ? visitor.ToplevelAliases(node, ctx)
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

        let updatedNode$aliases = node.aliases;
        {
            let changed2 = false;
            const arr1 = node.aliases.map((updatedNode$aliases$item1) => {
                let result = updatedNode$aliases$item1;
                {
                    let changed3 = false;

                    const result$loc = transformLoc(
                        updatedNode$aliases$item1.loc,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$loc !== updatedNode$aliases$item1.loc;
                    if (changed3) {
                        result = { ...result, loc: result$loc };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$aliases = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                aliases: updatedNode$aliases,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ToplevelAliasesPost) {
        const transformed = visitor.ToplevelAliasesPost(node, ctx);
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
        case 'ToplevelExpression': {
            const transformed = visitor.Toplevel_ToplevelExpression
                ? visitor.Toplevel_ToplevelExpression(node, ctx)
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

        case 'ToplevelAliases': {
            const transformed = visitor.Toplevel_ToplevelAliases
                ? visitor.Toplevel_ToplevelAliases(node, ctx)
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
        case 'ToplevelExpression': {
            updatedNode = transformToplevelExpression(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

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

            const updatedNode$0node = transformToplevelAliases(
                node,
                visitor,
                ctx,
            );
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'ToplevelExpression': {
            const transformed = visitor.ToplevelPost_ToplevelExpression
                ? visitor.ToplevelPost_ToplevelExpression(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

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

        case 'ToplevelAliases': {
            const transformed = visitor.ToplevelPost_ToplevelAliases
                ? visitor.ToplevelPost_ToplevelAliases(updatedNode, ctx)
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                toplevels: updatedNode$toplevels,
                loc: updatedNode$loc,
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                toplevels: updatedNode$toplevels,
                loc: updatedNode$loc,
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

export const transformIApply = <Ctx>(
    node: IApply,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IApply => {
    if (!node) {
        throw new Error('No IApply provided');
    }

    const transformed = visitor.IApply ? visitor.IApply(node, ctx) : null;
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

        const updatedNode$target = transformIExpression(
            node.target,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$target !== node.target;

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformIExpression(
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                target: updatedNode$target,
                args: updatedNode$args,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IApplyPost) {
        const transformed = visitor.IApplyPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformITemplateString = <Ctx>(
    node: ITemplateString,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ITemplateString => {
    if (!node) {
        throw new Error('No ITemplateString provided');
    }

    const transformed = visitor.ITemplateString
        ? visitor.ITemplateString(node, ctx)
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

        let updatedNode$rest = node.rest;
        {
            let changed2 = false;
            const arr1 = node.rest.map((updatedNode$rest$item1) => {
                let result = updatedNode$rest$item1;
                {
                    let changed3 = false;

                    const result$expr = transformIExpression(
                        updatedNode$rest$item1.expr,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$expr !== updatedNode$rest$item1.expr;

                    const result$loc = transformLoc(
                        updatedNode$rest$item1.loc,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$loc !== updatedNode$rest$item1.loc;
                    if (changed3) {
                        result = {
                            ...result,
                            expr: result$expr,
                            loc: result$loc,
                        };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$rest = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                rest: updatedNode$rest,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ITemplateStringPost) {
        const transformed = visitor.ITemplateStringPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIEnum = <Ctx>(
    node: IEnum,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IEnum => {
    if (!node) {
        throw new Error('No IEnum provided');
    }

    const transformed = visitor.IEnum ? visitor.IEnum(node, ctx) : null;
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

        let updatedNode$payload = undefined;
        const updatedNode$payload$current = node.payload;
        if (updatedNode$payload$current != null) {
            const updatedNode$payload$1$ = transformIExpression(
                updatedNode$payload$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$payload$1$ !== updatedNode$payload$current;
            updatedNode$payload = updatedNode$payload$1$;
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                payload: updatedNode$payload,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IEnumPost) {
        const transformed = visitor.IEnumPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIRecordKeyValue = <Ctx>(
    node: IRecordKeyValue,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IRecordKeyValue => {
    if (!node) {
        throw new Error('No IRecordKeyValue provided');
    }

    const transformed = visitor.IRecordKeyValue
        ? visitor.IRecordKeyValue(node, ctx)
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

        const updatedNode$value = transformIExpression(
            node.value,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$value !== node.value;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                value: updatedNode$value,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IRecordKeyValuePost) {
        const transformed = visitor.IRecordKeyValuePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIRecord = <Ctx>(
    node: IRecord,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IRecord => {
    if (!node) {
        throw new Error('No IRecord provided');
    }

    const transformed = visitor.IRecord ? visitor.IRecord(node, ctx) : null;
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

        let updatedNode$items = node.items;
        {
            let changed2 = false;
            const arr1 = node.items.map((updatedNode$items$item1) => {
                const result = transformIRecordKeyValue(
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

        let updatedNode$spreads = node.spreads;
        {
            let changed2 = false;
            const arr1 = node.spreads.map((updatedNode$spreads$item1) => {
                const result = transformIExpression(
                    updatedNode$spreads$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$spreads$item1;
                return result;
            });
            if (changed2) {
                updatedNode$spreads = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                items: updatedNode$items,
                spreads: updatedNode$spreads,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IRecordPost) {
        const transformed = visitor.IRecordPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformILet = <Ctx>(
    node: ILet,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ILet => {
    if (!node) {
        throw new Error('No ILet provided');
    }

    const transformed = visitor.ILet ? visitor.ILet(node, ctx) : null;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        let updatedNode$expr = undefined;
        const updatedNode$expr$current = node.expr;
        if (updatedNode$expr$current != null) {
            const updatedNode$expr$1$ = transformIExpression(
                updatedNode$expr$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$expr$1$ !== updatedNode$expr$current;
            updatedNode$expr = updatedNode$expr$1$;
        }

        const updatedNode$typ = transformType(node.typ, visitor, ctx);
        changed1 = changed1 || updatedNode$typ !== node.typ;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                pat: updatedNode$pat,
                expr: updatedNode$expr,
                typ: updatedNode$typ,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ILetPost) {
        const transformed = visitor.ILetPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIAssign = <Ctx>(
    node: IAssign,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IAssign => {
    if (!node) {
        throw new Error('No IAssign provided');
    }

    const transformed = visitor.IAssign ? visitor.IAssign(node, ctx) : null;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        const updatedNode$expr = transformIExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$typ = transformType(node.typ, visitor, ctx);
        changed1 = changed1 || updatedNode$typ !== node.typ;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                pat: updatedNode$pat,
                expr: updatedNode$expr,
                typ: updatedNode$typ,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IAssignPost) {
        const transformed = visitor.IAssignPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIReturn = <Ctx>(
    node: IReturn,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IReturn => {
    if (!node) {
        throw new Error('No IReturn provided');
    }

    const transformed = visitor.IReturn ? visitor.IReturn(node, ctx) : null;
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

        const updatedNode$expr = transformIExpression(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IReturnPost) {
        const transformed = visitor.IReturnPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIIf = <Ctx>(
    node: IIf,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IIf => {
    if (!node) {
        throw new Error('No IIf provided');
    }

    const transformed = visitor.IIf ? visitor.IIf(node, ctx) : null;
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

        const updatedNode$cond = transformIExpression(node.cond, visitor, ctx);
        changed1 = changed1 || updatedNode$cond !== node.cond;

        const updatedNode$yes = transformIBlock(node.yes, visitor, ctx);
        changed1 = changed1 || updatedNode$yes !== node.yes;

        let updatedNode$no = undefined;
        const updatedNode$no$current = node.no;
        if (updatedNode$no$current != null) {
            let updatedNode$no$1$ = updatedNode$no$current;

            switch (updatedNode$no$current.type) {
                case 'Block': {
                    updatedNode$no$1$ = transformIBlock(
                        updatedNode$no$current,
                        visitor,
                        ctx,
                    );
                    changed1 =
                        changed1 ||
                        updatedNode$no$1$ !== updatedNode$no$current;
                    break;
                }

                default: {
                    // let changed2 = false;

                    const updatedNode$no$1$$1node = transformIIf(
                        updatedNode$no$current,
                        visitor,
                        ctx,
                    );
                    changed1 =
                        changed1 ||
                        updatedNode$no$1$$1node !== updatedNode$no$current;
                    updatedNode$no$1$ = updatedNode$no$1$$1node;
                }
            }
            updatedNode$no = updatedNode$no$1$;
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                cond: updatedNode$cond,
                yes: updatedNode$yes,
                no: updatedNode$no,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IIfPost) {
        const transformed = visitor.IIfPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformICase = <Ctx>(
    node: ICase,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ICase => {
    if (!node) {
        throw new Error('No ICase provided');
    }

    const transformed = visitor.ICase ? visitor.ICase(node, ctx) : null;
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

        const updatedNode$pat = transformPattern(node.pat, visitor, ctx);
        changed1 = changed1 || updatedNode$pat !== node.pat;

        const updatedNode$expr = transformIBlock(node.expr, visitor, ctx);
        changed1 = changed1 || updatedNode$expr !== node.expr;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                pat: updatedNode$pat,
                expr: updatedNode$expr,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ICasePost) {
        const transformed = visitor.ICasePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformISwitch = <Ctx>(
    node: ISwitch,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ISwitch => {
    if (!node) {
        throw new Error('No ISwitch provided');
    }

    const transformed = visitor.ISwitch ? visitor.ISwitch(node, ctx) : null;
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

        const updatedNode$target = transformIExpression(
            node.target,
            visitor,
            ctx,
        );
        changed1 = changed1 || updatedNode$target !== node.target;

        let updatedNode$cases = node.cases;
        {
            let changed2 = false;
            const arr1 = node.cases.map((updatedNode$cases$item1) => {
                const result = transformICase(
                    updatedNode$cases$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$cases$item1;
                return result;
            });
            if (changed2) {
                updatedNode$cases = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                target: updatedNode$target,
                cases: updatedNode$cases,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ISwitchPost) {
        const transformed = visitor.ISwitchPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIStmt = <Ctx>(
    node: IStmt,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IStmt => {
    if (!node) {
        throw new Error('No IStmt provided');
    }

    const transformed = visitor.IStmt ? visitor.IStmt(node, ctx) : null;
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
            const transformed = visitor.IStmt_Let
                ? visitor.IStmt_Let(node, ctx)
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

        case 'Assign': {
            const transformed = visitor.IStmt_Assign
                ? visitor.IStmt_Assign(node, ctx)
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
            const transformed = visitor.IStmt_Block
                ? visitor.IStmt_Block(node, ctx)
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

        case 'Return': {
            const transformed = visitor.IStmt_Return
                ? visitor.IStmt_Return(node, ctx)
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
            const transformed = visitor.IStmt_If
                ? visitor.IStmt_If(node, ctx)
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

        case 'Switch': {
            const transformed = visitor.IStmt_Switch
                ? visitor.IStmt_Switch(node, ctx)
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
            updatedNode = transformILet(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Assign': {
            updatedNode = transformIAssign(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Ref': {
            updatedNode = transformRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Lambda': {
            updatedNode = transformILambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Boolean': {
            updatedNode = transformBoolean(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Apply': {
            updatedNode = transformIApply(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplateString': {
            updatedNode = transformITemplateString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Enum': {
            updatedNode = transformIEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Record': {
            updatedNode = transformIRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Block': {
            updatedNode = transformIBlock(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Return': {
            updatedNode = transformIReturn(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'If': {
            updatedNode = transformIIf(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformISwitch(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'Let': {
            const transformed = visitor.IStmtPost_Let
                ? visitor.IStmtPost_Let(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Assign': {
            const transformed = visitor.IStmtPost_Assign
                ? visitor.IStmtPost_Assign(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Block': {
            const transformed = visitor.IStmtPost_Block
                ? visitor.IStmtPost_Block(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Return': {
            const transformed = visitor.IStmtPost_Return
                ? visitor.IStmtPost_Return(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'If': {
            const transformed = visitor.IStmtPost_If
                ? visitor.IStmtPost_If(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Switch': {
            const transformed = visitor.IStmtPost_Switch
                ? visitor.IStmtPost_Switch(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.IStmtPost) {
        const transformed = visitor.IStmtPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIBlock = <Ctx>(
    node: IBlock,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IBlock => {
    if (!node) {
        throw new Error('No IBlock provided');
    }

    const transformed = visitor.IBlock ? visitor.IBlock(node, ctx) : null;
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

        let updatedNode$stmts = node.stmts;
        {
            let changed2 = false;
            const arr1 = node.stmts.map((updatedNode$stmts$item1) => {
                const result = transformIStmt(
                    updatedNode$stmts$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$stmts$item1;
                return result;
            });
            if (changed2) {
                updatedNode$stmts = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                stmts: updatedNode$stmts,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.IBlockPost) {
        const transformed = visitor.IBlockPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformILambda = <Ctx>(
    node: ILambda,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): ILambda => {
    if (!node) {
        throw new Error('No ILambda provided');
    }

    const transformed = visitor.ILambda ? visitor.ILambda(node, ctx) : null;
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

        let updatedNode$args = node.args;
        {
            let changed2 = false;
            const arr1 = node.args.map((updatedNode$args$item1) => {
                const result = transformLArg(
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

        let updatedNode$body = node.body;

        switch (node.body.type) {
            case 'Ref': {
                updatedNode$body = transformRef(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'Number': {
                updatedNode$body = transformNumber(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'Lambda': {
                updatedNode$body = transformILambda(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'Boolean': {
                updatedNode$body = transformBoolean(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'Apply': {
                updatedNode$body = transformIApply(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'TemplateString': {
                updatedNode$body = transformITemplateString(
                    node.body,
                    visitor,
                    ctx,
                );
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'Enum': {
                updatedNode$body = transformIEnum(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            case 'Record': {
                updatedNode$body = transformIRecord(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                break;
            }

            default: {
                // let changed2 = false;

                const updatedNode$body$1node = transformIBlock(
                    node.body,
                    visitor,
                    ctx,
                );
                changed1 = changed1 || updatedNode$body$1node !== node.body;
                updatedNode$body = updatedNode$body$1node;
            }
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

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                args: updatedNode$args,
                body: updatedNode$body,
                res: updatedNode$res,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.ILambdaPost) {
        const transformed = visitor.ILambdaPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIExpression = <Ctx>(
    node: IExpression,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): IExpression => {
    if (!node) {
        throw new Error('No IExpression provided');
    }

    const transformed = visitor.IExpression
        ? visitor.IExpression(node, ctx)
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
        case 'Ref': {
            const transformed = visitor.IExpression_Ref
                ? visitor.IExpression_Ref(node, ctx)
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
            const transformed = visitor.IExpression_Number
                ? visitor.IExpression_Number(node, ctx)
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
            const transformed = visitor.IExpression_Lambda
                ? visitor.IExpression_Lambda(node, ctx)
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
            const transformed = visitor.IExpression_Boolean
                ? visitor.IExpression_Boolean(node, ctx)
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
            const transformed = visitor.IExpression_Apply
                ? visitor.IExpression_Apply(node, ctx)
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
            const transformed = visitor.IExpression_TemplateString
                ? visitor.IExpression_TemplateString(node, ctx)
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
            const transformed = visitor.IExpression_Enum
                ? visitor.IExpression_Enum(node, ctx)
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
            const transformed = visitor.IExpression_Record
                ? visitor.IExpression_Record(node, ctx)
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
        case 'Ref': {
            updatedNode = transformRef(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Lambda': {
            updatedNode = transformILambda(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Boolean': {
            updatedNode = transformBoolean(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Apply': {
            updatedNode = transformIApply(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'TemplateString': {
            updatedNode = transformITemplateString(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'Enum': {
            updatedNode = transformIEnum(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformIRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'Ref': {
            const transformed = visitor.IExpressionPost_Ref
                ? visitor.IExpressionPost_Ref(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Number': {
            const transformed = visitor.IExpressionPost_Number
                ? visitor.IExpressionPost_Number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Lambda': {
            const transformed = visitor.IExpressionPost_Lambda
                ? visitor.IExpressionPost_Lambda(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Boolean': {
            const transformed = visitor.IExpressionPost_Boolean
                ? visitor.IExpressionPost_Boolean(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Apply': {
            const transformed = visitor.IExpressionPost_Apply
                ? visitor.IExpressionPost_Apply(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'TemplateString': {
            const transformed = visitor.IExpressionPost_TemplateString
                ? visitor.IExpressionPost_TemplateString(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Enum': {
            const transformed = visitor.IExpressionPost_Enum
                ? visitor.IExpressionPost_Enum(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }

        case 'Record': {
            const transformed = visitor.IExpressionPost_Record
                ? visitor.IExpressionPost_Record(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.IExpressionPost) {
        const transformed = visitor.IExpressionPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformDecoratorDecl = <Ctx>(
    node: DecoratorDecl,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): DecoratorDecl => {
    if (!node) {
        throw new Error('No DecoratorDecl provided');
    }

    const transformed = visitor.DecoratorDecl
        ? visitor.DecoratorDecl(node, ctx)
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
    if (visitor.DecoratorDeclPost) {
        const transformed = visitor.DecoratorDeclPost(node, ctx);
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

        let updatedNode$items = node.items;
        {
            let changed2 = false;
            const arr1 = node.items.map((updatedNode$items$item1) => {
                let result = updatedNode$items$item1;
                {
                    let changed3 = false;

                    const result$sym = transformSym(
                        updatedNode$items$item1.sym,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 || result$sym !== updatedNode$items$item1.sym;

                    const result$bound = transformType(
                        updatedNode$items$item1.bound,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$bound !== updatedNode$items$item1.bound;
                    if (changed3) {
                        result = {
                            ...result,
                            sym: result$sym,
                            bound: result$bound,
                        };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$items = arr1;
                changed1 = true;
            }
        }

        const updatedNode$body = transformExpression(node.body, visitor, ctx);
        changed1 = changed1 || updatedNode$body !== node.body;

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                items: updatedNode$items,
                body: updatedNode$body,
                loc: updatedNode$loc,
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

export const transformTAdd = <Ctx>(
    node: TAdd,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TAdd => {
    if (!node) {
        throw new Error('No TAdd provided');
    }

    const transformed = visitor.TAdd ? visitor.TAdd(node, ctx) : null;
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

        let updatedNode$elements = node.elements;
        {
            let changed2 = false;
            const arr1 = node.elements.map((updatedNode$elements$item1) => {
                const result = transformType(
                    updatedNode$elements$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$elements$item1;
                return result;
            });
            if (changed2) {
                updatedNode$elements = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                elements: updatedNode$elements,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TAddPost) {
        const transformed = visitor.TAddPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformTSub = <Ctx>(
    node: TSub,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TSub => {
    if (!node) {
        throw new Error('No TSub provided');
    }

    const transformed = visitor.TSub ? visitor.TSub(node, ctx) : null;
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

        let updatedNode$elements = node.elements;
        {
            let changed2 = false;
            const arr1 = node.elements.map((updatedNode$elements$item1) => {
                const result = transformType(
                    updatedNode$elements$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$elements$item1;
                return result;
            });
            if (changed2) {
                updatedNode$elements = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                elements: updatedNode$elements,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TSubPost) {
        const transformed = visitor.TSubPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformTOr = <Ctx>(
    node: TOr,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TOr => {
    if (!node) {
        throw new Error('No TOr provided');
    }

    const transformed = visitor.TOr ? visitor.TOr(node, ctx) : null;
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

        let updatedNode$elements = node.elements;
        {
            let changed2 = false;
            const arr1 = node.elements.map((updatedNode$elements$item1) => {
                const result = transformType(
                    updatedNode$elements$item1,
                    visitor,
                    ctx,
                );
                changed2 = changed2 || result !== updatedNode$elements$item1;
                return result;
            });
            if (changed2) {
                updatedNode$elements = arr1;
                changed1 = true;
            }
        }

        const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
        changed1 = changed1 || updatedNode$loc !== node.loc;
        if (changed1) {
            updatedNode = {
                ...updatedNode,
                elements: updatedNode$elements,
                loc: updatedNode$loc,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TOrPost) {
        const transformed = visitor.TOrPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};
