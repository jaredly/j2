import generate from '@babel/generator';
import equal from 'fast-deep-equal';
import { readdirSync, readFileSync } from 'fs';
import {
    addBuiltinDecorator,
    builtinContext,
    FullContext,
    refsEqual,
} from '../../ctx';
import { removeErrorDecorators, typeToplevel } from '../../elements/base';
import { parseFile, parseTypeFile, File } from '../../grammar/base.parser';
import { idsEqual, idToString, toId } from '../../ids';
import { iCtx } from '../../ir/ir';
import { ExecutionContext, jCtx, newExecutionContext } from '../../ir/to-js';
import { transformToplevel } from '../../transform-tast';
import * as t from '../../typed-ast';
import { analyzeTop, errorCount, initVerify, verifyVisitor } from '../analyze';
import { assertions, valueAssertions } from './utils';

export type Test = {
    file: t.File;
    statuses: Array<{ loc: t.Loc; text: string | null }>;
    ctx: FullContext;
};

export const runTest = (
    ast: File,
    ctx: FullContext,
    debugFailures = false,
): Test => {
    const old = window.console;
    const mock = old; // (window.console = { ...old, log() {}, warn() {}, error() {} });

    const statuses: { loc: t.Loc; text: string | null }[] = [];

    const tast: t.File = {
        type: 'File',
        loc: ast.loc,
        toplevels: [],
        comments: ast.comments,
    };

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

    const jctx = jCtx(ctx);
    const ectx = newExecutionContext(ctx);

    ast.toplevels.forEach((t) => {
        ctx.resetSym();

        if (t.type === 'TypeAlias') {
            // Need to reset again, so the args get the same syms
            // when we parse them again
            ctx = ctx.toplevelConfig(typeToplevel(t, ctx)) as FullContext;
            let top = ctx.ToTast.TypeAlias(t, ctx);
            top = transformToplevel(
                top,
                removeErrorDecorators(ctx),
                null,
            ) as t.TypeAlias;
            top = analyzeTop(top, ctx) as t.TypeAlias;
            const res = ctx.withTypes(top.elements);
            ctx = res.ctx as FullContext;

            // it(
            //     text.slice(t.loc.start.offset, t.loc.end.offset) +
            //         ` ${file}:${t.loc.start.line} - should be valid`,
            //     () => {
            const v = initVerify();
            transformToplevel(top, verifyVisitor(v, ctx), ctx);
            if (!equal(v, initVerify())) {
                statuses.push({
                    loc: t.loc,
                    text: `${errorCount(v)} errors in toplevel`,
                });
            }
            tast.toplevels.push(top);
            // expect(v).toEqual(initVerify());
            //     },
            // );
        } else if (t.type === 'ToplevelLet') {
            ctx = ctx.toplevelConfig(typeToplevel(t, ctx)) as FullContext;
            ctx.resetSym();
            let top = ctx.ToTast.ToplevelLet(t, ctx);
            top = transformToplevel(
                top,
                removeErrorDecorators(ctx),
                null,
            ) as t.ToplevelLet;
            top = analyzeTop(top, ctx) as t.ToplevelLet;
            tast.toplevels.push(top);

            const { hash, ctx: nctx } = ctx.withValues(top.elements);
            jctx.actx = ctx = nctx as FullContext;

            const ictx = iCtx(ctx);

            const raws = top.elements.map((el) => {
                const ir = ictx.ToIR.BlockSt(
                    {
                        type: 'Block',
                        stmts: [el.expr],
                        loc: el.expr.loc,
                    },
                    ictx,
                );
                const js = jctx.ToJS.Block(ir, jctx);
                return generate(js).code;
            });

            try {
                const v = initVerify();
                transformToplevel(top, verifyVisitor(v, ctx), ctx);
                if (!equal(v, initVerify())) {
                    statuses.push({
                        loc: t.loc,
                        text: `${errorCount(v)} errors in toplevel`,
                    });
                }

                raws.forEach((raw, i) => {
                    const name = jctx.globalName(toId(hash, i));
                    let res;
                    try {
                        const f = new Function('$terms', raw);
                        res = f(ectx.terms);
                    } catch (err) {
                        throw new Error(raw, {
                            cause: err as Error,
                        });
                    }
                    ectx.terms[name] = res;
                });
            } catch (err) {
                statuses.push({
                    loc: t.loc,
                    text: `Error ${(err as Error).message}`,
                });
            }
        } else if (t.type === 'Aliases') {
            // um
            const aliases: { [key: string]: string } = {};
            t.items.forEach(({ name, hash }) => {
                aliases[name] = hash;
            });
            ctx = ctx.withAliases(aliases) as FullContext;
        } else {
            ctx = ctx.toplevelConfig(null) as FullContext;
            let top = ctx.ToTast.Toplevel(t, ctx) as t.ToplevelExpression;
            top = analyzeTop(top, ctx) as t.ToplevelExpression;
            tast.toplevels.push(top);
            let expr = top.expr;

            // it(
            //     text.slice(t.loc.start.offset, t.loc.end.offset) +
            //         ` ${file}:${t.loc.start.line} - should be valid`,
            //     () => {
            const v = initVerify();
            transformToplevel(top, verifyVisitor(v, ctx), ctx);
            // expect(v).toEqual(initVerify());
            if (!equal(v, initVerify())) {
                statuses.push({
                    loc: t.loc,
                    text: `${errorCount(v)} errors in toplevel`,
                });
            }
            //     },
            // );

            const ictx = iCtx(ctx);
            const ir = ictx.ToIR.BlockSt(
                {
                    type: 'Block',
                    stmts: [expr],
                    loc: expr.loc,
                },
                ictx,
            );
            // const jctx = jCtx(ctx);
            jctx.actx = ctx;
            const js = jctx.ToJS.Block(ir, jctx);
            const jsraw = generate(js).code;

            if (expr.type === 'DecoratedExpression') {
                expr.decorators.forEach((d) => {
                    if (d.id.ref.type !== 'Global') {
                        return;
                    }
                    // it(
                    //     text.slice(
                    //         d.loc.start.offset,
                    //         d.loc.end.offset,
                    //     ) + ` ${file}:${d.loc.start.line}`,
                    //     () => {
                    try {
                        let res;
                        try {
                            const f = new Function('$terms', jsraw);
                            res = f(ectx.terms);
                        } catch (err) {
                            throw new Error(jsraw, {
                                cause: err as Error,
                            });
                        }

                        const hash = idToString((d.id.ref as t.GlobalRef).id);
                        if (assertById[hash]) {
                            const err = assertById[hash](
                                d.args.map((arg) => arg.arg),
                                res,
                                ectx,
                            );
                            // expect(err).toBeUndefined();
                            statuses.push({
                                loc: { ...d.loc, end: d.loc.start },
                                text: err ?? null,
                            });
                        }
                    } catch (err) {
                        statuses.push({
                            loc: d.loc,
                            text: `Error ${(err as Error).message}`,
                        });
                    }
                    //     },
                    // );
                });
                // } else if (
                //     expr.type === 'Apply' &&
                //     expr.target.type === 'Ref' &&
                //     refsEqual(expr.target.kind, eq!)
                // ) {
                //     const expected = expr.args[0];
                //     const actual = expr.args[1];
            } else {
                const t = ctx.getType(expr);
                if (t && ctx.isBuiltinType(t, 'bool')) {
                    try {
                        let res;
                        try {
                            const f = new Function('$terms', jsraw);
                            res = f(ectx.terms);
                        } catch (err) {
                            throw new Error(jsraw, {
                                cause: err as Error,
                            });
                        }
                        statuses.push({
                            loc: { ...expr.loc, end: expr.loc.start },
                            text: res ? null : `false`,
                        });
                    } catch (err) {
                        statuses.push({
                            loc: { ...expr.loc, end: expr.loc.start },
                            text: `Error ${(err as Error).message}`,
                        });
                    }
                }
            }
        }
    });

    window.console = old;
    return { statuses, file: tast, ctx };
};
