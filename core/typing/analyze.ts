// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { ErrorTag, FullContext, GlobalType, GlobalValue, noloc } from '../ctx';
import {
    transformFile,
    transformToplevel,
    transformType,
    transformTypeAlias,
    Visitor,
} from '../transform-tast';
import * as t from '../typed-ast';
import { extract, Id, idsEqual, idToString } from '../ids';
import { Ctx as TMCtx } from './typeMatches';
import { analyzeVisitor } from './analyze.gen';
import { TopTypeKind } from './to-tast';
import { getLocals, Pattern } from '../elements/pattern';

export type Ctx = {
    getType(expr: t.Expression): t.Type | null;
    getTypeArgs(ref: t.RefKind): t.TVar[] | null;
    getTopKind(idx: number): TopTypeKind | null;
    resolveAnalyzeType(type: t.Type): t.Type | null;
    typeByName(name: string): t.Type | null;
    getDecorator(name: string): t.RefKind[];
    errorDecorators(): Id[];
    currentConstraints: (id: number) => t.Type;
    addTypeConstraint: (typ: t.TVbl, constraint: t.Type) => void;

    typeForId: (id: Id) => GlobalType | null;
    valueForId: (id: Id) => GlobalValue | null;
    resolveType: (name: string, hash?: string | null) => t.RefKind | null;
    resolveDecorator: (name: string, hash?: string | null) => Array<t.RefKind>;

    // decoratorNames(): { [key: string]: string };
    resolve: (name: string, hash?: string | null) => Array<t.RefKind>;
    // This should only be in the analyze, not in to-tast
    resolveRecur(idx: number): Id | null;
} & TMCtx;

export type VisitorCtx = {
    ctx: Ctx;
    hit: {};
};

export const addDecorator = (
    loc: t.Loc,
    decorators: t.Decorator[],
    tag: ErrorTag,
    ctx: { hit: { [key: number]: boolean }; ctx: Ctx },
    args: t.Decorator['args'] = [],
) => {
    if (ctx.hit[loc.idx]) {
        return decorators;
    }
    ctx.hit[loc.idx] = true;
    const refs = ctx.ctx.getDecorator(`error:${tag}`);
    if (!refs || refs.length !== 1) {
        throw new Error(`Can't resolve ${tag}`);
    }
    return decorators.concat([
        {
            type: 'Decorator',
            id: { ref: refs[0], loc: noloc },
            args,
            loc,
        },
    ]);
};

export const tdecorate = (
    type: t.Type,
    tag: ErrorTag,
    { hit, ctx }: { hit: { [key: number]: boolean }; ctx: Ctx },
    args: t.Decorator['args'] = [],
): t.Type => {
    if (hit[type.loc.idx]) {
        console.log('skip it folks');
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
    expr: t.Expression,
    tag: ErrorTag,
    hit: { [key: number]: boolean },
    ctx: Ctx,
    args: t.Decorator['args'] = [],
): t.DecoratedExpression | t.Expression => {
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

export const analyzeTypeTop = (
    ast: t.TypeAlias | t.Type,
    ctx: Ctx,
): t.TypeAlias | t.Type => {
    if (ast.type === 'TypeAlias') {
        return transformTypeAlias(ast, analyzeVisitor(), { ctx, hit: {} });
    } else {
        return transformType(ast, analyzeVisitor(), { ctx, hit: {} });
    }
};

export const analyzeTop = (ast: t.Toplevel, ctx: Ctx): t.Toplevel => {
    const top = transformToplevel(ast, analyzeVisitor(), { ctx, hit: {} });
    return transformToplevel(
        ast,
        {
            Type_TVbl(node) {
                console.log('Node ok');
                return ctx.currentConstraints(node.id);
            },
        },
        null,
    );
};

// export const analyze = (ast: File, ctx: Ctx): File => {
//     return transformFile(ast, analyzeVisitor(), { ctx, hit: {} });
// };

export type Verify = {
    errors: t.Loc[];
    untypedExpression: t.Loc[];
    unresolved: {
        type: t.Loc[];
        decorator: t.Loc[];
        value: t.Loc[];
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

export const verifyVisitor = (results: Verify, _ctx: Ctx): Visitor<Ctx> => {
    const errorDecorators = _ctx.errorDecorators();
    return {
        Toplevel(node) {
            // ctx.toplevelConfig?
            // ctx.resetSym()
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
        Lambda(node, ctx) {
            const locals: t.Locals = [];

            node.args.forEach((arg) =>
                getLocals(arg.pat, arg.typ, locals, ctx),
            );
            return [null, ctx.withLocals(locals) as Ctx];
        },
        Expression(node, ctx) {
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
                const isError = errorDecorators.some((x) => idsEqual(x, id));
                if (isError) {
                    results.errors.push(node.loc);
                }
            }
            return null;
        },
    };
};

export const initVerify = () => ({
    errors: [],
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
