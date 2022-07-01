// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { ErrorTag, FullContext, noloc } from '../ctx';
import { transformFile } from '../transform-tast';
import {
    DecoratedExpression,
    Decorator,
    Expression,
    File,
    Loc,
    RefKind,
    TVar,
    Type,
} from '../typed-ast';
import { extract, Id, idsEqual, idToString } from '../ids';
import { Ctx as TMCtx } from './typeMatches';
import { analyzeVisitor } from './analyze.gen';
import { TopTypeKind } from './to-tast';

export type Ctx = {
    getType(expr: Expression): Type | null;
    getTypeArgs(ref: RefKind): TVar[] | null;
    getTopKind(idx: number): TopTypeKind | null;
    resolveAnalyzeType(type: Type): Type | null;
    typeByName(name: string): Type | null;
    getDecorator(name: string): RefKind[];
    errorDecorators(): Id[];
    resolve: (name: string, hash?: string | null) => Array<RefKind>;
} & TMCtx;

export type VisitorCtx = {
    ctx: Ctx;
    hit: {};
};

// export const analyzeContext = (ctx: FullContext): Ctx => {
//     return {
//         getType(expr: Expression) {
//             return getType(expr, ctx);
//         },
//         resolveAnalyzeType(type: Type) {
//             return resolveAnalyzeType(type, ctx);
//         },
//         typeByName(name: string) {
//             const ref = ctx.types.names[name];
//             return ref
//                 ? { type: 'TRef', ref: ref, loc: noloc, args: [] }
//                 : null;
//         },
//         getTypeArgs(ref) {
//             if (ref.type === 'Global') {
//                 const { idx, hash } = extract(ref.id);
//                 const t = ctx.types.hashed[hash][idx];
//                 if (t.type === 'builtin') {
//                     return t.args;
//                 } else {
//                     return null;
//                 }
//             } else {
//                 return null;
//             }
//         },
//         _full: ctx,
//     };
// };

export const tdecorate = (
    type: Type,
    tag: ErrorTag,
    hit: { [key: number]: boolean },
    ctx: Ctx,
    args: Decorator['args'] = [],
): Type => {
    if (hit[type.loc.idx]) {
        return type;
    }
    hit[type.loc.idx] = true;
    // const abc = ctx.decorators.names[`error:${tag}`];
    // if (!abc || abc.length !== 1) {
    //     throw new Error(`can't resolve that decorator`);
    // }
    const refs = ctx.getDecorator(`error:${tag}`);
    if (!refs || refs.length !== 1) {
        throw new Error(`can't resolve that decorator`);
    }
    return {
        type: 'TDecorated',
        decorators: [
            {
                type: 'Decorator',
                id: {
                    ref: refs[0],
                    loc: noloc,
                },
                args,
                loc: type.loc,
            },
        ],
        inner: type,
        loc: type.loc,
    };
};

export const decorate = (
    expr: Expression,
    tag: ErrorTag,
    hit: { [key: number]: boolean },
    ctx: Ctx,
    args: Decorator['args'] = [],
): DecoratedExpression | Expression => {
    if (hit[expr.loc.idx]) {
        return expr;
    }
    hit[expr.loc.idx] = true;
    const refs = ctx.getDecorator(`error:${tag}`);
    if (!refs || refs.length !== 1) {
        throw new Error(`can't resolve that decorator`);
    }
    return {
        type: 'DecoratedExpression',
        decorators: [
            {
                type: 'Decorator',
                id: {
                    ref: refs[0],
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
    return transformFile(ast, analyzeVisitor(), { ctx, hit: {} });
};

export type Verify = {
    errors: Loc[];
    untypedExpression: Loc[];
    unresolved: {
        type: Loc[];
        decorator: Loc[];
        value: Loc[];
    };
};

export const errorCount = (v: Verify): number => {
    return (
        v.errors.length +
        v.untypedExpression.length +
        v.unresolved.type.length +
        v.unresolved.decorator.length +
        v.unresolved.value.length
    );
};

export const verify = (ast: File, ctx: Ctx): Verify => {
    const results: Verify = {
        errors: [],
        untypedExpression: [],
        unresolved: {
            type: [],
            decorator: [],
            value: [],
        },
    };

    const errorDecorators = ctx.errorDecorators();
    // const decoratorNames: { [key: string]: string } = {};
    // Object.keys(ctx._full.decorators.names).forEach((name) => {
    //     const ids = ctx._full.decorators.names[name];
    //     ids.forEach((id) => {
    //         decoratorNames[idToString(id.id)] = name;
    //     });
    // });

    transformFile(
        ast,
        {
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
            Expression(node) {
                if (!ctx.getType(node)) {
                    results.untypedExpression.push(node.loc);
                }
                return null;
            },
            Decorator(node) {
                if (node.id.ref.type === 'Unresolved') {
                    results.unresolved.decorator.push(node.loc);
                }
                if (node.id.ref.type === 'Global') {
                    const id = node.id.ref.id;
                    const isError = errorDecorators.some((x) =>
                        idsEqual(x, id),
                    );
                    if (isError) {
                        results.errors.push(node.loc);
                    }
                }
                return null;
            },
        },
        null,
    );
    return results;
};
