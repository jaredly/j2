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
import { noloc } from '../ctx';
import { makeApply } from './apply';

export const grammar = `
TypeApplicationSuffix = "<" _ vbls:TypeAppVbls ">"
TypeAppVbls = first:Type rest:( _ "," _ Type)* _ ","? _

TypeVariables = "<" _ vbls:TypeVbls ">" _ body:Expression
TypeVbls = first:TypeVbl rest:( _ "," _ TypeVbl)* _ ","? _
TypeVbl = vbl:Identifier bound:(_ ":" _ Type)?
`;

// hello<T>(xyz)
export type TypeApplication = {
    type: 'TypeApplication';
    target: t.Expression;
    args: Array<t.Type>;
    loc: t.Loc;
};

// <T> hello
export type TypeVariables = {
    type: 'TypeVariables';
    items: Array<{ sym: t.Sym; bound: t.Type }>;
    body: t.Expression;
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
        return {
            type: 'TypeApplication',
            target,
            args: suffix.vbls.items.map((vbl) => ctx.ToTast.Type(vbl, ctx)),
            loc: { ...suffix.loc, start: target.loc.start },
        };
    },
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
        );
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
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
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
            const targ = targs[i];
            if (!targ) {
                changed = true;
                return tdecorate(arg, 'extraArg', { hit, ctx });
            }
            if (targ.bound && !typeMatches(arg, targ.bound, ctx)) {
                changed = true;
                return tdecorate(arg, 'argWrongType', { hit, ctx }, [
                    {
                        label: 'expected',
                        arg: { type: 'DType', loc: noloc, typ: targ.bound },
                        loc: noloc,
                    },
                ]);
            }
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
            if (bound && !typeMatches(arg, bound, ctx)) {
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
