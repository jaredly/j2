import {
  Loc,
  File,
  Toplevel,
  Expression,
  DecoratedExpression,
  DecoratedExpression_inner,
  Decorator,
  DecoratorId,
  DecoratorArgs,
  LabeledDecoratorArg,
  DecoratorArg,
  DecType,
  Type,
  TRef,
  Number,
  String,
  TLambda,
  TArgs,
  TArg,
  TVars,
  TBargs,
  TBArg,
  DecExpr,
  Apply,
  Apply_inner,
  Atom,
  Boolean,
  Identifier,
  ParenedExpression,
  TemplateString,
  TemplatePair,
  TemplateWrap,
  Suffix,
  Parens,
  CommaExpr,
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
  AllTaggedTypes,
} from "./grammar/base.parser";

export type Visitor<Ctx> = {
  Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx];
  LocPost?: (node: Loc, ctx: Ctx) => null | Loc;
  File?: (node: File, ctx: Ctx) => null | false | File | [File | null, Ctx];
  FilePost?: (node: File, ctx: Ctx) => null | File;
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
  Expression?: (
    node: Expression,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  ExpressionPost?: (node: Expression, ctx: Ctx) => null | Expression;
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
  Identifier?: (
    node: Identifier,
    ctx: Ctx
  ) => null | false | Identifier | [Identifier | null, Ctx];
  IdentifierPost?: (node: Identifier, ctx: Ctx) => null | Identifier;
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
  Parens?: (
    node: Parens,
    ctx: Ctx
  ) => null | false | Parens | [Parens | null, Ctx];
  ParensPost?: (node: Parens, ctx: Ctx) => null | Parens;
  CommaExpr?: (
    node: CommaExpr,
    ctx: Ctx
  ) => null | false | CommaExpr | [CommaExpr | null, Ctx];
  CommaExprPost?: (node: CommaExpr, ctx: Ctx) => null | CommaExpr;
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
  Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx];
  TypePost?: (node: Type, ctx: Ctx) => null | Type;
  TRef?: (node: TRef, ctx: Ctx) => null | false | TRef | [TRef | null, Ctx];
  TRefPost?: (node: TRef, ctx: Ctx) => null | TRef;
  TVars?: (node: TVars, ctx: Ctx) => null | false | TVars | [TVars | null, Ctx];
  TVarsPost?: (node: TVars, ctx: Ctx) => null | TVars;
  TBargs?: (
    node: TBargs,
    ctx: Ctx
  ) => null | false | TBargs | [TBargs | null, Ctx];
  TBargsPost?: (node: TBargs, ctx: Ctx) => null | TBargs;
  TBArg?: (node: TBArg, ctx: Ctx) => null | false | TBArg | [TBArg | null, Ctx];
  TBArgPost?: (node: TBArg, ctx: Ctx) => null | TBArg;
  TArg?: (node: TArg, ctx: Ctx) => null | false | TArg | [TArg | null, Ctx];
  TArgPost?: (node: TArg, ctx: Ctx) => null | TArg;
  TArgs?: (node: TArgs, ctx: Ctx) => null | false | TArgs | [TArgs | null, Ctx];
  TArgsPost?: (node: TArgs, ctx: Ctx) => null | TArgs;
  TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | TLambda | [TLambda | null, Ctx];
  TLambdaPost?: (node: TLambda, ctx: Ctx) => null | TLambda;
  AllTaggedTypes?: (
    node: AllTaggedTypes,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypesPost?: (
    node: AllTaggedTypes,
    ctx: Ctx
  ) => null | AllTaggedTypes;
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
  Apply_Apply?: (
    node: Apply,
    ctx: Ctx
  ) => null | false | Apply | [Apply | null, Ctx];
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
  Type_TRef?: (
    node: TRef,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_Number?: (
    node: Number,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_String?: (
    node: String,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TVars?: (
    node: TVars,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  AllTaggedTypes_File?: (
    node: File,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_ParenedExpression?: (
    node: ParenedExpression,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Identifier?: (
    node: Identifier,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Apply?: (
    node: Apply,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_Parens?: (
    node: Parens,
    ctx: Ctx
  ) => null | false | AllTaggedTypes | [AllTaggedTypes | null, Ctx];
  AllTaggedTypes_CommaExpr?: (
    node: CommaExpr,
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
  AllTaggedTypes_TRef?: (
    node: TRef,
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

    if (changed1) {
      updatedNode = {
        ...updatedNode,
        loc: updatedNode$loc,
        bound: updatedNode$bound,
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

  switch (node.type) {
    case "TRef": {
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

    case "Number": {
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

    case "String": {
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

    case "TLambda": {
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

    case "TVars": {
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

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTVars(node, visitor, ctx);
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
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

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTemplateString(node, visitor, ctx);
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

export const transformParens = <Ctx>(
  node: Parens,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Parens => {
  if (!node) {
    throw new Error("No Parens provided");
  }

  const transformed = visitor.Parens ? visitor.Parens(node, ctx) : null;
  if (transformed === false) {
    return node;
  }
  if (transformed != null) {
    if (Array.isArray(transformed)) {
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
  if (visitor.ParensPost) {
    const transformed = visitor.ParensPost(node, ctx);
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

  const updatedNode = transformParens(node, visitor, ctx);
  changed0 = changed0 || updatedNode !== node;

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

  const updatedNode = transformExpression(node, visitor, ctx);
  changed0 = changed0 || updatedNode !== node;

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

    case "Parens": {
      const transformed = visitor.AllTaggedTypes_Parens
        ? visitor.AllTaggedTypes_Parens(node, ctx)
        : null;
      if (transformed != null) {
        if (Array.isArray(transformed)) {
          ctx = transformed[1];
          if (transformed[0] != null) {
            node = transformed[0];
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
  }

  let updatedNode = node;

  switch (node.type) {
    case "File": {
      updatedNode = transformFile(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "ParenedExpression": {
      updatedNode = transformParenedExpression(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Identifier": {
      updatedNode = transformIdentifier(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Apply": {
      updatedNode = transformApply_inner(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Parens": {
      updatedNode = transformParens(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "CommaExpr": {
      updatedNode = transformCommaExpr(node, visitor, ctx);
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

    case "TRef": {
      updatedNode = transformTRef(node, visitor, ctx);
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

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTLambda(node, visitor, ctx);
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
