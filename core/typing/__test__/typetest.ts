import { HL } from '../../../devui/HL';
import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { typeToplevel } from '../../elements/base';
import { TypeFile } from '../../grammar/base.parser';
import { idToString } from '../../ids';
import * as t from '../../typed-ast';
import { assertions } from './utils';

export type TypeTest = {
    file: t.TypeFile;
    statuses: Array<HL>;
    ctx: FullContext;
};

export const runInner = () => {};

export const runTypeTest = (ast: TypeFile, debugFailures = false): TypeTest => {
    const old = window.console;
    const mock = old; // (window.console = { ...old, log() {}, warn() {}, error() {} });

    let ctx = builtinContext.clone();

    const assertById: { [key: string]: Function } = {};
    Object.keys(assertions).forEach((key) => {
        const { id } = addBuiltinDecorator(ctx, `type:${key}`, 0);
        assertById[idToString(id)] = assertions[key as keyof typeof assertions];
    });

    const statuses: HL[] = [];

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
            ctx = ctx.toplevelConfig(typeToplevel(t, ctx)) as FullContext;
            let top = ctx.ToTast.TypeAlias(t, ctx);
            tast.toplevels.push(top);
            const res = ctx.withTypes(top.elements);
            ctx = res.ctx as FullContext;
        } else {
            ctx = ctx.toplevelConfig(null) as FullContext;
            let type = ctx.ToTast.Type(t, ctx);
            tast.toplevels.push(type);
            if (type.type === 'TDecorated') {
                let failed = false;
                const inner = type.inner;

                type.decorators.forEach((d) => {
                    if (d.id.ref.type !== 'Global') {
                        return;
                    }
                    const hash = idToString((d.id.ref as t.GlobalRef).id);
                    if (assertById[hash]) {
                        const msg = assertById[hash](
                            d.args.map((arg) => arg.arg),
                            inner,
                            ctx,
                        );
                        if (msg) {
                            statuses.push({
                                loc: d.loc,
                                type: 'Error',
                                prefix: {
                                    text: '🚨',
                                    message: msg,
                                },
                            });
                        } else {
                            statuses.push({
                                loc: d.loc,
                                type: 'Success',
                                prefix: {
                                    text: '✅',
                                },
                            });
                        }
                        failed = failed || !!msg;
                    }
                });

                if (failed && debugFailures) {
                    let dctx = {
                        ...ctx,
                        debugger() {
                            debugger;
                        },
                    };

                    window.console = old;
                    console.log('Rerunning with debugging enabled');
                    dctx.ToTast.Type(t, dctx);

                    type.decorators.forEach((d) => {
                        if (d.id.ref.type !== 'Global') {
                            return;
                        }
                        const hash = idToString((d.id.ref as t.GlobalRef).id);
                        if (assertById[hash]) {
                            assertById[hash](
                                d.args.map((arg) => arg.arg),
                                inner,
                                dctx,
                            );
                        }
                    });

                    window.console = mock;
                }
            }
        }
    });
    window.console = old;
    return { statuses, file: tast, ctx };
};
