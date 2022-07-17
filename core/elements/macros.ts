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

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    TypeToplevel(node: p.TypeToplevel, ctx: TCtx): t.TypeToplevel {
        switch (node.type) {
            case 'TypeAlias':
                return ctx.ToTast.TypeAlias(node, ctx);

            case 'TOps':
                return ctx.ToTast.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToTast.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToTast.TApply(node, ctx);

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
            case 'DecoratedExpression':
                return ctx.ToTast.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToTast.Apply(node, ctx);

            case 'Number':
                return ctx.ToTast.Number(node, ctx);

            case 'Boolean':
                return ctx.ToTast.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToTast.Identifier(node, ctx);

            case 'ParenedExpression':
                return ctx.ToTast.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToTast.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToTast.Enum(node, ctx);

            case 'Record':
                return ctx.ToTast.Record(node, ctx);

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

    Type(node: p.Type, ctx: TCtx): t.Type {
        switch (node.type) {
            case 'TOps':
                return ctx.ToTast.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToTast.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToTast.TApply(node, ctx);

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

            case 'TDecorated':
                return ctx.ToAst.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToAst.TApply(node, ctx);

            case 'TRecord':
                return ctx.ToAst.TRecord(node, ctx);

            case 'TOps':
                return ctx.ToAst.TOps(node, ctx);

            case 'TypeAlias':
                return ctx.ToAst.TypeAlias(node, ctx);

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

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    Expression(node: t.Expression, ctx: TACtx): p.Expression {
        switch (node.type) {
            case 'Ref':
                return ctx.ToAst.Ref(node, ctx);

            case 'Apply':
                return ctx.ToAst.Apply(node, ctx);

            case 'Enum':
                return ctx.ToAst.Enum(node, ctx);

            case 'Record':
                return ctx.ToAst.Record(node, ctx);

            case 'Number':
                return ctx.ToAst.Number(node, ctx);

            case 'Boolean':
                return ctx.ToAst.Boolean(node, ctx);

            case 'TemplateString':
                return ctx.ToAst.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToAst.TypeApplication(node, ctx);

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

            case 'TDecorated':
                return ctx.ToAst.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToAst.TApply(node, ctx);

            case 'TRecord':
                return ctx.ToAst.TRecord(node, ctx);

            case 'TOps':
                return ctx.ToAst.TOps(node, ctx);

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

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },

    TypeToplevel(node: p.TypeToplevel, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'TypeAlias':
                return ctx.ToPP.TypeAlias(node, ctx);

            case 'TOps':
                return ctx.ToPP.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToPP.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToPP.TApply(node, ctx);

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
            case 'DecoratedExpression':
                return ctx.ToPP.DecoratedExpression(node, ctx);

            case 'Apply':
                return ctx.ToPP.Apply(node, ctx);

            case 'Number':
                return ctx.ToPP.Number(node, ctx);

            case 'Boolean':
                return ctx.ToPP.Boolean(node, ctx);

            case 'Identifier':
                return ctx.ToPP.Identifier(node, ctx);

            case 'ParenedExpression':
                return ctx.ToPP.ParenedExpression(node, ctx);

            case 'TemplateString':
                return ctx.ToPP.TemplateString(node, ctx);

            case 'Enum':
                return ctx.ToPP.Enum(node, ctx);

            case 'Record':
                return ctx.ToPP.Record(node, ctx);

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

    Type(node: p.Type, ctx: PCtx): pp.PP {
        switch (node.type) {
            case 'TOps':
                return ctx.ToPP.TOps(node, ctx);

            case 'TDecorated':
                return ctx.ToPP.TDecorated(node, ctx);

            case 'TApply':
                return ctx.ToPP.TApply(node, ctx);

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
            case 'Ref':
                return ctx.ToIR.Ref(node, ctx);

            case 'Apply':
                return ctx.ToIR.Apply(node, ctx);

            case 'Enum':
                return ctx.ToIR.Enum(node, ctx);

            case 'Record':
                return ctx.ToIR.Record(node, ctx);

            case 'Number':
                return ctx.ToIR.Number(node, ctx);

            case 'Boolean':
                return ctx.ToIR.Boolean(node, ctx);

            case 'TemplateString':
                return ctx.ToIR.TemplateString(node, ctx);

            case 'TypeApplication':
                return ctx.ToIR.TypeApplication(node, ctx);

            case 'DecoratedExpression':
                return ctx.ToIR.DecoratedExpression(node, ctx);

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

            case 'Boolean':
                return ctx.ToJS.Boolean(node, ctx);

            case 'IApply':
                return ctx.ToJS.IApply(node, ctx);

            case 'ITemplateString':
                return ctx.ToJS.ITemplateString(node, ctx);

            case 'IEnum':
                return ctx.ToJS.IEnum(node, ctx);

            case 'IRecord':
                return ctx.ToJS.IRecord(node, ctx);

            default:
                let _: never = node;
                throw new Error('Nope');
        }
    },
};
