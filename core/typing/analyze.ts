// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { ErrorTag, FullContext, noloc } from '../ctx';
import { transformFile } from '../transform-tast';
import {
    Apply,
    DecoratedExpression,
    Decorator,
    Expression,
    File,
    Loc,
    Type,
} from '../typed-ast';
import { getType } from './getType';
import { typeMatches } from './typesEqual';
import { analyze as analyzeApply } from '../elements/apply';
import { analyze as analyzeConstants } from '../elements/constants';

export type Ctx = {
    getType(expr: Expression): Type | null;
    typeByName(name: string): Type | null;
    _full: FullContext;
};

export type VisitorCtx = {
    ctx: Ctx;
    hit: {};
};

export const analyzeContext = (ctx: FullContext): Ctx => {
    return {
        getType(expr: Expression) {
            return getType(expr, ctx);
        },
        typeByName(name: string) {
            const ref = ctx.types.names[name];
            return ref ? { type: 'TRef', ref: ref, loc: noloc } : null;
        },
        _full: ctx,
    };
};

export const decorate = (
    expr: Expression,
    tag: ErrorTag,
    hit: { [key: number]: boolean },
    ctx: FullContext,
    args: Decorator['args'] = [],
): DecoratedExpression | Expression => {
    if (hit[expr.loc.idx]) {
        return expr;
    }
    hit[expr.loc.idx] = true;
    const abc = ctx.decorators.names[`error:${tag}`];
    if (!abc || abc.length !== 1) {
        throw new Error(`can't resolve that decorator`);
    }
    return {
        type: 'DecoratedExpression',
        decorators: [
            {
                type: 'Decorator',
                id: {
                    ref: abc[0],
                    loc: noloc,
                },
                args,
                loc: expr.loc,
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
            ...analyzeApply,
            ...analyzeConstants,
        },
        { ctx, hit: {} },
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
