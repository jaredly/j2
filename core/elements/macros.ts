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

/*
ToTast: [
    [p.Suffix, t.Expression => t.Expression],
    [p.Expression => t.Expression
]
*/

export const ToTast = {
    Suffix(t: p.Suffix, next: t.Expression, ctx: TCtx): t.Expression {
        switch (t.type) {
            case 'CallSuffix':
                return ctx.ToTast.CallSuffix(t, next, ctx);

            case 'TypeApplicationSuffix':
                return ctx.ToTast.TypeApplicationSuffix(t, next, ctx);
        }
    },

    Expression(t: p.Expression, ctx: TCtx): t.Expression {
        /*:macro
        const names = 'DecoratedExpression | Apply | Number | Boolean | Identifier | ParenedExpression | TemplateString | Enum | Record'.split(' | ');
        const contents = names.map(name => `
        case '${name}':
            return ctx.ToTast.${name}(t, ctx);
        `).join('\n');
        return `switch (t.type) {
            ${contents}
            default:
                let _: never = t;
                throw new Error();
        }`;
*/
        switch (t.type) {
            case 'DecoratedExpression':
                return ctx.ToTast.DecoratedExpression(t, ctx);

            case 'Apply':
                return ctx.ToTast.Apply(t, ctx);

            case 'Number':
                return ctx.ToTast.Number(t, ctx);

            case 'Boolean':
                return ctx.ToTast.Boolean(t, ctx);

            case 'Identifier':
                return ctx.ToTast.Identifier(t, ctx);

            case 'ParenedExpression':
                return ctx.ToTast.ParenedExpression(t, ctx);

            case 'TemplateString':
                return ctx.ToTast.TemplateString(t, ctx);

            case 'Enum':
                return ctx.ToTast.Enum(t, ctx);

            case 'Record':
                return ctx.ToTast.Record(t, ctx);

            default:
                let _: never = t;
                throw new Error();
        }
        /*:endmacro*/
    },

    Type(t: p.Type, ctx: TCtx): t.Type {
        /*:macro
        const names = 'TOps TParens TRef TLambda TEnum Number String TVars TDecorated TApply TRecord TOps'.split(' ');
        // const names = 'TRef TLambda TEnum Number String TVars TDecorated TApply TRecord TOps'.split(' ');
        const contents = names.map(name => `
        case '${name}':
            return ctx.ToTast.${name}(t, ctx);
        `).join('\n');
        return `switch (t.type) {
            ${contents}
        }`;
*/
        switch (t.type) {
            case 'TOps':
                return ctx.ToTast.TOps(t, ctx);

            case 'TParens':
                return ctx.ToTast.TParens(t, ctx);

            case 'TRef':
                return ctx.ToTast.TRef(t, ctx);

            case 'TLambda':
                return ctx.ToTast.TLambda(t, ctx);

            case 'TEnum':
                return ctx.ToTast.TEnum(t, ctx);

            case 'Number':
                return ctx.ToTast.Number(t, ctx);

            case 'String':
                return ctx.ToTast.String(t, ctx);

            case 'TVars':
                return ctx.ToTast.TVars(t, ctx);

            case 'TDecorated':
                return ctx.ToTast.TDecorated(t, ctx);

            case 'TApply':
                return ctx.ToTast.TApply(t, ctx);

            case 'TRecord':
                return ctx.ToTast.TRecord(t, ctx);

            case 'TOps':
                return ctx.ToTast.TOps(t, ctx);
        }
        /*:endmacro*/
    },
};

