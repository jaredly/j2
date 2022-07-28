import { readdirSync, readFileSync } from 'fs';
import { addBuiltinDecorator, builtinContext } from '../../ctx';
import { processTypeFile } from '../../full/full';
import { idToString } from '../../ids';
import * as t from '../../typed-ast';
import { initVerify } from '../analyze';
import { assertions } from './utils';

const base = __dirname + '/../../elements/typetest/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        const baseCtx = builtinContext.clone();
        const assertById: { [key: string]: Function } = {};
        Object.keys(assertions).forEach((key) => {
            const { id } = addBuiltinDecorator(baseCtx, `type:${key}`, 0);
            assertById[idToString(id)] =
                assertions[key as keyof typeof assertions];
        });

        describe(file, () => {
            const raw = readFileSync(fixtureFile, 'utf8');

            const result = processTypeFile(raw, baseCtx);
            it('should parse', () => {
                if (result.type === 'Error') {
                    expect(result).toBe(null);
                }
            });

            if (result.type === 'Success') {
                const { info, ctx } = result;
                const empty = initVerify();
                info.forEach((info) => {
                    const top = info.contents.orig;
                    const type = info.contents.top;
                    if (
                        type.type !== 'TypeAlias' &&
                        type.type !== 'TDecorated'
                    ) {
                        return;
                    }
                    const text = `./core/elements/typetest/${file}:${top.loc.start.line}`;
                    describe(text, () => {
                        // if (type.type === 'TypeAlias') {
                        it('should be valid', () => {
                            expect(info.verify).toEqual(empty);
                        });
                        // }
                        if (type.type === 'TDecorated') {
                            const inner = type.inner;
                            type.decorators.forEach((d) => {
                                if (d.id.ref.type !== 'Global') {
                                    it('should have a global ref', () => {
                                        expect(d.id.ref).toBe(null);
                                    });
                                    return;
                                }
                                it(
                                    raw.slice(
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
                        }
                    });
                });
            }
        });
    });
