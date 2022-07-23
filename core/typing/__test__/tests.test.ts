import generate from '@babel/generator';
import { readdirSync, readFileSync } from 'fs';
import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { removeErrorDecorators, typeToplevel } from '../../elements/base';
import { parseFile, parseTypeFile } from '../../grammar/base.parser';
import { idToString } from '../../ids';
import { iCtx } from '../../ir/ir';
import { ExecutionContext, jCtx, newExecutionContext } from '../../ir/to-js';
import { transformToplevel } from '../../transform-tast';
import * as t from '../../typed-ast';
import { analyzeTop, errorCount, initVerify, verifyVisitor } from '../analyze';
import { assertions, valueAssertions } from './utils';
// import { Ctx as JCtx } from '../../ir/to-js';
// import { Ctx as iCtx } from '../../ir/ir';

const base = __dirname + '/../../elements/test/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe(file, () => {
            const text = readFileSync(fixtureFile, 'utf8');
            const ast = parseFile(text);
            let ctx = builtinContext.clone();
            const assertById: {
                [key: string]: (
                    args: t.DecoratorArg[],
                    expr: t.Expression,
                    ctx: ExecutionContext,
                ) => string | undefined;
            } = {};
            Object.keys(valueAssertions).forEach((key) => {
                const { id } = addBuiltinDecorator(ctx, `assert:${key}`, 0);
                assertById[idToString(id)] =
                    valueAssertions[key as keyof typeof valueAssertions];
            });

            const ectx = newExecutionContext(ctx);

            ast.toplevels.forEach((t) => {
                ctx.resetSym();

                if (t.type === 'TypeAlias') {
                    // Need to reset again, so the args get the same syms
                    // when we parse them again
                    ctx = ctx.toplevelConfig(
                        typeToplevel(t, ctx),
                    ) as FullContext;
                    let top = ctx.ToTast.TypeAlias(t, ctx);
                    top = transformToplevel(
                        top,
                        removeErrorDecorators(ctx),
                        null,
                    ) as t.TypeAlias;
                    top = analyzeTop(top, ctx) as t.TypeAlias;
                    ctx = ctx.withTypes(top.elements) as FullContext;

                    it(
                        text.slice(t.loc.start.offset, t.loc.end.offset) +
                            ` ${file}:${t.loc.start.line} - should be valid`,
                        () => {
                            const v = initVerify();
                            transformToplevel(top, verifyVisitor(v, ctx), ctx);
                            expect(v).toEqual(initVerify());
                        },
                    );
                } else {
                    ctx = ctx.toplevelConfig(null) as FullContext;
                    let top = ctx.ToTast.Toplevel(
                        t,
                        ctx,
                    ) as t.ToplevelExpression;
                    top = analyzeTop(top, ctx) as t.ToplevelExpression;
                    let expr = top.expr;

                    it(
                        text.slice(t.loc.start.offset, t.loc.end.offset) +
                            ` ${file}:${t.loc.start.line} - should be valid`,
                        () => {
                            const v = initVerify();
                            transformToplevel(top, verifyVisitor(v, ctx), ctx);
                            expect(v).toEqual(initVerify());
                        },
                    );

                    if (expr.type === 'DecoratedExpression') {
                        const inner = expr.expr;
                        expr.decorators.forEach((d) => {
                            if (d.id.ref.type !== 'Global') {
                                return;
                            }
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
                                        const err = assertById[hash](
                                            d.args.map((arg) => arg.arg),
                                            inner,
                                            ectx,
                                        );
                                        expect(err).toBeUndefined();
                                    }
                                },
                            );
                        });
                    } else {
                        throw new Error('Not decorated?' + expr.type);
                    }
                }
            });
        });
    });
