import {
  GlobalRef,
  Id,
  RefKind,
  Loc,
  File,
  Toplevel,
  ToplevelExpression,
  Expression,
  Ref,
  UnresolvedRef,
  Apply,
  Enum,
  Number,
  Boolean,
  TemplateString,
  TypeApplication,
  Type,
  TRef,
  TLambda,
  TEnum,
  EnumCase,
  String,
  TVars,
  TVar,
  Sym,
  TDecorated,
  Decorator,
  DecoratorArg,
  DExpr,
  DType,
  TApply,
  TOps,
  DecoratedExpression,
  TypeAlias,
  TypeFile,
  DecoratorDecl,
  TypeVariables,
  TAdd,
  TSub,
  TOr,
} from "./typed-ast";

export type Visitor<Ctx> = {
  GlobalRef?: (
    node: GlobalRef,
    ctx: Ctx
  ) => null | false | GlobalRef | [GlobalRef | null, Ctx];
  GlobalRefPost?: (node: GlobalRef, ctx: Ctx) => null | GlobalRef;
  RefKind?: (
    node: RefKind,
    ctx: Ctx
  ) => null | false | RefKind | [RefKind | null, Ctx];
  RefKindPost?: (node: RefKind, ctx: Ctx) => null | RefKind;
  Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx];
  LocPost?: (node: Loc, ctx: Ctx) => null | Loc;
  File?: (node: File, ctx: Ctx) => null | false | File | [File | null, Ctx];
  FilePost?: (node: File, ctx: Ctx) => null | File;
  TypeFile?: (
    node: TypeFile,
    ctx: Ctx
  ) => null | false | TypeFile | [TypeFile | null, Ctx];
  TypeFilePost?: (node: TypeFile, ctx: Ctx) => null | TypeFile;
  UnresolvedRef?: (
    node: UnresolvedRef,
    ctx: Ctx
  ) => null | false | UnresolvedRef | [UnresolvedRef | null, Ctx];
  UnresolvedRefPost?: (node: UnresolvedRef, ctx: Ctx) => null | UnresolvedRef;
  Ref?: (node: Ref, ctx: Ctx) => null | false | Ref | [Ref | null, Ctx];
  RefPost?: (node: Ref, ctx: Ctx) => null | Ref;
  ToplevelExpression?: (
    node: ToplevelExpression,
    ctx: Ctx
  ) => null | false | ToplevelExpression | [ToplevelExpression | null, Ctx];
  ToplevelExpressionPost?: (
    node: ToplevelExpression,
    ctx: Ctx
  ) => null | ToplevelExpression;
  Toplevel?: (
    node: Toplevel,
    ctx: Ctx
  ) => null | false | Toplevel | [Toplevel | null, Ctx];
  ToplevelPost?: (node: Toplevel, ctx: Ctx) => null | Toplevel;
  TypeAlias?: (
    node: TypeAlias,
    ctx: Ctx
  ) => null | false | TypeAlias | [TypeAlias | null, Ctx];
  TypeAliasPost?: (node: TypeAlias, ctx: Ctx) => null | TypeAlias;
  Expression?: (
    node: Expression,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  ExpressionPost?: (node: Expression, ctx: Ctx) => null | Expression;
  Sym?: (node: Sym, ctx: Ctx) => null | false | Sym | [Sym | null, Ctx];
  SymPost?: (node: Sym, ctx: Ctx) => null | Sym;
  Apply?: (node: Apply, ctx: Ctx) => null | false | Apply | [Apply | null, Ctx];
  ApplyPost?: (node: Apply, ctx: Ctx) => null | Apply;
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
  TemplateString?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | false | TemplateString | [TemplateString | null, Ctx];
  TemplateStringPost?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | TemplateString;
  String?: (
    node: String,
    ctx: Ctx
  ) => null | false | String | [String | null, Ctx];
  StringPost?: (node: String, ctx: Ctx) => null | String;
  DecoratorDecl?: (
    node: DecoratorDecl,
    ctx: Ctx
  ) => null | false | DecoratorDecl | [DecoratorDecl | null, Ctx];
  DecoratorDeclPost?: (node: DecoratorDecl, ctx: Ctx) => null | DecoratorDecl;
  Decorator?: (
    node: Decorator,
    ctx: Ctx
  ) => null | false | Decorator | [Decorator | null, Ctx];
  DecoratorPost?: (node: Decorator, ctx: Ctx) => null | Decorator;
  DType?: (node: DType, ctx: Ctx) => null | false | DType | [DType | null, Ctx];
  DTypePost?: (node: DType, ctx: Ctx) => null | DType;
  DExpr?: (node: DExpr, ctx: Ctx) => null | false | DExpr | [DExpr | null, Ctx];
  DExprPost?: (node: DExpr, ctx: Ctx) => null | DExpr;
  DecoratorArg?: (
    node: DecoratorArg,
    ctx: Ctx
  ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
  DecoratorArgPost?: (node: DecoratorArg, ctx: Ctx) => null | DecoratorArg;
  DecoratedExpression?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx];
  DecoratedExpressionPost?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | DecoratedExpression;
  Enum?: (node: Enum, ctx: Ctx) => null | false | Enum | [Enum | null, Ctx];
  EnumPost?: (node: Enum, ctx: Ctx) => null | Enum;
  TypeApplication?: (
    node: TypeApplication,
    ctx: Ctx
  ) => null | false | TypeApplication | [TypeApplication | null, Ctx];
  TypeApplicationPost?: (
    node: TypeApplication,
    ctx: Ctx
  ) => null | TypeApplication;
  TypeVariables?: (
    node: TypeVariables,
    ctx: Ctx
  ) => null | false | TypeVariables | [TypeVariables | null, Ctx];
  TypeVariablesPost?: (node: TypeVariables, ctx: Ctx) => null | TypeVariables;
  TOps?: (node: TOps, ctx: Ctx) => null | false | TOps | [TOps | null, Ctx];
  TOpsPost?: (node: TOps, ctx: Ctx) => null | TOps;
  TRef?: (node: TRef, ctx: Ctx) => null | false | TRef | [TRef | null, Ctx];
  TRefPost?: (node: TRef, ctx: Ctx) => null | TRef;
  TDecorated?: (
    node: TDecorated,
    ctx: Ctx
  ) => null | false | TDecorated | [TDecorated | null, Ctx];
  TDecoratedPost?: (node: TDecorated, ctx: Ctx) => null | TDecorated;
  TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | TLambda | [TLambda | null, Ctx];
  TLambdaPost?: (node: TLambda, ctx: Ctx) => null | TLambda;
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
  TApply?: (
    node: TApply,
    ctx: Ctx
  ) => null | false | TApply | [TApply | null, Ctx];
  TApplyPost?: (node: TApply, ctx: Ctx) => null | TApply;
  TVar?: (node: TVar, ctx: Ctx) => null | false | TVar | [TVar | null, Ctx];
  TVarPost?: (node: TVar, ctx: Ctx) => null | TVar;
  TVars?: (node: TVars, ctx: Ctx) => null | false | TVars | [TVars | null, Ctx];
  TVarsPost?: (node: TVars, ctx: Ctx) => null | TVars;
  TEnum?: (node: TEnum, ctx: Ctx) => null | false | TEnum | [TEnum | null, Ctx];
  TEnumPost?: (node: TEnum, ctx: Ctx) => null | TEnum;
  EnumCase?: (
    node: EnumCase,
    ctx: Ctx
  ) => null | false | EnumCase | [EnumCase | null, Ctx];
  EnumCasePost?: (node: EnumCase, ctx: Ctx) => null | EnumCase;
  Toplevel_ToplevelExpression?: (
    node: ToplevelExpression,
    ctx: Ctx
  ) => null | false | Toplevel | [Toplevel | null, Ctx];
  Toplevel_TypeAlias?: (
    node: TypeAlias,
    ctx: Ctx
  ) => null | false | Toplevel | [Toplevel | null, Ctx];
  Expression_Ref?: (
    node: Ref,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_Apply?: (
    node: Apply,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_Enum?: (
    node: Enum,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_Number?: (
    node: Number,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_Boolean?: (
    node: Boolean,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_TemplateString?: (
    node: TemplateString,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_TypeApplication?: (
    node: TypeApplication,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  Expression_DecoratedExpression?: (
    node: DecoratedExpression,
    ctx: Ctx
  ) => null | false | Expression | [Expression | null, Ctx];
  DecoratorArg_DExpr?: (
    node: DExpr,
    ctx: Ctx
  ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
  DecoratorArg_DType?: (
    node: DType,
    ctx: Ctx
  ) => null | false | DecoratorArg | [DecoratorArg | null, Ctx];
  Type_TRef?: (
    node: TRef,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TLambda?: (
    node: TLambda,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TEnum?: (
    node: TEnum,
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
  Type_TVars?: (
    node: TVars,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TDecorated?: (
    node: TDecorated,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TApply?: (
    node: TApply,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
  Type_TOps?: (
    node: TOps,
    ctx: Ctx
  ) => null | false | Type | [Type | null, Ctx];
};
export const transformId = <Ctx>(
  node: Id,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Id => {
  if (!node) {
    throw new Error("No Id provided");
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
  ctx: Ctx
): GlobalRef => {
  if (!node) {
    throw new Error("No GlobalRef provided");
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
  ctx: Ctx
): RefKind => {
  if (!node) {
    throw new Error("No RefKind provided");
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

  let updatedNode = node;

  switch (node.type) {
    case "Global": {
      updatedNode = transformGlobalRef(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Local":
      break;

    case "Recur":
      break;
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

export const transformUnresolvedRef = <Ctx>(
  node: UnresolvedRef,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): UnresolvedRef => {
  if (!node) {
    throw new Error("No UnresolvedRef provided");
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

export const transformRef = <Ctx>(
  node: Ref,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Ref => {
  if (!node) {
    throw new Error("No Ref provided");
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
      case "Unresolved": {
        updatedNode$kind = transformUnresolvedRef(node.kind, visitor, ctx);
        changed1 = changed1 || updatedNode$kind !== node.kind;
        break;
      }

      default: {
        // let changed2 = false;

        const updatedNode$kind$1node = transformRefKind(
          node.kind,
          visitor,
          ctx
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

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$target = transformExpression(node.target, visitor, ctx);
    changed1 = changed1 || updatedNode$target !== node.target;

    let updatedNode$args = node.args;
    {
      let changed2 = false;
      const arr1 = node.args.map((updatedNode$args$item1) => {
        const result = transformExpression(
          updatedNode$args$item1,
          visitor,
          ctx
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

    let updatedNode$payload = undefined;
    const updatedNode$payload$current = node.payload;
    if (updatedNode$payload$current != null) {
      const updatedNode$payload$1$ = transformExpression(
        updatedNode$payload$current,
        visitor,
        ctx
      );
      changed1 =
        changed1 || updatedNode$payload$1$ !== updatedNode$payload$current;
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
            ctx
          );
          changed3 = changed3 || result$expr !== updatedNode$rest$item1.expr;

          const result$loc = transformLoc(
            updatedNode$rest$item1.loc,
            visitor,
            ctx
          );
          changed3 = changed3 || result$loc !== updatedNode$rest$item1.loc;
          if (changed3) {
            result = { ...result, expr: result$expr, loc: result$loc };
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

    let updatedNode$ref = node.ref;

    switch (node.ref.type) {
      case "Global": {
        updatedNode$ref = transformGlobalRef(node.ref, visitor, ctx);
        changed1 = changed1 || updatedNode$ref !== node.ref;
        break;
      }

      case "Local":
        break;

      case "Recur":
        break;

      default: {
        // let changed2 = false;

        const updatedNode$ref$1node = transformUnresolvedRef(
          node.ref,
          visitor,
          ctx
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
            ctx
          );
          changed3 = changed3 || result$typ !== updatedNode$args$item1.typ;

          const result$loc = transformLoc(
            updatedNode$args$item1.loc,
            visitor,
            ctx
          );
          changed3 = changed3 || result$loc !== updatedNode$args$item1.loc;
          if (changed3) {
            result = { ...result, typ: result$typ, loc: result$loc };
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

  let updatedNode = node;
  {
    let changed1 = false;

    let updatedNode$payload = undefined;
    const updatedNode$payload$current = node.payload;
    if (updatedNode$payload$current != null) {
      const updatedNode$payload$1$ = transformType(
        updatedNode$payload$current,
        visitor,
        ctx
      );
      changed1 =
        changed1 || updatedNode$payload$1$ !== updatedNode$payload$current;
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

    let updatedNode$cases = node.cases;
    {
      let changed2 = false;
      const arr1 = node.cases.map((updatedNode$cases$item1) => {
        let result = updatedNode$cases$item1;

        switch (updatedNode$cases$item1.type) {
          case "EnumCase": {
            result = transformEnumCase(updatedNode$cases$item1, visitor, ctx);
            changed2 = changed2 || result !== updatedNode$cases$item1;
            break;
          }

          default: {
            // let changed3 = false;

            const result$2node = transformType(
              updatedNode$cases$item1,
              visitor,
              ctx
            );
            changed2 = changed2 || result$2node !== updatedNode$cases$item1;
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

export const transformSym = <Ctx>(
  node: Sym,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): Sym => {
  if (!node) {
    throw new Error("No Sym provided");
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

export const transformTVar = <Ctx>(
  node: TVar,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TVar => {
  if (!node) {
    throw new Error("No TVar provided");
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
        ctx
      );
      changed1 = changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
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
        ctx
      );
      changed1 =
        changed1 || updatedNode$default_$1$ !== updatedNode$default_$current;
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

    let updatedNode$args = node.args;
    {
      let changed2 = false;
      const arr1 = node.args.map((updatedNode$args$item1) => {
        const result = transformTVar(updatedNode$args$item1, visitor, ctx);
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

export const transformDExpr = <Ctx>(
  node: DExpr,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DExpr => {
  if (!node) {
    throw new Error("No DExpr provided");
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

export const transformDType = <Ctx>(
  node: DType,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DType => {
  if (!node) {
    throw new Error("No DType provided");
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
    case "DExpr": {
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

    case "DType": {
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
    case "DExpr": {
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

    let updatedNode$id = node.id;
    {
      let changed2 = false;

      let updatedNode$id$ref = node.id.ref;

      switch (node.id.ref.type) {
        case "Global": {
          updatedNode$id$ref = transformGlobalRef(node.id.ref, visitor, ctx);
          changed2 = changed2 || updatedNode$id$ref !== node.id.ref;
          break;
        }

        case "Local":
          break;

        case "Recur":
          break;

        default: {
          // let changed3 = false;

          const updatedNode$id$ref$2node = transformUnresolvedRef(
            node.id.ref,
            visitor,
            ctx
          );
          changed2 = changed2 || updatedNode$id$ref$2node !== node.id.ref;
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
            ctx
          );
          changed3 = changed3 || result$arg !== updatedNode$args$item1.arg;

          const result$loc = transformLoc(
            updatedNode$args$item1.loc,
            visitor,
            ctx
          );
          changed3 = changed3 || result$loc !== updatedNode$args$item1.loc;
          if (changed3) {
            result = { ...result, arg: result$arg, loc: result$loc };
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

    const updatedNode$inner = transformType(node.inner, visitor, ctx);
    changed1 = changed1 || updatedNode$inner !== node.inner;

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

  let updatedNode = node;
  {
    let changed1 = false;

    const updatedNode$target = transformType(node.target, visitor, ctx);
    changed1 = changed1 || updatedNode$target !== node.target;

    let updatedNode$args = node.args;
    {
      let changed2 = false;
      const arr1 = node.args.map((updatedNode$args$item1) => {
        const result = transformType(updatedNode$args$item1, visitor, ctx);
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
            ctx
          );
          changed3 = changed3 || result$right !== updatedNode$right$item1.right;
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

    case "TEnum": {
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

    case "TDecorated": {
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

    case "TApply": {
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

    case "TOps": {
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
    case "TRef": {
      updatedNode = transformTRef(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TLambda": {
      updatedNode = transformTLambda(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TEnum": {
      updatedNode = transformTEnum(node, visitor, ctx);
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

    case "TVars": {
      updatedNode = transformTVars(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TDecorated": {
      updatedNode = transformTDecorated(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TApply": {
      updatedNode = transformTApply(node, visitor, ctx);
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

  node = updatedNode;
  if (visitor.TypePost) {
    const transformed = visitor.TypePost(node, ctx);
    if (transformed != null) {
      node = transformed;
    }
  }
  return node;
};

export const transformTypeApplication = <Ctx>(
  node: TypeApplication,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): TypeApplication => {
  if (!node) {
    throw new Error("No TypeApplication provided");
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

    const updatedNode$target = transformExpression(node.target, visitor, ctx);
    changed1 = changed1 || updatedNode$target !== node.target;

    let updatedNode$args = node.args;
    {
      let changed2 = false;
      const arr1 = node.args.map((updatedNode$args$item1) => {
        const result = transformType(updatedNode$args$item1, visitor, ctx);
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

  switch (node.type) {
    case "Ref": {
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

    case "Apply": {
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

    case "Enum": {
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

    case "Number": {
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

    case "Boolean": {
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

    case "TemplateString": {
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

    case "TypeApplication": {
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

    case "DecoratedExpression": {
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
    case "Ref": {
      updatedNode = transformRef(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Apply": {
      updatedNode = transformApply(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "Enum": {
      updatedNode = transformEnum(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

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

    case "TemplateString": {
      updatedNode = transformTemplateString(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    case "TypeApplication": {
      updatedNode = transformTypeApplication(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformDecoratedExpression(
        node,
        visitor,
        ctx
      );
      changed0 = changed0 || updatedNode$0node !== node;
      updatedNode = updatedNode$0node;
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
  ctx: Ctx
): ToplevelExpression => {
  if (!node) {
    throw new Error("No ToplevelExpression provided");
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
            ctx
          );
          changed3 =
            changed3 || result$type !== updatedNode$elements$item1.type;
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
    case "ToplevelExpression": {
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
    case "ToplevelExpression": {
      updatedNode = transformToplevelExpression(node, visitor, ctx);
      changed0 = changed0 || updatedNode !== node;
      break;
    }

    default: {
      // let changed1 = false;

      const updatedNode$0node = transformTypeAlias(node, visitor, ctx);
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

    let updatedNode$toplevels = node.toplevels;
    {
      let changed2 = false;
      const arr1 = node.toplevels.map((updatedNode$toplevels$item1) => {
        let result = updatedNode$toplevels$item1;

        switch (updatedNode$toplevels$item1.type) {
          case "TypeAlias": {
            result = transformTypeAlias(
              updatedNode$toplevels$item1,
              visitor,
              ctx
            );
            changed2 = changed2 || result !== updatedNode$toplevels$item1;
            break;
          }

          default: {
            // let changed3 = false;

            const result$2node = transformType(
              updatedNode$toplevels$item1,
              visitor,
              ctx
            );
            changed2 = changed2 || result$2node !== updatedNode$toplevels$item1;
            result = result$2node;
          }
        }
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

export const transformDecoratorDecl = <Ctx>(
  node: DecoratorDecl,
  visitor: Visitor<Ctx>,
  ctx: Ctx
): DecoratorDecl => {
  if (!node) {
    throw new Error("No DecoratorDecl provided");
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
            ctx
          );
          changed3 = changed3 || result$sym !== updatedNode$items$item1.sym;

          const result$bound = transformType(
            updatedNode$items$item1.bound,
            visitor,
            ctx
          );
          changed3 = changed3 || result$bound !== updatedNode$items$item1.bound;
          if (changed3) {
            result = { ...result, sym: result$sym, bound: result$bound };
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
  ctx: Ctx
): TAdd => {
  if (!node) {
    throw new Error("No TAdd provided");
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
        const result = transformType(updatedNode$elements$item1, visitor, ctx);
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
  ctx: Ctx
): TSub => {
  if (!node) {
    throw new Error("No TSub provided");
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
        const result = transformType(updatedNode$elements$item1, visitor, ctx);
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
  ctx: Ctx
): TOr => {
  if (!node) {
    throw new Error("No TOr provided");
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
        const result = transformType(updatedNode$elements$item1, visitor, ctx);
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
