import { ConstraintMap, TMPaths, typeMatches } from '../../typing/typeMatches';
import * as t from '../../typed-ast';
import * as p from '../../grammar/base.parser';
import * as pp from '../../printer/pp';
import { Ctx as PCtx } from '../../printer/to-pp';
import { Ctx as TACtx } from '../../typing/to-ast';
import { Ctx as TMCtx } from '../../typing/typeMatches';
import { noloc } from '../../consts';
import { makeApply } from '../apply/makeApply';
import { nodebug } from '../../ctx';

export const grammar = `
TypeApplicationSuffix = "<" _ vbls:TypeAppVbls ">"
TypeAppVbls = first:Type rest:( _ "," _ Type)* _ ","? _

TypeAbstraction = "<" _ args:TBargs _ ">" _ inner:Expression
`;

// hello<T>(xyz)
export type TypeApplication = {
    type: 'TypeApplication';
    target: t.Expression;
    args: Array<t.Type>;
    inferred: boolean;
    loc: t.Loc;
};

// <T> hello
export type TypeAbstraction = {
    type: 'TypeAbstraction';
    items: Array<t.TVar>;
    body: t.Expression;
    loc: t.Loc;
};

export type ITypeAbstraction = {
    type: 'TypeAbstraction';
    items: Array<t.TVar>;
    body: t.IExpression;
    loc: t.Loc;
};

export const matchesBound = (
    t: t.Type,
    bound: t.Type | null,
    ctx: TMCtx,
    constraints?: ConstraintMap,
    path?: TMPaths,
) => {
    if (!bound) {
        return true;
    }
    if (bound.type === 'TRef' && bound.ref.type === 'Local') {
        const argbound = ctx.getBound(bound.ref.sym);
        if (argbound) {
            bound = argbound;
        }
    }
    if (t.type === 'TRef' && t.ref.type === 'Local') {
        const argbound = ctx.getBound(t.ref.sym);
        if (argbound && typeMatches(argbound, bound, ctx, path, constraints)) {
            return true;
        }
    }
    if (
        bound.type === 'TEnum' &&
        bound.cases.length === 0 &&
        bound.open &&
        t.type === 'TEnum'
    ) {
        return true;
    }
    return typeMatches(t, bound, ctx, path, constraints);
};

export const ToAst = {
    TypeApplication(
        { target, args, loc }: TypeApplication,
        ctx: TACtx,
    ): p.Expression {
        return makeApply(
            ctx.ToAst.Expression(target, ctx),
            {
                type: 'TypeApplicationSuffix',
                vbls: {
                    type: 'TypeAppVbls',
                    items: args.map((arg) => ctx.ToAst.Type(arg, ctx)),
                    loc: noloc,
                },
                loc,
            },
            loc,
            ctx.showIds,
        );
    },
    TypeAbstraction(
        { items, body, loc }: TypeAbstraction,
        ctx: TACtx,
    ): p.TypeAbstraction {
        items.forEach((arg) => ctx.recordSym(arg.sym, 'type'));
        ctx = { ...ctx, actx: ctx.actx.withLocalTypes(items) };
        return {
            type: 'TypeAbstraction',
            args: {
                type: 'TBargs',
                items: items.map((item) => ctx.ToAst.TBArg(item, ctx)),
                loc,
            },
            inner: ctx.ToAst.Expression(body, ctx),
            loc,
        };
    },
};

export const ToPP = {
    TypeApplicationSuffix(suffix: p.TypeApplicationSuffix, ctx: PCtx): pp.PP {
        return pp.args(
            suffix.vbls.items.map((item) => ctx.ToPP.Type(item, ctx)),
            suffix.loc,
            '<',
            '>',
        );
    },
    TypeAbstraction({ args, inner, loc }: p.TypeAbstraction, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.args(
                    args.items.map((arg) => ctx.ToPP.TBArg(arg, ctx)),
                    args.loc,
                    '<',
                    '>',
                ),
                ctx.ToPP.Expression(inner, ctx),
            ],
            loc,
        );
    },
};

import { Ctx as ICtx } from '../../ir/ir';
export const ToIR = {
    TypeApplication(
        { loc, target, args }: t.TypeApplication,
        ctx: ICtx,
    ): t.IExpression {
        // ugh this is gonna mess me up, right?
        // like, ... idk maybe I do need to keep this in IR,
        // at least to be able to know what types things are?
        // on the other hand, maybe I can bake types at this point?
        // like, monomorphizing is going to happen before this.
        return ctx.ToIR.Expression(target, ctx);
    },
    TypeAbstraction(
        { items, body, loc }: t.TypeAbstraction,
        ctx: ICtx,
    ): t.IExpression {
        ctx = { ...ctx, actx: ctx.actx.withLocalTypes(items) };
        return {
            type: 'TypeAbstraction',
            items,
            body: ctx.ToIR.Expression(body, ctx),
            loc,
        };
    },
};

export const ToJS = {};
