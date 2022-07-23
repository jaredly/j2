import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { typeToplevel } from '../../elements/base';
import { readdirSync, readFileSync } from 'fs';
import { File, parseTypeFile, TypeFile } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { idToString } from '../../ids';
import * as t from '../../typed-ast';
import { assertions } from './utils';

export type TypeTest = {
    file: t.TypeFile;
    statuses: Array<{ loc: t.Loc; text: string | null }>;
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
            ctx = ctx.toplevelConfig(typeToplevel(t, ctx)) as FullContext;
            let top = ctx.ToTast.TypeAlias(t, ctx);
            tast.toplevels.push(top);
            ctx = ctx.withTypes(top.elements) as FullContext;
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
                        statuses.push({ loc: d.loc, text: msg });
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
