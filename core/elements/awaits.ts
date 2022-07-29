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
import { Ctx as ICtx } from '../ir/ir';
import { noloc } from '../ctx';
import { makeApply } from './apply';

export const grammar = `
AwaitSuffix = pseudo:"!"
`;

// hello!
export type Await = {
    type: 'Await';
    target: t.Expression;
    loc: t.Loc;
};

export const ToTast = {
    AwaitSuffix(
        suffix: p.AwaitSuffix,
        target: t.Expression,
        ctx: TCtx,
    ): t.Expression {
        return {
            type: 'Await',
            target,
            loc: { ...suffix.loc, start: target.loc.start },
        };
    },
};

export const ToAst = {
    Await({ target, loc }: Await, ctx: TACtx): p.Expression {
        return makeApply(
            ctx.ToAst.Expression(target, ctx),
            {
                type: 'AwaitSuffix',
                pseudo: '!',
                loc,
            },
            loc,
        );
    },
};

export const ToPP = {
    AwaitSuffix(suffix: p.AwaitSuffix, ctx: PCtx): pp.PP {
        return pp.text('!', suffix.loc);
    },
};

export const ToIR = {
    Await({ target, loc }: Await, ctx: ICtx): t.IExpression {
        return ctx.ToIR.Expression(target, ctx);
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    // Expression_TypeApplication(node, { ctx, hit }) {
    //     const target = ctx.getType(node.target);
    //     if (!target) {
    //         return null;
    //     }
    //     let targs: t.TVar[];
    //     if (target.type !== 'TVars') {
    //         if (target.type === 'TRef' && target.ref.type !== 'Unresolved') {
    //             let got = ctx.getTypeArgs(target.ref);
    //             if (got != null) {
    //                 targs = got;
    //             } else {
    //                 return decorate(node, 'notATypeVars', hit, ctx);
    //             }
    //         } else {
    //             return decorate(node, 'notATypeVars', hit, ctx);
    //         }
    //     } else {
    //         targs = target.args;
    //     }
    //     // Hmm ok what about,
    //     let changed = false;
    //     const args = node.args.map((arg, i) => {
    //         const targ = targs[i];
    //         if (!targ) {
    //             changed = true;
    //             return tdecorate(arg, 'extraArg', { hit, ctx });
    //         }
    //         if (targ.bound && !typeMatches(arg, targ.bound, ctx)) {
    //             changed = true;
    //             return tdecorate(arg, 'argWrongType', { hit, ctx }, [
    //                 {
    //                     label: 'expected',
    //                     arg: { type: 'DType', loc: noloc, typ: targ.bound },
    //                     loc: noloc,
    //                 },
    //             ]);
    //         }
    //         return arg;
    //     });
    //     node = changed ? { ...node, args } : node;
    //     let minArgs = targs.findIndex((arg) => arg.default_);
    //     if (minArgs === -1) {
    //         minArgs = targs.length;
    //     }
    //     if (node.args.length < minArgs || node.args.length > targs.length) {
    //         return decorate(node, 'wrongNumberOfTypeArgs', hit, ctx);
    //     }
    //     return changed ? { ...node, args } : node;
    // },
    // // TypeVariables(node, ctx) {},
    // Type_TApply(node, { ctx, hit }) {
    //     const inner = ctx.resolveAnalyzeType(node.target);
    //     if (!inner) {
    //         return null;
    //     }
    //     // if (inner.type !== 'TVars') {
    //     //     return tdecorate(node, 'notATypeVars', hit, ctx._full);
    //     // }
    //     let targs: t.TVar[];
    //     if (inner.type !== 'TVars') {
    //         if (inner.type === 'TRef' && inner.ref.type !== 'Unresolved') {
    //             let got = ctx.getTypeArgs(inner.ref);
    //             if (got != null) {
    //                 targs = got;
    //             } else {
    //                 return tdecorate(node, 'notATypeVars', { hit, ctx });
    //             }
    //         } else {
    //             return tdecorate(node, 'notATypeVars', { hit, ctx });
    //         }
    //     } else {
    //         targs = inner.args;
    //     }
    //     let changed = false;
    //     const args = node.args.map((arg, i) => {
    //         if (i >= targs.length) {
    //             return tdecorate(arg, 'extraArg', { hit, ctx });
    //         }
    //         const { bound } = targs[i];
    //         if (bound && !typeMatches(arg, bound, ctx)) {
    //             changed = true;
    //             return tdecorate(arg, 'argWrongType', { hit, ctx }, [
    //                 {
    //                     label: 'expected',
    //                     arg: { type: 'DType', loc: noloc, typ: bound },
    //                     loc: noloc,
    //                 },
    //                 // {
    //                 //     label: 'received',
    //                 //     arg: {
    //                 //         type: 'DType',
    //                 //         loc: noloc,
    //                 //         typ: ctx.resolveRefsAndApplies(arg) ?? arg,
    //                 //     },
    //                 //     loc: noloc,
    //                 // },
    //             ]);
    //         }
    //         return arg;
    //     });
    //     if (changed) {
    //         node = { ...node, args };
    //     }
    //     let minArgs = targs.findIndex((arg) => arg.default_);
    //     if (minArgs === -1) {
    //         minArgs = targs.length;
    //     }
    //     if (node.args.length < minArgs || node.args.length > targs.length) {
    //         return tdecorate(node, 'wrongNumberOfTypeArgs', { hit, ctx });
    //     }
    //     return changed ? node : null;
    // },
    // // Expression_TypeApplication(node, ctx) {
    // // 	// node.args.forEach(arg => { })
    // // },
};
