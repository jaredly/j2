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
    Type,
} from '../typed-ast';
import { applyType, getType } from './getType';
import { analyze as analyzeApply } from '../elements/apply';
import { analyze as analyzeConstants } from '../elements/constants';
import { analyze as analyzeGenerics } from '../elements/generics';
import { extract, idToString } from '../ids';

export type Ctx = {
    getType(expr: Expression): Type | null;
    resolveType(type: Type): Type | null;
    typeByName(name: string): Type | null;
    _full: FullContext;
};

export type VisitorCtx = {
    ctx: Ctx;
    hit: {};
};

// ugh ok so because
// i've tied application to TRef, it makes things
// less flexible. Can't do Some<X><Y> even though you can
// do let Some = <X><Y>int;
// OK BACKUP.
export const resolveType = (type: Type, ctx: FullContext): Type | null => {
    if (type.type === 'TDecorated') {
        return resolveType(type.inner, ctx);
    }
    if (type.type === 'TRef') {
        if (type.ref.type === 'Global') {
            const { idx, hash } = extract(type.ref.id);
            if (!ctx.types.hashed[hash]) {
                // console.log('bad hash');
                return null;
            }
            const t = ctx.types.hashed[hash][idx];
            if (!t) {
                // console.log('bad idx');
                return null;
            }
            if (t.type === 'user') {
                // console.log('user ref, go deeper');
                return resolveType(t.typ, ctx);
            } else {
                if (t.args.length) {
                    return {
                        type: 'TVars',
                        args: t.args,
                        inner: type,
                        loc: noloc,
                    };
                }
            }
        }
    }
    if (type.type === 'TApply') {
        const target = resolveType(type.target, ctx);
        if (!target || target.type !== 'TVars') {
            // console.log('bad apply');
            return null;
        }
        const applied = applyType(type.args, target, ctx);
        return applied ? resolveType(applied, ctx) : null;
    }
    return type;
};

export const analyzeContext = (ctx: FullContext): Ctx => {
    return {
        getType(expr: Expression) {
            return getType(expr, ctx);
        },
        resolveType(type: Type) {
            return resolveType(type, ctx);
        },
        typeByName(name: string) {
            const ref = ctx.types.names[name];
            return ref
                ? { type: 'TRef', ref: ref, loc: noloc, args: [] }
                : null;
        },
        _full: ctx,
    };
};

export const tdecorate = (
    type: Type,
    tag: ErrorTag,
    hit: { [key: number]: boolean },
    ctx: FullContext,
    args: Decorator['args'] = [],
): Type => {
    if (hit[type.loc.idx]) {
        return type;
    }
    hit[type.loc.idx] = true;
    const abc = ctx.decorators.names[`error:${tag}`];
    if (!abc || abc.length !== 1) {
        throw new Error(`can't resolve that decorator`);
    }
    return {
        type: 'TDecorated',
        decorators: [
            {
                type: 'Decorator',
                id: {
                    ref: abc[0],
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
            ...analyzeGenerics,
        },
        { ctx, hit: {} },
    );
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

    const decoratorNames: { [key: string]: string } = {};
    Object.keys(ctx._full.decorators.names).forEach((name) => {
        const ids = ctx._full.decorators.names[name];
        ids.forEach((id) => {
            decoratorNames[idToString(id.id)] = name;
        });
    });

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
                    const name = decoratorNames[idToString(node.id.ref.id)];
                    if (name && name.startsWith('error:')) {
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
