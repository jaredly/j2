import { readdirSync, readFileSync } from 'fs';
import { addBuiltinDecorator, builtinContext, FullContext } from '../../ctx';
import { typeToplevel } from '../../elements/base';
import { parseTypeFile } from '../../grammar/base.parser';
import { idToString } from '../../ids';
import * as t from '../../typed-ast';
import { assertions } from './utils';

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
                ctx.resetSym();

                if (t.type === 'TypeAlias') {
                    // Need to reset again, so the args get the same syms
                    // when we parse them again
                    ctx = ctx.toplevelConfig(
                        typeToplevel(t, ctx),
                    ) as FullContext;
                    let top = ctx.ToTast.TypeAlias(t, ctx);
                    ctx = ctx.withTypes(top.elements) as FullContext;
                } else {
                    ctx = ctx.toplevelConfig(null) as FullContext;
                    let type = ctx.ToTast.Type(t, ctx);
                    if (type.type === 'TDecorated') {
                        const inner = type.inner;
                        type.decorators.forEach((d) => {
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
                                            ctx,
                                        );
                                        expect(err).toBeUndefined();
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