export const ToAst = {
    Expression(t: t.Expression, ctx: TACtx): p.Expression {
        /*:macro
        const names = 'DecoratedExpression | Apply | Number | Boolean | Ref | TypeApplication | TemplateString | Enum | Record'.split(' | ');
        const contents = names.map(name => `
        case '${name}':
            return ctx.ToAst.${name}(t, ctx);
        `).join('\n');
        return `switch (t.type) {
            ${contents}
            default:
                let _: never = t;
                throw new Error();
        }`;
*/
        switch (t.type) {
            case 'DecoratedExpression':
                return ctx.ToAst.DecoratedExpression(t, ctx);

            case 'Apply':
                return ctx.ToAst.Apply(t, ctx);

            case 'Number':
                return ctx.ToAst.Number(t, ctx);

            case 'Boolean':
                return ctx.ToAst.Boolean(t, ctx);

            case 'Ref':
                return ctx.ToAst.Ref(t, ctx);

            case 'TypeApplication':
                return ctx.ToAst.TypeApplication(t, ctx);

            case 'TemplateString':
                return ctx.ToAst.TemplateString(t, ctx);

            case 'Enum':
                return ctx.ToAst.Enum(t, ctx);

            case 'Record':
                return ctx.ToAst.Record(t, ctx);

            default:
                let _: never = t;
                throw new Error();
        }
        /*:endmacro*/
    },

    Type(t: t.Type, ctx: TACtx): p.Type {
        /*:macro
        const names = 'TRef TLambda TEnum Number String TVars TDecorated TApply TRecord TOps'.split(' ');
        const contents = names.map(name => `
        case '${name}':
            return ctx.ToAst.${name}(t, ctx);
        `).join('\n');
        return `switch (t.type) {
            ${contents}
        }`;
*/
        switch (t.type) {
            case 'TRef':
                return ctx.ToAst.TRef(t, ctx);

            case 'TLambda':
                return ctx.ToAst.TLambda(t, ctx);

            case 'TEnum':
                return ctx.ToAst.TEnum(t, ctx);

            case 'Number':
                return ctx.ToAst.Number(t, ctx);

            case 'String':
                return ctx.ToAst.String(t, ctx);

            case 'TVars':
                return ctx.ToAst.TVars(t, ctx);

            case 'TDecorated':
                return ctx.ToAst.TDecorated(t, ctx);

            case 'TApply':
                return ctx.ToAst.TApply(t, ctx);

            case 'TRecord':
                return ctx.ToAst.TRecord(t, ctx);

            case 'TOps':
                return ctx.ToAst.TOps(t, ctx);
        }
        /*:endmacro*/
    },
};

export const ToPP = {
    Suffix(t: p.Suffix, ctx: PCtx): pp.PP {
        switch (t.type) {
            case 'CallSuffix':
                return ctx.ToPP.CallSuffix(t, ctx);

            case 'TypeApplicationSuffix':
                return ctx.ToPP.TypeApplicationSuffix(t, ctx);
        }
    },

    Expression(t: p.Expression, ctx: PCtx): pp.PP {
        /*:macro
        const names = 'DecoratedExpression | Apply | Number | Boolean | Identifier | ParenedExpression | TemplateString | Enum | Record'.split(' | ');
        const contents = names.map(name => `
        case '${name}':
            return ctx.ToPP.${name}(t, ctx);
        `).join('\n');
        return `switch (t.type) {
            ${contents}
            default:
                let _: never = t;
                throw new Error();
        }`;
*/
        switch (t.type) {
            case 'DecoratedExpression':
                return ctx.ToPP.DecoratedExpression(t, ctx);

            case 'Apply':
                return ctx.ToPP.Apply(t, ctx);

            case 'Number':
                return ctx.ToPP.Number(t, ctx);

            case 'Boolean':
                return ctx.ToPP.Boolean(t, ctx);

            case 'Identifier':
                return ctx.ToPP.Identifier(t, ctx);

            case 'ParenedExpression':
                return ctx.ToPP.ParenedExpression(t, ctx);

            case 'TemplateString':
                return ctx.ToPP.TemplateString(t, ctx);

            case 'Enum':
                return ctx.ToPP.Enum(t, ctx);

            case 'Record':
                return ctx.ToPP.Record(t, ctx);

            default:
                let _: never = t;
                throw new Error();
        }
        /*:endmacro*/
    },

    Type(t: p.Type, ctx: PCtx): pp.PP {
        /*:macro
        const names = 'TParens TRef TLambda TEnum Number String TVars TDecorated TApply TRecord TOps'.split(' ');
        const contents = names.map(name => `
        case '${name}':
            return ctx.ToPP.${name}(t, ctx);
        `).join('\n');
        return `switch (t.type) {
            ${contents}
        }`;
*/
        switch (t.type) {
            case 'TParens':
                return ctx.ToPP.TParens(t, ctx);

            case 'TRef':
                return ctx.ToPP.TRef(t, ctx);

            case 'TLambda':
                return ctx.ToPP.TLambda(t, ctx);

            case 'TEnum':
                return ctx.ToPP.TEnum(t, ctx);

            case 'Number':
                return ctx.ToPP.Number(t, ctx);

            case 'String':
                return ctx.ToPP.String(t, ctx);

            case 'TVars':
                return ctx.ToPP.TVars(t, ctx);

            case 'TDecorated':
                return ctx.ToPP.TDecorated(t, ctx);

            case 'TApply':
                return ctx.ToPP.TApply(t, ctx);

            case 'TRecord':
                return ctx.ToPP.TRecord(t, ctx);

            case 'TOps':
                return ctx.ToPP.TOps(t, ctx);
        }
        /*:endmacro*/
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
