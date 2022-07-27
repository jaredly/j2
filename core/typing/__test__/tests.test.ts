import { readdirSync, readFileSync } from 'fs';
import { processFile } from '../../full/full';
import { ExecutionContext, newExecutionContext } from '../../ir/to-js';
import { initVerify } from '../analyze';

// @ts-ignore
global.window = global;

const base = __dirname + '/../../elements/test/';
readdirSync(base)
    .filter((x) => x.endsWith('.jd'))
    .forEach((file) => {
        const fixtureFile = base + file;

        describe(file, () => {
            const raw = readFileSync(fixtureFile, 'utf8');
            const processed = processFile(raw);

            it('should parse', () => {
                if (processed.type === 'Error') {
                    expect(processed.err).toBeUndefined();
                }
            });

            if (processed.type === 'Success') {
                const { info, ast, ctx } = processed;
                let ectx: ExecutionContext;
                beforeAll(() => {
                    ectx = newExecutionContext(ctx);
                });
                const empty = initVerify();
                info.forEach((info, i) => {
                    const top = ast.toplevels[i];
                    const text =
                        raw.slice(top.loc.start.offset, top.loc.end.offset) +
                        ` ./core/elements/test/${file}:${top.loc.start.line}`;
                    describe(text, () => {
                        it(`should be valid`, () => {
                            expect(info.verify).toEqual(empty);
                        });
                        if (top.type === 'ToplevelLet') {
                            it(`should execute`, () => {
                                top.items.forEach((item, i) => {
                                    const { js, name } =
                                        info.contents.irtops![i];
                                    ectx.executeJs(js, name);
                                });
                            });
                        } else if (
                            info.contents.top.type === 'ToplevelExpression'
                        ) {
                            it(`should work`, () => {
                                const { js, name, type } =
                                    info.contents.irtops![0];
                                const res = ectx.executeJs(js, name);
                                if (ctx.isBuiltinType(type!, 'bool')) {
                                    expect(res).toEqual(true);
                                }
                            });
                        }
                    });
                });
            }
        });
    });
