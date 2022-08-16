import { FullContext } from '../ctx';
import { typeToplevelT } from '../elements/base';
import { idsEqual, idToString } from '../ids';
import { transformFile, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { refsEqual } from '../refsEqual';
import { locWithin } from './__test__/verifyHL';
import { localTrackingVisitor } from './localTrackingVisitor';
import { Ctx, Verify, VError } from './analyze';

type VCtx = Ctx & { switchType?: t.Type };
export const verifyVisitor = (results: Verify, _ctx: VCtx): Visitor<VCtx> => {
    const errorDecorators = _ctx.errorDecorators();
    const expectDecorator = _ctx.getDecorator('expect')![0];
    return {
        ...(localTrackingVisitor as any as Visitor<VCtx>),
        Toplevel(node, ctx) {
            return [
                null,
                ctx.toplevelConfig(typeToplevelT(node, ctx)) as FullContext,
            ];
        },
        TVbl(node, ctx) {
            results.errors.push({ type: 'TVbl', loc: node.loc });
            return null;
        },
        TBlank(node) {
            results.errors.push({ type: 'Blank', loc: node.loc });
            return null;
        },
        TRef(node) {
            if (node.ref.type === 'Unresolved') {
                results.unresolved.type.push(node.loc);
            }
            return null;
        },
        Ref(node) {
            if (node.kind.type === 'Unresolved') {
                results.unresolved.value.push(node.loc);
            }
            return null;
        },
        Expression(node, ctx) {
            if (!ctx.getType(node)) {
                results.untypedExpression.push(node.loc);
            }
            return null;
        },
        TDecorated({ loc, decorators }, ctx) {
            decorators.forEach((node) => {
                if (refsEqual(expectDecorator, node.id.ref)) {
                    const text = textArg(node.args);
                    // results.expected.push({ loc, text, errors: [] });
                    const ex: Verify['expected'][0] = { loc, text, errors: [] };
                    results.expected.push(ex);
                    results.errors = results.errors.filter((err) =>
                        err.type !== 'Dec' ||
                        err.name !== text ||
                        !locWithin(err.loc, loc)
                            ? true
                            : (ex.errors.push(err), false),
                    );
                    return null;
                }
            });
            return null;
        },
        DecoratedExpression({ loc, decorators }, ctx) {
            decorators.forEach((node) => {
                if (refsEqual(expectDecorator, node.id.ref)) {
                    const text = textArg(node.args);
                    const ex: Verify['expected'][0] = { loc, text, errors: [] };
                    results.expected.push(ex);
                    results.errors = results.errors.filter((err) =>
                        err.type !== 'Dec' ||
                        err.name !== text ||
                        !locWithin(err.loc, loc)
                            ? true
                            : (ex.errors.push(err), false),
                    );
                    return null;
                }
            });
            return null;
        },
        Decorator(node) {
            if (node.id.ref.type === 'Unresolved') {
                results.unresolved.decorator.push(node.loc);
            }
            if (node.id.ref.type === 'Global') {
                const id = node.id.ref.id;
                const errorName = errorDecorators[idToString(id)];
                if (errorName) {
                    const err: VError = {
                        type: 'Dec',
                        dec: node,
                        loc: node.loc,
                        name: errorName,
                    };
                    const found = results.expected.find(
                        (x) =>
                            x.text === errorName && locWithin(x.loc, node.loc),
                    );
                    if (found) {
                        found.errors.push(err);
                    } else {
                        results.errors.push(err);
                    }
                }
            }
            return null;
        },
    };
};

export const textArg = (args: t.Decorator['args']) => {
    return args.length === 1 &&
        args[0].arg.type === 'DExpr' &&
        args[0].arg.expr.type === 'TemplateString' &&
        args[0].arg.expr.rest.length === 0
        ? args[0].arg.expr.first
        : null;
};

export const initVerify = (): Verify => ({
    errors: [],
    expected: [],
    untypedExpression: [],
    unresolved: {
        type: [],
        decorator: [],
        value: [],
    },
});

export const verify = (ast: t.File, ctx: Ctx): Verify => {
    const results: Verify = initVerify();

    transformFile(ast, verifyVisitor(results, ctx), ctx);
    return results;
};
