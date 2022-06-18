// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { FullContext, noloc } from '../ctx';
import { transformFile } from '../transform-tast';
import {
    Apply,
    DecoratedExpression,
    Expression,
    File,
    Loc,
    Type,
} from '../typed-ast';
import { getType } from './getType';
import { typeMatches } from './typesEqual';

export type Ctx = {
    getType(expr: Expression): Type | null;
    _full: FullContext;
};

export const analyzeContext = (ctx: FullContext): Ctx => {
    return {
        getType(expr: Expression) {
            return getType(expr, ctx);
        },
        _full: ctx,
    };
};

export const decorate = (
    expr: Expression,
    msg: string,
): DecoratedExpression => {
    return {
        type: 'DecoratedExpression',
        decorators: [
            {
                type: 'Decorator',
                id: {
                    ref: { type: 'Unresolved', text: 'error', hash: null },
                    loc: noloc,
                },
                args: [
                    {
                        label: 'msg',
                        arg: {
                            type: 'Expr',
                            expr: {
                                type: 'TemplateString',
                                loc: noloc,
                                first: msg,
                                rest: [],
                            },
                            loc: noloc,
                        },
                        loc: noloc,
                    },
                ],
                loc: noloc,
            },
        ],
        expr,
        loc: expr.loc,
    };
};

export const analyze = (ast: File, ctx: Ctx): File => {
    return transformFile(
        ast,
        {
            ExpressionPost(node, _) {
                // huh how do I know that it's already been ... decorated?
                if (node.type === 'Apply') {
                    if (
                        node.target.type === 'Ref' &&
                        node.target.kind.type === 'Unresolved'
                    ) {
                        // Check if there are multiples
                    }
                    // Otherwise, try to get the type of the target & compare to the args
                    const ttype = ctx.getType(node.target);
                    if (!ttype) {
                        // Something deeper has an error.
                        // Huh I should probably do a transformFile checking that all expressions
                        // have types before signing off.
                        return null;
                    }
                    if (ttype?.type !== 'TLambda') {
                        return decorate(node, 'Not a function');
                    }
                    const argTypes = node.args.map((arg) => ctx.getType(arg));
                    if (ttype.args.length !== argTypes.length) {
                        return decorate(node, 'Wrong number of arguments');
                    }
                    let changed = false;
                    const args = node.args.map((arg, i) => {
                        const at = ctx.getType(arg);
                        if (at == null) {
                            return arg;
                        }
                        if (!typeMatches(at, ttype.args[i].typ, ctx._full)) {
                            changed = true;
                            return decorate(arg, 'Wrong type');
                        }
                        return arg;
                    });
                    // iffff target is resolved, we check the args
                    // if it's not resolved, then
                    return changed ? { ...node, args } : null;
                }
                return null;
            },
        },
        null,
    );
};

export const verify = (
    ast: File,
    ctx: Ctx,
): { missingTypes: Loc[]; errorDecorators: Loc[] } => {
    let missingTypes: Array<Loc> = [];
    let errorDecorators: Array<Loc> = [];
    transformFile(
        ast,
        {
            Expression(node) {
                if (!ctx.getType(node)) {
                    missingTypes.push(node.loc);
                }
                return node;
            },
            DecoratedExpression(node, _) {
                node.decorators.forEach((dec) => {
                    // TODO: Check for my error decorators. I should keep a list of them somewhere.
                    // if (dec.id)
                    errorDecorators.push(dec.loc);
                });
                return node;
            },
        },
        null,
    );
    return { missingTypes, errorDecorators };
};
