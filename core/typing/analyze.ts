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
import { analyze as analyzeApply } from '../elements/apply';

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
    msg: string,
    hit: { [key: number]: boolean },
): DecoratedExpression | Expression => {
    if (hit[expr.loc.idx]) {
        return expr;
    }
    hit[expr.loc.idx] = true;
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
                            type: 'DExpr',
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
            ...analyzeApply,
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
