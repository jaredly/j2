// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { FullContext, GlobalType, GlobalValue, noloc } from '../ctx';
import { typeToplevelT } from '../elements/base';
import { getLocals, typeForPattern } from '../elements/pattern';
import { ErrorTag } from '../errors';
import { Id, idsEqual } from '../ids';
import {
    transformFile,
    transformToplevel,
    transformTypeToplevel,
    Visitor,
} from '../transform-tast';
import * as t from '../typed-ast';
import { analyzeVisitor } from './analyze.gen';
import { ToplevelConfig, TopTypeKind } from './to-tast';
import { Ctx as TMCtx } from './typeMatches';

export type Ctx = {
    getTypeArgs(ref: t.RefKind): t.TVar[] | null;
    getTopKind(idx: number): TopTypeKind | null;
    resolveAnalyzeType(type: t.Type): t.Type | null;
    typeByName(name: string): t.Type | null;
    getDecorator(name: string): t.RefKind[];
    errorDecorators(): Id[];
    currentConstraints: (id: number) => t.Type;
    addTypeConstraint: (id: number, constraint: t.Type) => t.Type;

    valueForSym: (sym: number) => null | { name: string; type: t.Type };
    typeForId: (id: Id) => GlobalType | null;
    valueForId: (id: Id) => GlobalValue | null;
    resolveType: (name: string, hash?: string | null) => t.RefKind | null;
    resolveDecorator: (name: string, hash?: string | null) => Array<t.RefKind>;

    toplevelConfig: (top: ToplevelConfig | null) => Ctx;
    // decoratorNames(): { [key: string]: string };
    resolve: (name: string, hash?: string | null) => Array<t.RefKind>;

    // This should only be in the analyze, not in to-tast
    resolveRecur(idx: number): Id | null;
    resolveTypeRecur(idx: number): t.Type | null;
    withLocalTypes: (locals: { sym: t.Sym; bound: t.Type | null }[]) => Ctx;
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

export const pdecorate = (
    pat: t.Pattern,
    tag: ErrorTag,
    { hit, ctx }: { hit: { [key: number]: boolean }; ctx: Ctx },
    args: t.Decorator['args'] = [],
): t.Pattern => {
    if (hit[pat.loc.idx]) {
        return pat;
    }
    hit[pat.loc.idx] = true;
    const refs = ctx.getDecorator(`error:${tag}`);
    if (!refs || refs.length !== 1) {
        throw new Error(`can't resolve that decorator`);
    }
    return {
        type: 'PDecorated',
        decorators: [
            {
                type: 'Decorator',
                id: {
                    ref: refs[0],
                    loc: noloc,
                },
                args,
                loc: pat.loc,
            },
        ],
        inner: pat,
        loc: pat.loc,
    };
};

export const tdecorate = (
    type: t.Type,
    tag: ErrorTag,
    { hit, ctx }: { hit: { [key: number]: boolean }; ctx: Ctx },
    args: t.Decorator['args'] = [],
): t.Type => {
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
    ast: t.TypeToplevel,
    ctx: Ctx,
): t.TypeToplevel => {
    return transformTypeToplevel(ast, analyzeVisitor(), { ctx, hit: {} });
};

export const analyzeTop = (ast: t.Toplevel, ctx: Ctx): t.Toplevel => {
    const top = transformToplevel(ast, analyzeVisitor(), { ctx, hit: {} });
    return transformToplevel(
        top,
        {
            Type_TVbl(node) {
                // console.log('Node ok');
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

export const populateSyms = (top: t.Toplevel, ctx: Ctx) => {
    transformToplevel(
        top,
        {
            Let(node) {
                const locals: t.Locals = [];
                const typ =
                    ctx.getType(node.expr) ??
                    typeForPattern(node.pat, ctx as FullContext);
                getLocals(node.pat, typ, locals, ctx);
                return null;
            },
            Switch(node) {
                const locals: t.Locals = [];
                const typ = ctx.getType(node.target);
                node.cases.forEach((kase) => {
                    getLocals(
                        kase.pat,
                        typ ?? typeForPattern(kase.pat, ctx as FullContext),
                        locals,
                        ctx,
                    );
                });
                return null;
            },
            Lambda(node) {
                const locals: t.Locals = [];
                node.args.forEach((arg) => {
                    getLocals(arg.pat, arg.typ, locals, ctx);
                });
                return null;
            },
        },
        null,
    );
};

type VCtx = Ctx & { switchType?: t.Type };

export const verifyVisitor = (results: Verify, _ctx: VCtx): Visitor<VCtx> => {
    const errorDecorators = _ctx.errorDecorators();
    return {
        TVbl(node, ctx) {
            results.errors.push(node.loc);
            return null;
        },
        TBlank(node) {
            results.errors.push(node.loc);
            return null;
        },
        Toplevel(node, ctx) {
            return [
                null,
                ctx.toplevelConfig(typeToplevelT(node, ctx)) as FullContext,
            ];
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
        Block(node, ctx) {
            node.stmts?.forEach((stmt) => {
                if (stmt.type === 'Let') {
                    const locals: t.Locals = [];
                    const typ =
                        ctx.getType(stmt.expr) ?? typeForPattern(stmt.pat);
                    getLocals(stmt.pat, typ, locals, ctx);
                    ctx = ctx.withLocals(locals) as Ctx;
                }
            });
            return [null, ctx];
        },
        IfYes(node, ctx) {
            const locals: t.Locals = [];
            node.conds.map((cond) => {
                if (cond.type === 'Let') {
                    getLocals(
                        cond.pat,
                        ctx.getType(cond.expr) ?? typeForPattern(cond.pat),
                        locals,
                        ctx,
                    );
                }
                return cond;
            });
            return [null, ctx.withLocals(locals) as Ctx];
        },
        Switch(node, ctx) {
            return [
                null,
                { ...ctx, switchType: ctx.getType(node.target) ?? undefined },
            ];
        },
        Case(node, ctx) {
            if (!ctx.switchType) {
                console.error('no switch type');
                return null;
            }

            const typ = ctx.switchType;
            const locals: t.Locals = [];
            getLocals(node.pat, typ, locals, ctx);

            return [null, ctx.withLocals(locals) as Ctx];
        },
    };
};

export const initVerify = (): Verify => ({
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
