// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { FullContext, GlobalType, GlobalValue } from '../ctx';
import { noloc } from '../consts';
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
import { ConstraintMap, Ctx as TMCtx, typeMatches } from './typeMatches';
import { constrainTypes, unifyTypes } from './unifyTypes';

export type Constraints = {
    // Type must match this types
    // like, let {v} = ???
    // `outer`s appear as `expected` in typeMatches
    outer?: t.Type;
    // Type must be matched by this type
    // like, (v) => v(10)
    // `inner`s appear as `candidate` in typeMatches
    inner?: t.Type;
};

export type Ctx = {
    typeByName(name: string): t.Type | null;
    getDecorator(name: string): t.RefKind[];
    errorDecorators(): Id[];
    addTypeConstraint: (id: number, constraint: Constraints) => boolean;

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

export const collapseConstraints = (
    { outer, inner }: Constraints,
    ctx: Ctx,
): t.Type => {
    if (!outer && !inner) {
        return { type: 'TBlank', loc: noloc };
    }
    if (outer && inner && !typeMatches(inner, outer, ctx)) {
        return { type: 'TBlank', loc: noloc };
    }
    return (inner || outer)!;
};

export const addNewConstraint = (
    id: number,
    newConstraint: Constraints,
    constraints: ConstraintMap,
    ctx: TMCtx,
): Constraints | null => {
    let current = mergeConstraints(
        ctx.currentConstraints(id),
        newConstraint,
        ctx,
    );
    if (!current) {
        return null;
    }
    const waiting = constraints[id];
    current = waiting ? mergeConstraints(current, waiting, ctx) : current;
    return current;
};

export const mergeConstraints = (
    one: Constraints,
    two: Constraints,
    ctx: TMCtx,
): Constraints | null => {
    const outer =
        one.outer && two.outer
            ? constrainTypes(one.outer, two.outer, ctx)
            : one.outer ?? two.outer;
    const inner =
        one.inner && two.inner
            ? unifyTypes(one.inner, two.inner, ctx)
            : one.inner ?? two.inner;
    if (inner && outer && !typeMatches(inner, outer, ctx)) {
        return null;
    }
    return {
        inner: inner ? inner : undefined,
        outer: outer ? outer : undefined,
    };
};

export const analyzeTop = (ast: t.Toplevel, ctx: Ctx): t.Toplevel => {
    const top = transformToplevel(ast, analyzeVisitor(), { ctx, hit: {} });
    return transformToplevel(
        top,
        {
            Type_TVbl(node) {
                return collapseConstraints(
                    ctx.currentConstraints(node.id),
                    ctx,
                );
            },
        },
        null,
    );
};

// export const analyze = (ast: File, ctx: Ctx): File => {
//     return transformFile(ast, analyzeVisitor(), { ctx, hit: {} });
// };

export type VError =
    | { type: 'Dec'; dec: t.Decorator; loc: t.Loc }
    | {
          type: 'Blank';
          loc: t.Loc;
      }
    | { type: 'TVbl'; loc: t.Loc };

export type Verify = {
    errors: VError[];
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

export const blockLocals = (node: t.Block, ctx: TMCtx) => {
    const locals: t.Locals = [];
    node.stmts.forEach((stmt) => {
        if (stmt.type === 'Let') {
            const typ = ctx.getType(stmt.expr) ?? typeForPattern(stmt.pat);
            getLocals(stmt.pat, typ, locals, ctx);
        }
    });
    return locals;
};

export const letLocals = (node: t.Let, ctx: TMCtx) => {
    const locals: t.Locals = [];
    const typ = ctx.getType(node.expr) ?? typeForPattern(node.pat);
    getLocals(node.pat, typ, locals, ctx);
    return locals;
};

export const ifLocals = (node: t.IfYes, ctx: TMCtx) => {
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
    return locals;
};

export const caseLocals = (switchType: t.Type, node: t.Case, ctx: TMCtx) => {
    const locals: t.Locals = [];
    getLocals(node.pat, switchType, locals, ctx);
    return locals;
};

export type LTCtx = TMCtx & { switchType?: t.Type };
export const localTrackingVisitor: Visitor<LTCtx> = {
    Lambda(node, ctx) {
        const locals: t.Locals = [];

        node.args.forEach((arg) => getLocals(arg.pat, arg.typ, locals, ctx));
        return [null, ctx.withLocals(locals) as Ctx];
    },
    Block(node, ctx) {
        return [null, ctx.withLocals(blockLocals(node, ctx as Ctx)) as Ctx];
    },
    IfYes(node, ctx) {
        return [null, ctx.withLocals(ifLocals(node, ctx as Ctx)) as Ctx];
    },
    Switch(node, ctx) {
        const res = ctx.getType(node.target);
        if (!res) {
            console.error(`Unable to get type for switch!`);
        }
        return [null, { ...ctx, switchType: res ?? undefined }];
    },
    TypeAbstraction(node, ctx) {
        return [null, ctx.withLocalTypes(node.items)];
    },
    Case(node, ctx) {
        if (!ctx.switchType) {
            console.error('no switch type');
            return null;
        }

        return [
            null,
            ctx.withLocals(caseLocals(ctx.switchType, node, ctx as Ctx)) as Ctx,
        ];
    },
};

type VCtx = Ctx & { switchType?: t.Type };
export const verifyVisitor = (results: Verify, _ctx: VCtx): Visitor<VCtx> => {
    const errorDecorators = _ctx.errorDecorators();
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
        Decorator(node) {
            if (node.id.ref.type === 'Unresolved') {
                results.unresolved.decorator.push(node.loc);
            }
            if (node.id.ref.type === 'Global') {
                const id = node.id.ref.id;
                const isError = errorDecorators.some((x) => idsEqual(x, id));
                if (isError) {
                    results.errors.push({
                        type: 'Dec',
                        dec: node,
                        loc: node.loc,
                    });
                }
            }
            return null;
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
