import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { readdirSync, readFileSync } from 'fs';
import { File, parseTypeFile, TypeFile } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { Ctx } from '../to-tast';
import { typeMatches } from '../typeMatches';
import { printToString } from '../../printer/pp';
import { newPPCtx } from '../../printer/to-pp';
import { printCtx } from '../to-ast';
import * as t from '../../typed-ast';

export const typeToString = (t: t.Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    return printToString(pctx.ToPP.Type(ast, pctx), 100);
};

export const assertions = {
    shouldMatch(args: t.DecoratorArg[], inner: t.Type, ctx: FullContext) {
        if (args.length !== 1) {
            return 'should have 1 argument';
        }
        if (args[0].type !== 'DType') {
            return 'should be a DType';
        }
        const arg = args[0] as t.DType;
        if (!typeMatches(inner, arg.typ, ctx)) {
            return `should match ${typeToString(arg.typ, ctx)}`;
        }
    },
    shouldNotMatch(args: t.DecoratorArg[], inner: t.Type, ctx: FullContext) {
        if (args.length !== 1) {
            return 'should have 1 argument';
        }
        if (args[0].type !== 'DType') {
            return 'should be a DType';
        }
        const arg = args[0] as t.DType;
        // console.log(inner, arg.typ);
        if (typeMatches(inner, arg.typ, ctx)) {
            return `should not match ${typeToString(arg.typ, ctx)}`;
        }
    },
    shouldBe(args: t.DecoratorArg[], inner: t.Type, ctx: FullContext) {
        if (args.length !== 1) {
            return 'should have 1 argument';
        }
        if (args[0].type !== 'DType') {
            return 'should be a DType';
        }
        const arg = args[0] as t.DType;
        if (!typeMatches(inner, arg.typ, ctx)) {
            return `should match ${typeToString(arg.typ, ctx)}`;
        }
        if (!typeMatches(arg.typ, inner, ctx)) {
            return `should be matched by ${typeToString(arg.typ, ctx)}`;
        }
    },
};
