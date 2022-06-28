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
import { getType } from '../typing/getType';

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
            args: suffix.vbls.items.map((vbl) =>
                ctx.ToTast[vbl.type](vbl as any, ctx),
            ),
            loc: { ...suffix.loc, start: target.loc.start },
        };
    },
};

export const ToAst = {
    TypeApplication(
        { target, args, loc }: TypeApplication,
        ctx: TACtx,
    ): p.Apply_inner {
        return makeApply(
            ctx.ToAst[target.type](target as any, ctx),
            {
                type: 'TypeApplicationSuffix',
                vbls: {
                    type: 'TypeAppVbls',
                    items: args.map((arg) =>
                        ctx.ToAst[arg.type](arg as any, ctx),
                    ),
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
            suffix.vbls.items.map((item) =>
                ctx.ToPP[item.type](item as any, ctx),
            ),
            suffix.loc,
            '<',
            '>',
        );
    },
};

export const analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    Expression_TypeApplication(node, { ctx, hit }) {
        const target = getType(node.target, ctx._full);
        if (!target) {
            return null;
        }
        if (target.type !== 'TVars') {
            return decorate(node, 'notATypeVars', hit, ctx._full);
        }
        if (node.args.length !== target.args.length) {
            return decorate(node, 'wrongNumberOfTypeArgs', hit, ctx._full);
        }
        return null;
    },
    Type_TApply(node, { ctx, hit }) {
        const inner = ctx.resolveType(node.target);
        if (!inner) {
            console.log('not resolved', node, ctx);
            return null;
        }
        if (inner.type !== 'TVars') {
            return tdecorate(node, 'notATypeVars', hit, ctx._full);
        }
        let changed = false;
        const args = node.args.map((arg, i) => {
            if (i >= inner.args.length) {
                return tdecorate(arg, 'extraArg', hit, ctx._full);
            }
            const { bound } = inner.args[i];
            if (bound && !typeMatches(arg, bound, ctx._full)) {
                changed = true;
                return tdecorate(arg, 'argWrongType', hit, ctx._full, [
                    {
                        label: 'expected',
                        arg: { type: 'DType', loc: noloc, typ: bound },
                        loc: noloc,
                    },
                ]);
            }
            return arg;
        });
        if (changed) {
            node = { ...node, args };
        }

        if (node.args.length !== inner.args.length) {
            return tdecorate(node, 'wrongNumberOfTypeArgs', hit, ctx._full);
        }
        return changed ? node : null;
    },
    // Expression_TypeApplication(node, ctx) {
    // 	// node.args.forEach(arg => { })
    // },
};
