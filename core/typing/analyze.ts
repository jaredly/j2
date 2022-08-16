// So here we go through the TAST and report any glaring incompatabilities that we find.
// Also, this is where we try to do type-based resolution.
// Should I separate the two steps? idk.

import { FullContext, GlobalType, GlobalValue } from '../ctx';
import { noloc } from '../consts';
import { getLocals } from '../elements/pattern';
import { typeForPattern } from '../elements/patterns/typeForPattern';
import { ErrorTag } from '../errors';
import { Id } from '../ids';
import { transformToplevel, transformTypeToplevel } from '../transform-tast';
import * as t from '../typed-ast';
import { analyzeVisitor } from './analyze.gen';
import { ToplevelConfig, TopTypeKind } from './to-tast';
import { ConstraintMap, Ctx as TMCtx, typeMatches } from './typeMatches';
import { constrainTypes, unifyTypes } from './unifyTypes';
import { dtype } from '../elements/ifs';
import { localTrackingVisitor } from './localTrackingVisitor';
import { locWithin } from './__test__/verifyHL';

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
    errorDecorators(): { [idHash: string]: string };
    addTypeConstraint: (id: number, constraint: Constraints) => boolean;
    newTypeVar: (loc: t.Loc) => t.TVbl;

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
    ctx: TMCtx,
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
        newConstraint,
        ctx.currentConstraints(id),
        ctx,
        constraints,
    );
    if (!current) {
        return null;
    }
    const waiting = constraints[id];
    current = waiting
        ? mergeConstraints(current, waiting, ctx, constraints)
        : current;
    return current;
};

export const mergeConstraints = (
    one: Constraints,
    two: Constraints,
    ctx: TMCtx,
    constraints?: ConstraintMap,
): Constraints | null => {
    const outer =
        one.outer && two.outer
            ? constrainTypes(one.outer, two.outer, ctx, constraints)
            : one.outer ?? two.outer;
    const inner =
        one.inner && two.inner
            ? unifyTypes(one.inner, two.inner, ctx, constraints)
            : one.inner ?? two.inner;
    if (
        inner &&
        outer &&
        !typeMatches(inner, outer, ctx, undefined, constraints)
    ) {
        return null;
    }
    return {
        inner: inner ? inner : undefined,
        outer: outer ? outer : undefined,
    };
};

export const analyzeTop = (ast: t.Toplevel, ctx: Ctx): t.Toplevel => {
    const hit = {};
    const top = transformToplevel(ast, analyzeVisitor(), { ctx, hit });
    return transformToplevel(
        top,
        {
            ...localTrackingVisitor,
            Type_TVbl(node) {
                const { inner, outer } = ctx.currentConstraints(node.id);
                if (outer && inner) {
                    // So actually, if we've gotten this far, then the
                    // constraints are valid.
                    // if (typeMatches(inner, outer, ctx)) {
                    // }
                    // return tdecorate(
                    //     { type: 'TBlank', loc: node.loc },
                    //     'cannotReconcile',
                    //     { ctx, hit },
                    //     [
                    //         dtype('inner', inner, node.loc),
                    //         dtype('outer', outer, node.loc),
                    //     ],
                    // );
                    return { ...inner, loc: node.loc };
                }
                return {
                    ...(inner || outer || { type: 'TBlank', loc: node.loc }),
                    loc: node.loc,
                };
            },
        },
        ctx,
    );
};

// export const analyze = (ast: File, ctx: Ctx): File => {
//     return transformFile(ast, analyzeVisitor(), { ctx, hit: {} });
// };

export type VError =
    | { type: 'Dec'; dec: t.Decorator; loc: t.Loc; name: string }
    | {
          type: 'Blank';
          loc: t.Loc;
      }
    | { type: 'TVbl'; loc: t.Loc };

export type Verify = {
    expected: { loc: t.Loc; text: string | null; errors: VError[] }[];
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
        (v.expected
            ? v.errors.filter(
                  (err) =>
                      err.type !== 'Dec' ||
                      !v.expected.find(
                          (expected) =>
                              err.name === expected.text &&
                              locWithin(expected.loc, err.loc),
                      ),
              )
            : v.errors
        ).length +
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
