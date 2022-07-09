import { readdirSync, readFileSync } from 'fs';
import { typeToString } from '../../../devui/Highlight';
import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { typeToplevel } from '../../elements/base';
import { File, parseTypeFile, TypeFile } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { idToString } from '../../ids';
import * as t from '../../typed-ast';
import { Ctx } from '../to-tast';
import { typeMatches } from '../typeMatches';

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

export type TypeTest = {
    file: t.TypeFile;
    statuses: Array<{ loc: t.Loc; text: string | null }>;
    ctx: FullContext;
};

export const runInner = () => {};

export const runTypeTest = (ast: TypeFile): TypeTest => {
    let ctx = builtinContext.clone();

    const assertById: { [key: string]: Function } = {};
    Object.keys(assertions).forEach((key) => {
        const { id } = addBuiltinDecorator(ctx, `type:${key}`, 0);
        assertById[idToString(id)] = assertions[key as keyof typeof assertions];
    });

    const statuses: { loc: t.Loc; text: string | null }[] = [];

    const tast: t.TypeFile = {
        type: 'TypeFile',
        loc: ast.loc,
        toplevels: [],
        comments: ast.comments,
    };

    ast.toplevels.forEach((t) => {
        ctx.resetSym();

        if (t.type === 'TypeAlias') {
            // Need to reset again, so the args get the same syms
            // when we parse them again
            ctx.resetSym();
            ctx = ctx.toplevelConfig(typeToplevel(t, ctx)) as FullContext;
            let top = ctx.ToTast.TypeAlias(t, ctx);
            tast.toplevels.push(top);
            ctx = ctx.withTypes(top.elements) as FullContext;
        } else {
            let type = ctx.ToTast[t.type](t as any, ctx);
            tast.toplevels.push(type);
            if (type.type === 'TDecorated') {
                const inner = type.inner;
                type.decorators.forEach((d) => {
                    const hash = idToString((d.id.ref as t.GlobalRef).id);
                    if (assertById[hash]) {
                        const msg = assertById[hash](
                            d.args.map((arg) => arg.arg),
                            inner,
                            ctx,
                        );
                        statuses.push({ loc: d.loc, text: msg });
                    }
                });
            } else {
                throw new Error('Not decorated?' + type.type);
            }
        }
    });
    return { statuses, file: tast, ctx };
};
