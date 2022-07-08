import { readdirSync, readFileSync } from 'fs';
import { typeToString } from '../../../devui/Highlight';
import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { typeToplevel } from '../../elements/base';
import { parseTypeFile } from '../../grammar/base.parser';
import { idToString } from '../../ids';
import * as t from '../../typed-ast';
import { Ctx } from '../to-tast';
import { typeMatches } from '../typeMatches';

expect.extend({
    toMatchT(received, expected, ctx) {
        if (typeMatches(received, expected, ctx)) {
            return {
                message: () =>
                    `${typeToString(
                        received,
                        ctx,
                    )} should not match ${typeToString(
                        expected,
                        ctx,
                    )} ${JSON.stringify(received)}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `${typeToString(received, ctx)} should match ${typeToString(
                        expected,
                        ctx,
                    )}`,
                pass: false,
            };
        }
    },
});

interface CustomMatchers<R = unknown> {
    toMatchT(one: t.Type, ctx: Ctx): R;
}

declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        interface Matchers<R> extends CustomMatchers<R> {}
        interface InverseAsymmetricMatchers extends CustomMatchers {}
    }
}

const assertions = {
    shouldMatch(args: t.DecoratorArg[], inner: t.Type, ctx: Ctx) {
        expect(args).toHaveLength(1);
        expect(args[0].type).toBe('DType');
        const arg = args[0] as t.DType;
        expect(inner).toMatchT(arg.typ, ctx);
    },
    shouldNotMatch(args: t.DecoratorArg[], inner: t.Type, ctx: Ctx) {
        expect(args).toHaveLength(1);
        expect(args[0].type).toBe('DType');
        const arg = args[0] as t.DType;
        expect(inner).not.toMatchT(arg.typ, ctx);
        // expect(typeMatches(inner, arg.typ, ctx)).toBeFalsy();
    },
    shouldBe(args: t.DecoratorArg[], inner: t.Type, ctx: Ctx) {
        expect(args).toHaveLength(1);
        expect(args[0].type).toBe('DType');
        const arg = args[0] as t.DType;
        expect(typeMatches(inner, arg.typ, ctx)).toBeTruthy();
        expect(typeMatches(arg.typ, inner, ctx)).toBeTruthy();
    },
};

const base = __dirname + '/../../elements/typetest/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe(file, () => {
            const text = readFileSync(fixtureFile, 'utf8');
            const ast = parseTypeFile(text);
            let ctx = builtinContext.clone();
            const assertById: { [key: string]: Function } = {};
            Object.keys(assertions).forEach((key) => {
                const { id } = addBuiltinDecorator(ctx, `type:${key}`, 0);
                assertById[idToString(id)] =
                    assertions[key as keyof typeof assertions];
            });

            ast.toplevels.forEach((t) => {
                // ctx.resetSym();

                if (t.type === 'TypeAlias') {
                    // Need to reset again, so the args get the same syms
                    // when we parse them again
                    // ctx.resetSym();
                    ctx = ctx.toplevelConfig(
                        typeToplevel(t, ctx),
                    ) as FullContext;
                    let top = ctx.ToTast.TypeAlias(t, ctx);
                    ctx = ctx.withTypes(top.elements) as FullContext;
                } else {
                    let type = ctx.ToTast[t.type](t as any, ctx);
                    if (type.type === 'TDecorated') {
                        const inner = type.inner;
                        type.decorators.forEach((d) => {
                            it(
                                text.slice(
                                    d.loc.start.offset,
                                    d.loc.end.offset,
                                ) + ` ${file}:${d.loc.start.line}`,
                                () => {
                                    const hash = idToString(
                                        (d.id.ref as t.GlobalRef).id,
                                    );
                                    if (assertById[hash]) {
                                        assertById[hash](
                                            d.args.map((arg) => arg.arg),
                                            inner,
                                            ctx,
                                        );
                                    }
                                },
                            );
                        });
                    } else {
                        throw new Error('Not decorated?' + type.type);
                    }
                }
            });
        });
    });
