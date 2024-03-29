import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';
import { Ctx as JCtx } from '../ir/to-js';
import { Ctx as ICtx } from '../ir/ir';
import * as b from '@babel/types';

export const ToTast = {
    Suffix(node: p.Suffix, next: t.Expression, ctx: TCtx): t.Expression {
        switch (node.type) {
            case 'CallSuffix':
                return ctx.ToTast.CallSuffix(node, next, ctx);

            case 'TypeApplicationSuffix':
                return ctx.ToTast.TypeApplicationSuffix(node, next, ctx);

            case 'AwaitSuffix':
                return ctx.ToTast.AwaitSuffix(node, next, ctx);

            case 'ArrowSuffix':
                return ctx.ToTast.ArrowSuffix(node, next, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    ArrayItem(node: p.ArrayItem, ctx: TCtx): t.ArrayItem {
        switch (node.type) {
            case 'TypeAbstraction':
                return ctx.ToTast.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToTast.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToTast.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToTast.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToTast.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToTast.Apply(node, ctx);

            case 'If':
                return ctx.ToTast.If(node, ctx);

            case 'Switch':
                return ctx.ToTast.Switch(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'Boolean':
                return ctx.ToTast.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToTast.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToTast.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToTast.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToTast.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToTast.Enum(node, ctx);

            case 'Record':
                return ctx.ToTast.Record(node, ctx);

            case 'Block':
                return ctx.ToTast.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToTast.ArrayExpr(node, ctx);

            case 'SpreadExpr':
                return ctx.ToTast.SpreadExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    TypeToplevel(node: p.TypeToplevel, ctx: TCtx): t.TypeToplevel {
        switch (node.type) {
            case 'Aliases':
                return ctx.ToTast.Aliases(node, ctx);

            case 'TypeAlias':
                return ctx.ToTast.TypeAlias(node, ctx);

            case 'TOps':
                return ctx.ToTast.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToTast.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToTast.TApply(node, ctx);

            case 'TConst':
                return ctx.ToTast.TConst(node, ctx);

            case 'TBlank':
                return ctx.ToTast.TBlank(node, ctx);

            case 'TRef':
                return ctx.ToTast.TRef(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'String':
                return ctx.ToTast.String(node, ctx);

            case 'TLambda':
                return ctx.ToTast.TLambda(node, ctx);

            case 'TVars':
                return ctx.ToTast.TVars(node, ctx);

            case 'TParens':
                return ctx.ToTast.TParens(node, ctx);

            case 'TEnum':
                return ctx.ToTast.TEnum(node, ctx);

            case 'TRecord':
                return ctx.ToTast.TRecord(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Expression(node: p.Expression, ctx: TCtx): t.Expression {
        switch (node.type) {
            case 'TypeAbstraction':
                return ctx.ToTast.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToTast.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToTast.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToTast.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToTast.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToTast.Apply(node, ctx);

            case 'If':
                return ctx.ToTast.If(node, ctx);

            case 'Switch':
                return ctx.ToTast.Switch(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'Boolean':
                return ctx.ToTast.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToTast.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToTast.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToTast.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToTast.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToTast.Enum(node, ctx);

            case 'Record':
                return ctx.ToTast.Record(node, ctx);

            case 'Block':
                return ctx.ToTast.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToTast.ArrayExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    DecoratorArg(node: p.DecoratorArg, ctx: TCtx): t.DecoratorArg {
        switch (node.type) {
            case 'DecType':
                return ctx.ToTast.DecType(node, ctx);

            case 'DecExpr':
                return ctx.ToTast.DecExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    IfCond(node: p.IfCond, ctx: TCtx): t.IfCond {
        switch (node.type) {
            case 'Let':
                return ctx.ToTast.Let(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToTast.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToTast.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToTast.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToTast.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToTast.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToTast.Apply(node, ctx);

            case 'If':
                return ctx.ToTast.If(node, ctx);

            case 'Switch':
                return ctx.ToTast.Switch(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'Boolean':
                return ctx.ToTast.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToTast.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToTast.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToTast.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToTast.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToTast.Enum(node, ctx);

            case 'Record':
                return ctx.ToTast.Record(node, ctx);

            case 'Block':
                return ctx.ToTast.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToTast.ArrayExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Stmt(node: p.Stmt, ctx: TCtx): t.Stmt {
        switch (node.type) {
            case 'Let':
                return ctx.ToTast.Let(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToTast.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToTast.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToTast.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToTast.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToTast.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToTast.Apply(node, ctx);

            case 'If':
                return ctx.ToTast.If(node, ctx);

            case 'Switch':
                return ctx.ToTast.Switch(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'Boolean':
                return ctx.ToTast.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToTast.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToTast.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToTast.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToTast.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToTast.Enum(node, ctx);

            case 'Record':
                return ctx.ToTast.Record(node, ctx);

            case 'Block':
                return ctx.ToTast.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToTast.ArrayExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Pattern(node: p.Pattern, ctx: TCtx): t.Pattern {
        switch (node.type) {
            case 'PDecorated':
                return ctx.ToTast.PDecorated(node, ctx);

            case 'PEnum':
                return ctx.ToTast.PEnum(node, ctx);

            case 'PName':
                return ctx.ToTast.PName(node, ctx);

            case 'PTuple':
                return ctx.ToTast.PTuple(node, ctx);

            case 'PRecord':
                return ctx.ToTast.PRecord(node, ctx);

            case 'PArray':
                return ctx.ToTast.PArray(node, ctx);

            case 'PBlank':
                return ctx.ToTast.PBlank(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'String':
                return ctx.ToTast.String(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    PArrayItem(node: p.PArrayItem, ctx: TCtx): t.PArrayItem {
        switch (node.type) {
            case 'PDecorated':
                return ctx.ToTast.PDecorated(node, ctx);

            case 'PEnum':
                return ctx.ToTast.PEnum(node, ctx);

            case 'PName':
                return ctx.ToTast.PName(node, ctx);

            case 'PTuple':
                return ctx.ToTast.PTuple(node, ctx);

            case 'PRecord':
                return ctx.ToTast.PRecord(node, ctx);

            case 'PArray':
                return ctx.ToTast.PArray(node, ctx);

            case 'PBlank':
                return ctx.ToTast.PBlank(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'String':
                return ctx.ToTast.String(node, ctx);

            case 'PSpread':
                return ctx.ToTast.PSpread(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Type(node: p.Type, ctx: TCtx): t.Type {
        switch (node.type) {
            case 'TOps':
                return ctx.ToTast.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToTast.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToTast.TApply(node, ctx);

            case 'TConst':
                return ctx.ToTast.TConst(node, ctx);

            case 'TBlank':
                return ctx.ToTast.TBlank(node, ctx);

            case 'TRef':
                return ctx.ToTast.TRef(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'String':
                return ctx.ToTast.String(node, ctx);

            case 'TLambda':
                return ctx.ToTast.TLambda(node, ctx);

            case 'TVars':
                return ctx.ToTast.TVars(node, ctx);

            case 'TParens':
                return ctx.ToTast.TParens(node, ctx);

            case 'TEnum':
                return ctx.ToTast.TEnum(node, ctx);

            case 'TRecord':
                return ctx.ToTast.TRecord(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },
};

export const ToAst = {
    TypeToplevel(node: t.TypeToplevel, ctx: TACtx): p.TypeToplevel {
        switch (node.type) {
            case 'TRef':
                return ctx.ToAst.TRef(node, ctx);

            case 'TVbl':
                return ctx.ToAst.TVbl(node, ctx);

            case 'TBlank':
                return ctx.ToAst.TBlank(node, ctx);

            case 'TLambda':
                return ctx.ToAst.TLambda(node, ctx);

            case 'TEnum':
                return ctx.ToAst.TEnum(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'String':
                return ctx.ToAst.String(node, ctx);

            case 'TVars':
                return ctx.ToAst.TVars(node, ctx);

            case 'TConst':
                return ctx.ToAst.TConst(node, ctx);

            case 'TApply':
                return ctx.ToAst.TApply(node, ctx);

            case 'TRecord':
                return ctx.ToAst.TRecord(node, ctx);

            case 'TDecorated':
                return ctx.ToAst.TDecorated(node, ctx);

            case 'TOps':
                return ctx.ToAst.TOps(node, ctx);

            case 'TypeAlias':
                return ctx.ToAst.TypeAlias(node, ctx);

            case 'ToplevelAliases':
                return ctx.ToAst.ToplevelAliases(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Toplevel(node: t.Toplevel, ctx: TACtx): p.Toplevel {
        switch (node.type) {
            case 'ToplevelExpression':
                return ctx.ToAst.ToplevelExpression(node, ctx);

            case 'TypeAlias':
                return ctx.ToAst.TypeAlias(node, ctx);

            case 'ToplevelLet':
                return ctx.ToAst.ToplevelLet(node, ctx);

            case 'ToplevelAliases':
                return ctx.ToAst.ToplevelAliases(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Expression(node: t.Expression, ctx: TACtx): p.Expression {
        switch (node.type) {
            case 'If':
                return ctx.ToAst.If(node, ctx);

            case 'Ref':
                return ctx.ToAst.Ref(node, ctx);

            case 'Enum':
                return ctx.ToAst.Enum(node, ctx);

            case 'Block':
                return ctx.ToAst.Block(node, ctx);

            case 'Apply':
                return ctx.ToAst.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToAst.Lambda(node, ctx);

            case 'Record':
                return ctx.ToAst.Record(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'Switch':
                return ctx.ToAst.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToAst.Boolean(node, ctx);

            case 'Await':
                return ctx.ToAst.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToAst.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToAst.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToAst.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToAst.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToAst.DecoratedExpression(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    DecoratorArg(node: t.DecoratorArg, ctx: TACtx): p.DecoratorArg {
        switch (node.type) {
            case 'DExpr':
                return ctx.ToAst.DExpr(node, ctx);

            case 'DType':
                return ctx.ToAst.DType(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Type(node: t.Type, ctx: TACtx): p.Type {
        switch (node.type) {
            case 'TRef':
                return ctx.ToAst.TRef(node, ctx);

            case 'TVbl':
                return ctx.ToAst.TVbl(node, ctx);

            case 'TBlank':
                return ctx.ToAst.TBlank(node, ctx);

            case 'TLambda':
                return ctx.ToAst.TLambda(node, ctx);

            case 'TEnum':
                return ctx.ToAst.TEnum(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'String':
                return ctx.ToAst.String(node, ctx);

            case 'TVars':
                return ctx.ToAst.TVars(node, ctx);

            case 'TConst':
                return ctx.ToAst.TConst(node, ctx);

            case 'TApply':
                return ctx.ToAst.TApply(node, ctx);

            case 'TRecord':
                return ctx.ToAst.TRecord(node, ctx);

            case 'TDecorated':
                return ctx.ToAst.TDecorated(node, ctx);

            case 'TOps':
                return ctx.ToAst.TOps(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Stmt(node: t.Stmt, ctx: TACtx): p.Stmt {
        switch (node.type) {
            case 'Let':
                return ctx.ToAst.Let(node, ctx);

            case 'If':
                return ctx.ToAst.If(node, ctx);

            case 'Ref':
                return ctx.ToAst.Ref(node, ctx);

            case 'Enum':
                return ctx.ToAst.Enum(node, ctx);

            case 'Block':
                return ctx.ToAst.Block(node, ctx);

            case 'Apply':
                return ctx.ToAst.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToAst.Lambda(node, ctx);

            case 'Record':
                return ctx.ToAst.Record(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'Switch':
                return ctx.ToAst.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToAst.Boolean(node, ctx);

            case 'Await':
                return ctx.ToAst.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToAst.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToAst.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToAst.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToAst.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToAst.DecoratedExpression(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    PArrayItem(node: t.PArrayItem, ctx: TACtx): p.PArrayItem {
        switch (node.type) {
            case 'PName':
                return ctx.ToAst.PName(node, ctx);

            case 'PRecord':
                return ctx.ToAst.PRecord(node, ctx);

            case 'PBlank':
                return ctx.ToAst.PBlank(node, ctx);

            case 'PEnum':
                return ctx.ToAst.PEnum(node, ctx);

            case 'PArray':
                return ctx.ToAst.PArray(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'String':
                return ctx.ToAst.String(node, ctx);

            case 'PDecorated':
                return ctx.ToAst.PDecorated(node, ctx);

            case 'PSpread':
                return ctx.ToAst.PSpread(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Pattern(node: t.Pattern, ctx: TACtx): p.Pattern {
        switch (node.type) {
            case 'PName':
                return ctx.ToAst.PName(node, ctx);

            case 'PRecord':
                return ctx.ToAst.PRecord(node, ctx);

            case 'PBlank':
                return ctx.ToAst.PBlank(node, ctx);

            case 'PEnum':
                return ctx.ToAst.PEnum(node, ctx);

            case 'PArray':
                return ctx.ToAst.PArray(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'String':
                return ctx.ToAst.String(node, ctx);

            case 'PDecorated':
                return ctx.ToAst.PDecorated(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    IfCond(node: t.IfCond, ctx: TACtx): p.IfCond {
        switch (node.type) {
            case 'Let':
                return ctx.ToAst.Let(node, ctx);

            case 'If':
                return ctx.ToAst.If(node, ctx);

            case 'Ref':
                return ctx.ToAst.Ref(node, ctx);

            case 'Enum':
                return ctx.ToAst.Enum(node, ctx);

            case 'Block':
                return ctx.ToAst.Block(node, ctx);

            case 'Apply':
                return ctx.ToAst.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToAst.Lambda(node, ctx);

            case 'Record':
                return ctx.ToAst.Record(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'Switch':
                return ctx.ToAst.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToAst.Boolean(node, ctx);

            case 'Await':
                return ctx.ToAst.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToAst.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToAst.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToAst.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToAst.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToAst.DecoratedExpression(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    ArrayItem(node: t.ArrayItem, ctx: TACtx): p.ArrayItem {
        switch (node.type) {
            case 'If':
                return ctx.ToAst.If(node, ctx);

            case 'Ref':
                return ctx.ToAst.Ref(node, ctx);

            case 'Enum':
                return ctx.ToAst.Enum(node, ctx);

            case 'Block':
                return ctx.ToAst.Block(node, ctx);

            case 'Apply':
                return ctx.ToAst.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToAst.Lambda(node, ctx);

            case 'Record':
                return ctx.ToAst.Record(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'Switch':
                return ctx.ToAst.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToAst.Boolean(node, ctx);

            case 'Await':
                return ctx.ToAst.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToAst.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToAst.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToAst.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToAst.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToAst.DecoratedExpression(node, ctx);

            case 'SpreadExpr':
                return ctx.ToAst.SpreadExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },
};

export const ToPP = {
    Suffix(node: p.Suffix, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'CallSuffix':
                return ctx.ToPP.CallSuffix(node, ctx);

            case 'TypeApplicationSuffix':
                return ctx.ToPP.TypeApplicationSuffix(node, ctx);

            case 'AwaitSuffix':
                return ctx.ToPP.AwaitSuffix(node, ctx);

            case 'ArrowSuffix':
                return ctx.ToPP.ArrowSuffix(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    ArrayItem(node: p.ArrayItem, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'TypeAbstraction':
                return ctx.ToPP.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToPP.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToPP.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToPP.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToPP.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToPP.Apply(node, ctx);

            case 'If':
                return ctx.ToPP.If(node, ctx);

            case 'Switch':
                return ctx.ToPP.Switch(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'Boolean':
                return ctx.ToPP.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToPP.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToPP.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToPP.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToPP.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToPP.Enum(node, ctx);

            case 'Record':
                return ctx.ToPP.Record(node, ctx);

            case 'Block':
                return ctx.ToPP.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToPP.ArrayExpr(node, ctx);

            case 'SpreadExpr':
                return ctx.ToPP.SpreadExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    TypeToplevel(node: p.TypeToplevel, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'Aliases':
                return ctx.ToPP.Aliases(node, ctx);

            case 'TypeAlias':
                return ctx.ToPP.TypeAlias(node, ctx);

            case 'TOps':
                return ctx.ToPP.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToPP.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToPP.TApply(node, ctx);

            case 'TConst':
                return ctx.ToPP.TConst(node, ctx);

            case 'TBlank':
                return ctx.ToPP.TBlank(node, ctx);

            case 'TRef':
                return ctx.ToPP.TRef(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'String':
                return ctx.ToPP.String(node, ctx);

            case 'TLambda':
                return ctx.ToPP.TLambda(node, ctx);

            case 'TVars':
                return ctx.ToPP.TVars(node, ctx);

            case 'TParens':
                return ctx.ToPP.TParens(node, ctx);

            case 'TEnum':
                return ctx.ToPP.TEnum(node, ctx);

            case 'TRecord':
                return ctx.ToPP.TRecord(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Expression(node: p.Expression, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'TypeAbstraction':
                return ctx.ToPP.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToPP.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToPP.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToPP.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToPP.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToPP.Apply(node, ctx);

            case 'If':
                return ctx.ToPP.If(node, ctx);

            case 'Switch':
                return ctx.ToPP.Switch(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'Boolean':
                return ctx.ToPP.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToPP.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToPP.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToPP.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToPP.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToPP.Enum(node, ctx);

            case 'Record':
                return ctx.ToPP.Record(node, ctx);

            case 'Block':
                return ctx.ToPP.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToPP.ArrayExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    DecoratorArg(node: p.DecoratorArg, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'DecType':
                return ctx.ToPP.DecType(node, ctx);

            case 'DecExpr':
                return ctx.ToPP.DecExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    IfCond(node: p.IfCond, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'Let':
                return ctx.ToPP.Let(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToPP.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToPP.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToPP.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToPP.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToPP.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToPP.Apply(node, ctx);

            case 'If':
                return ctx.ToPP.If(node, ctx);

            case 'Switch':
                return ctx.ToPP.Switch(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'Boolean':
                return ctx.ToPP.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToPP.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToPP.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToPP.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToPP.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToPP.Enum(node, ctx);

            case 'Record':
                return ctx.ToPP.Record(node, ctx);

            case 'Block':
                return ctx.ToPP.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToPP.ArrayExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Stmt(node: p.Stmt, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'Let':
                return ctx.ToPP.Let(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToPP.TypeAbstraction(node, ctx);

            case 'Lambda':
                return ctx.ToPP.Lambda(node, ctx);

            case 'BinOp':
                return ctx.ToPP.BinOp(node, ctx);

            case 'WithUnary':
                return ctx.ToPP.WithUnary(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToPP.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToPP.Apply(node, ctx);

            case 'If':
                return ctx.ToPP.If(node, ctx);

            case 'Switch':
                return ctx.ToPP.Switch(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'Boolean':
                return ctx.ToPP.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToPP.Identifier(node, ctx);

            case 'ParenedOp':
                return ctx.ToPP.ParenedOp(node, ctx);

            case 'ParenedExpression':
                return ctx.ToPP.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToPP.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToPP.Enum(node, ctx);

            case 'Record':
                return ctx.ToPP.Record(node, ctx);

            case 'Block':
                return ctx.ToPP.Block(node, ctx);

            case 'ArrayExpr':
                return ctx.ToPP.ArrayExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Pattern(node: p.Pattern, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'PDecorated':
                return ctx.ToPP.PDecorated(node, ctx);

            case 'PEnum':
                return ctx.ToPP.PEnum(node, ctx);

            case 'PName':
                return ctx.ToPP.PName(node, ctx);

            case 'PTuple':
                return ctx.ToPP.PTuple(node, ctx);

            case 'PRecord':
                return ctx.ToPP.PRecord(node, ctx);

            case 'PArray':
                return ctx.ToPP.PArray(node, ctx);

            case 'PBlank':
                return ctx.ToPP.PBlank(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'String':
                return ctx.ToPP.String(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    PArrayItem(node: p.PArrayItem, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'PDecorated':
                return ctx.ToPP.PDecorated(node, ctx);

            case 'PEnum':
                return ctx.ToPP.PEnum(node, ctx);

            case 'PName':
                return ctx.ToPP.PName(node, ctx);

            case 'PTuple':
                return ctx.ToPP.PTuple(node, ctx);

            case 'PRecord':
                return ctx.ToPP.PRecord(node, ctx);

            case 'PArray':
                return ctx.ToPP.PArray(node, ctx);

            case 'PBlank':
                return ctx.ToPP.PBlank(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'String':
                return ctx.ToPP.String(node, ctx);

            case 'PSpread':
                return ctx.ToPP.PSpread(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Type(node: p.Type, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'TOps':
                return ctx.ToPP.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToPP.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToPP.TApply(node, ctx);

            case 'TConst':
                return ctx.ToPP.TConst(node, ctx);

            case 'TBlank':
                return ctx.ToPP.TBlank(node, ctx);

            case 'TRef':
                return ctx.ToPP.TRef(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'String':
                return ctx.ToPP.String(node, ctx);

            case 'TLambda':
                return ctx.ToPP.TLambda(node, ctx);

            case 'TVars':
                return ctx.ToPP.TVars(node, ctx);

            case 'TParens':
                return ctx.ToPP.TParens(node, ctx);

            case 'TEnum':
                return ctx.ToPP.TEnum(node, ctx);

            case 'TRecord':
                return ctx.ToPP.TRecord(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },
};

export const ToIR = {
    Expression(node: t.Expression, ctx: ICtx): t.IExpression {
        switch (node.type) {
            case 'If':
                return ctx.ToIR.If(node, ctx);

            case 'Ref':
                return ctx.ToIR.Ref(node, ctx);

            case 'Enum':
                return ctx.ToIR.Enum(node, ctx);

            case 'Block':
                return ctx.ToIR.Block(node, ctx);

            case 'Apply':
                return ctx.ToIR.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToIR.Lambda(node, ctx);

            case 'Record':
                return ctx.ToIR.Record(node, ctx);

            case 'Number':
                return ctx.ToIR.Number(node, ctx);

            case 'Switch':
                return ctx.ToIR.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToIR.Boolean(node, ctx);

            case 'Await':
                return ctx.ToIR.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToIR.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToIR.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToIR.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToIR.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToIR.DecoratedExpression(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Stmt(node: t.Stmt, ctx: ICtx): t.IStmt {
        switch (node.type) {
            case 'Let':
                return ctx.ToIR.Let(node, ctx);

            case 'If':
                return ctx.ToIR.If(node, ctx);

            case 'Ref':
                return ctx.ToIR.Ref(node, ctx);

            case 'Enum':
                return ctx.ToIR.Enum(node, ctx);

            case 'Block':
                return ctx.ToIR.Block(node, ctx);

            case 'Apply':
                return ctx.ToIR.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToIR.Lambda(node, ctx);

            case 'Record':
                return ctx.ToIR.Record(node, ctx);

            case 'Number':
                return ctx.ToIR.Number(node, ctx);

            case 'Switch':
                return ctx.ToIR.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToIR.Boolean(node, ctx);

            case 'Await':
                return ctx.ToIR.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToIR.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToIR.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToIR.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToIR.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToIR.DecoratedExpression(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    ArrayItem(node: t.ArrayItem, ctx: ICtx): t.IArrayItem {
        switch (node.type) {
            case 'If':
                return ctx.ToIR.If(node, ctx);

            case 'Ref':
                return ctx.ToIR.Ref(node, ctx);

            case 'Enum':
                return ctx.ToIR.Enum(node, ctx);

            case 'Block':
                return ctx.ToIR.Block(node, ctx);

            case 'Apply':
                return ctx.ToIR.Apply(node, ctx);

            case 'Lambda':
                return ctx.ToIR.Lambda(node, ctx);

            case 'Record':
                return ctx.ToIR.Record(node, ctx);

            case 'Number':
                return ctx.ToIR.Number(node, ctx);

            case 'Switch':
                return ctx.ToIR.Switch(node, ctx);

            case 'Boolean':
                return ctx.ToIR.Boolean(node, ctx);

            case 'Await':
                return ctx.ToIR.Await(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToIR.TypeAbstraction(node, ctx);

            case 'TemplateString':
                return ctx.ToIR.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToIR.TypeApplication(node, ctx);

            case 'ArrayExpr':
                return ctx.ToIR.ArrayExpr(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToIR.DecoratedExpression(node, ctx);

            case 'SpreadExpr':
                return ctx.ToIR.SpreadExpr(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },
};

export const ToJS = {
    IExpression(node: t.IExpression, ctx: JCtx): b.Expression {
        switch (node.type) {
            case 'Ref':
                return ctx.ToJS.Ref(node, ctx);

            case 'Number':
                return ctx.ToJS.Number(node, ctx);

            case 'Lambda':
                return ctx.ToJS.Lambda(node, ctx);

            case 'Boolean':
                return ctx.ToJS.Boolean(node, ctx);

            case 'Apply':
                return ctx.ToJS.Apply(node, ctx);

            case 'TemplateString':
                return ctx.ToJS.TemplateString(node, ctx);

            case 'ArrayExpr':
                return ctx.ToJS.ArrayExpr(node, ctx);

            case 'TypeAbstraction':
                return ctx.ToJS.TypeAbstraction(node, ctx);

            case 'Enum':
                return ctx.ToJS.Enum(node, ctx);

            case 'Record':
                return ctx.ToJS.Record(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },
};
