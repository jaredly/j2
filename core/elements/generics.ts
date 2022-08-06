import { Visitor } from '../transform-tast';
import { decorate, tdecorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';
import { noloc } from '../consts';
import { makeApply } from './apply';
import { nodebug } from '../ctx';

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

// export type Apply = {
//     type: 'Apply';
//     target: t.Expression;
//     args: Array<t.Expression>;
//     loc: t.Loc;
// };

export const ToTast = {
    TypeApplicationSuffix(
        suffix: p.TypeApplicationSuffix,
        target: t.Expression,
        ctx: TCtx,
    ): t.Expression {
        const args = suffix.vbls.items.map((vbl) => ctx.ToTast.Type(vbl, ctx));
        if (target.type === 'Ref' && target.kind.type === 'Unresolved') {
            const resolved = ctx.resolve(target.kind.text, null);
            for (let res of resolved) {
                const t = ctx.getType({
                    type: 'Ref',
                    kind: res,
                    loc: target.loc,
                });
                if (t && t.type === 'TVars') {
                    if (t.args.length === args.length) {
                        if (
                            t.args.every((arg, i) =>
                                matchesBound(args[i], arg.bound, ctx),
                            )
                        ) {
                            target = {
                                type: 'Ref',
                                kind: res,
                                loc: target.loc,
                            };
                            break;
                        }
                    }
                }
            }
        }
        return {
            type: 'TypeApplication',
            target,
            inferred: false,
            args: args,
            loc: { ...suffix.loc, start: target.loc.start },
        };
    },
    TypeAbstraction(
        { args, loc, inner }: p.TypeAbstraction,
        ctx: TCtx,
    ): TypeAbstraction {
        const targs = args.items.map((arg) => {
            const targ = ctx.ToTast.TBArg(arg, ctx);
            ctx = ctx.withLocalTypes([targ]);
            return targ;
        });
        return {
            type: 'TypeAbstraction',
            items: targs,
            body: ctx.ToTast.Expression(inner, ctx),
            loc,
        };
    },
};

export const matchesBound = (
    t: t.Type,
    bound: t.Type | null,
    ctx: TMCtx,
    path?: string[],
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
        if (argbound && typeMatches(argbound, bound, ctx, path)) {
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
    return typeMatches(t, bound, ctx, path);
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

import { Ctx as ICtx } from '../ir/ir';
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

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    TypeAbstraction(node, ctx) {
        let innerCtx = ctx.ctx.withLocalTypes(node.items);
        return [null, { ...ctx, ctx: innerCtx }];
    },
    Expression_TypeApplication(node, { ctx, hit }) {
        const target = ctx.getType(node.target);
        if (!target) {
            return null;
        }
        let targs: t.TVar[];
        if (target.type !== 'TVars') {
            if (target.type === 'TRef' && target.ref.type !== 'Unresolved') {
                let got = ctx.getTypeArgs(target.ref);
                if (got != null) {
                    targs = got;
                } else {
                    return decorate(node, 'notATypeVars', hit, ctx);
                }
            } else {
                return decorate(node, 'notATypeVars', hit, ctx);
            }
        } else {
            targs = target.args;
        }
        // Hmm ok what about,
        let changed = false;
        const args = node.args.map((arg, i) => {
            const targ: t.TVar = targs[i];
            if (!targ) {
                changed = true;
                return tdecorate(arg, 'extraArg', { hit, ctx });
            }
            if (targ.bound && !matchesBound(arg, targ.bound, ctx)) {
                changed = true;
                return tdecorate(arg, 'argWrongType', { hit, ctx }, [
                    {
                        label: 'expected',
                        arg: { type: 'DType', loc: noloc, typ: targ.bound },
                        loc: noloc,
                    },
                    // {
                    //     label: 'received',
                    //     arg: {
                    //         type: 'DType',
                    //         loc: noloc,
                    //         typ: ctx.resolveRefsAndApplies(arg) ?? arg,
                    //     },
                    //     loc: noloc,
                    // },
                ]);
            }
            ctx = ctx.withLocalTypes([{ sym: targ.sym, bound: arg }]);
            return arg;
        });
        node = changed ? { ...node, args } : node;

        let minArgs = targs.findIndex((arg) => arg.default_);
        if (minArgs === -1) {
            minArgs = targs.length;
        }

        if (node.args.length < minArgs || node.args.length > targs.length) {
            return decorate(node, 'wrongNumberOfTypeArgs', hit, ctx);
        }

        return changed ? { ...node, args } : node;
    },
    // TypeVariables(node, ctx) {},
    Type_TApply(node, { ctx, hit }) {
        const inner = ctx.resolveAnalyzeType(node.target);
        if (!inner) {
            return null;
        }
        // if (inner.type !== 'TVars') {
        //     return tdecorate(node, 'notATypeVars', hit, ctx._full);
        // }

        let targs: t.TVar[];
        if (inner.type !== 'TVars') {
            if (inner.type === 'TRef' && inner.ref.type !== 'Unresolved') {
                let got = ctx.getTypeArgs(inner.ref);
                if (got != null) {
                    targs = got;
                } else {
                    return tdecorate(node, 'notATypeVars', { hit, ctx });
                }
            } else {
                return tdecorate(node, 'notATypeVars', { hit, ctx });
            }
        } else {
            targs = inner.args;
        }

        let changed = false;
        const args = node.args.map((arg, i) => {
            if (i >= targs.length) {
                return tdecorate(arg, 'extraArg', { hit, ctx });
            }
            const { bound } = targs[i];

            if (bound && !matchesBound(arg, bound, ctx)) {
                changed = true;
                return tdecorate(arg, 'argWrongType', { hit, ctx }, [
                    {
                        label: 'expected',
                        arg: { type: 'DType', loc: noloc, typ: bound },
                        loc: noloc,
                    },
                    // {
                    //     label: 'received',
                    //     arg: {
                    //         type: 'DType',
                    //         loc: noloc,
                    //         typ: ctx.resolveRefsAndApplies(arg) ?? arg,
                    //     },
                    //     loc: noloc,
                    // },
                ]);
            }
            return arg;
        });
        if (changed) {
            node = { ...node, args };
        }

        let minArgs = targs.findIndex((arg) => arg.default_);
        if (minArgs === -1) {
            minArgs = targs.length;
        }

        if (node.args.length < minArgs || node.args.length > targs.length) {
            return tdecorate(node, 'wrongNumberOfTypeArgs', { hit, ctx });
        }
        return changed ? node : null;
    },
    // Expression_TypeApplication(node, ctx) {
    // 	// node.args.forEach(arg => { })
    // },
};
