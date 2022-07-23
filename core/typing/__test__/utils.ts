import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { readdirSync, readFileSync } from 'fs';
import { File, parseTypeFile, TypeFile } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { Ctx } from '../to-tast';
import { typeMatches } from '../typeMatches';
import { printToString } from '../../printer/pp';
import { newPPCtx } from '../../printer/to-pp';
import { printCtx } from '../to-ast';
import { Ctx as JCtx, ExecutionContext } from '../../ir/to-js';
import { Ctx as iCtx } from '../../ir/ir';
import * as t from '../../typed-ast';

export const typeToString = (t: t.Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    return printToString(pctx.ToPP.Type(ast, pctx), 100);
};

const getTypeArg = (args: t.DecoratorArg[]): string | t.DType => {
    if (args.length !== 1) {
        return 'should have 1 argument';
    }
    if (args[0].type !== 'DType') {
        return 'should be a DType';
    }
    return args[0] as t.DType;
};

const getExprArg = (args: t.DecoratorArg[]): string | t.DExpr => {
    if (args.length !== 1) {
        return 'should have 1 argument';
    }
    if (args[0].type !== 'DExpr') {
        return 'should be a DExpr';
    }
    return args[0] as t.DExpr;
};

export const valueAssertions = {
    equal(args: t.DecoratorArg[], candidate: any, ctx: ExecutionContext) {
        const arg = getExprArg(args);
        if (typeof arg === 'string') {
            return arg;
        }
        // ummmmm I thikn I want to do the == generation dealio idk
        try {
            const expected = ctx.execute(arg.expr);
            return candidate === expected
                ? undefined
                : `expected ${candidate} to equal ${expected}`;
        } catch (err) {
            return `Failed to execute ${(err as Error).message}`;
        }
    },
    true(args: t.DecoratorArg[], candidate: any, ctx: ExecutionContext) {
        try {
            return candidate === true
                ? undefined
                : `Expected true, got ${candidate}`;
        } catch (err) {
            return `Failed to execute ${(err as Error).message}`;
        }
    },
    false(args: t.DecoratorArg[], candidate: any, ctx: ExecutionContext) {
        try {
            return candidate === false
                ? undefined
                : `Expected false, got ${candidate}`;
        } catch (err) {
            return `Failed to execute ${(err as Error).message}`;
        }
    },
};

export const assertions = {
    shouldMatch(args: t.DecoratorArg[], inner: t.Type, ctx: FullContext) {
        const arg = getTypeArg(args);
        if (typeof arg === 'string') {
            return arg;
        }
        if (!typeMatches(inner, arg.typ, ctx)) {
            return `should match ${typeToString(arg.typ, ctx)}`;
        }
    },
    shouldNotMatch(args: t.DecoratorArg[], inner: t.Type, ctx: FullContext) {
        const arg = getTypeArg(args);
        if (typeof arg === 'string') {
            return arg;
        }
        if (typeMatches(inner, arg.typ, ctx)) {
            return `should not match ${typeToString(arg.typ, ctx)}`;
        }
    },
    shouldBe(args: t.DecoratorArg[], inner: t.Type, ctx: FullContext) {
        const arg = getTypeArg(args);
        if (typeof arg === 'string') {
            return arg;
        }
        if (!typeMatches(inner, arg.typ, ctx)) {
            return `should match ${typeToString(arg.typ, ctx)}`;
        }
        if (!typeMatches(arg.typ, inner, ctx)) {
            return `should be matched by ${typeToString(arg.typ, ctx)}`;
        }
    },
};
