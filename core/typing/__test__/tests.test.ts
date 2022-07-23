import generate from '@babel/generator';
import { readdirSync, readFileSync } from 'fs';
import {
    addBuiltinDecorator,
    builtinContext,
    FullContext,
    refsEqual,
} from '../../ctx';
import { removeErrorDecorators, typeToplevel } from '../../elements/base';
import { parseFile, parseTypeFile } from '../../grammar/base.parser';
import { idsEqual, idToString } from '../../ids';
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
            const eq = ctx.getBuiltinRef('==');
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

                    const ictx = iCtx();
                    const ir = ictx.ToIR.BlockSt(
                        {
                            type: 'Block',
                            stmts: [expr],
                            loc: expr.loc,
                        },
                        ictx,
                    );
                    const jctx = jCtx(ctx);
                    const js = jctx.ToJS.Block(ir, jctx);
                    const jsraw = generate(js).code;

                    if (expr.type === 'DecoratedExpression') {
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
                                    let res;
                                    try {
                                        const f = new Function('$terms', jsraw);
                                        res = f(ectx.terms);
                                    } catch (err) {
                                        throw new Error(jsraw, {
                                            cause: err as Error,
                                        });
                                    }

                                    const hash = idToString(
                                        (d.id.ref as t.GlobalRef).id,
                                    );
                                    if (assertById[hash]) {
                                        const err = assertById[hash](
                                            d.args.map((arg) => arg.arg),
                                            res,
                                            ectx,
                                        );
                                        expect(err).toBeUndefined();
                                    }
                                },
                            );
                        });
                        // } else if (
                        //     expr.type === 'Apply' &&
                        //     expr.target.type === 'Ref' &&
                        //     refsEqual(expr.target.kind, eq!)
                        // ) {
                        //     const expected = expr.args[0];
                        //     const actual = expr.args[1];
                    } else if (ctx.isBuiltinType(ctx.getType(expr)!, 'bool')) {
                        let res;
                        try {
                            const f = new Function('$terms', jsraw);
                            res = f(ectx.terms);
                        } catch (err) {
                            throw new Error(jsraw, {
                                cause: err as Error,
                            });
                        }
                        expect(res).toBe(true);
                    } else {
                        throw new Error('Not decorated?' + expr.type);
                    }
                }
            });
        });
    });
