import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typesEqual';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { noloc } from '../ctx';

export const grammar = `
Apply = target:Atom suffixes_drop:Suffix*
Suffix = Parens
Parens = "(" _ args:CommaExpr? ")"
CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _
`;

export type Apply = {
    type: 'Apply';
    target: t.Expression;
    args: Array<t.Expression>;
    loc: t.Loc;
};

export const ToTast = {
    Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
        let res = ctx.ToTast[apply.target.type](apply.target as any, ctx);
        while (apply.suffixes.length) {
            const next = apply.suffixes.shift()!;
            res = {
                type: 'Apply',
                args:
                    next.args?.items.map((arg) =>
                        ctx.ToTast[arg.type](arg as any, ctx),
                    ) ?? [],
                target: res,
                loc: {
                    start: apply.loc.start,
                    end: next.loc.end,
                    idx: next.loc.idx,
                },
            };
        }
        return res as t.Apply;
    },
};

export const ToAst = {
    Apply({ type, target, args, loc }: t.Apply, ctx: TACtx): p.Apply {
        let inner = ctx.ToAst[target.type](target as any, ctx);
        const parens: p.Parens = {
            loc,
            type: 'Parens',
            args: {
                type: 'CommaExpr',
                items: args.map((a) => ctx.ToAst[a.type](a as any, ctx)),
                loc,
            },
        };
        if (inner.type === 'Apply') {
            return { ...inner, suffixes: inner.suffixes.concat([parens]) };
        }
        if (inner.type === 'DecoratedExpression') {
            return {
                type,
                target: { type: 'ParenedExpression', expr: inner, loc },
                suffixes: [parens],
                loc,
            };
        }
        return { type, target: inner, suffixes: [parens], loc };
    },
};

export const ToPP = {
    Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
        return pp.items(
            [
                ctx.ToPP[apply.target.type](apply.target as any, ctx),
                ...apply.suffixes.map((s) => ctx.ToPP[s.type](s, ctx)),
            ],
            apply.loc,
        );
    },
    Parens(parens: p.Parens, ctx: PCtx): pp.PP {
        return pp.args(
            (parens.args?.items ?? []).map((a) =>
                ctx.ToPP[a.type](a as any, ctx),
            ),
            parens.loc,
        );
    },
};

export const analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    Expression_Apply(node, { ctx, hit }) {
        if (
            node.target.type === 'Ref' &&
            node.target.kind.type === 'Unresolved'
        ) {
            // Check if there are multiples
        }
        // Otherwise, try to get the type of the target & compare to the args
        const ttype = ctx.getType(node.target);
        if (!ttype) {
            // Something deeper has an error.
            // Huh I should probably do a transformFile checking that all expressions
            // have types before signing off.
            return null;
        }
        if (ttype?.type !== 'TLambda') {
            return decorate(node, 'notAFunction', hit, ctx._full);
        }
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (ttype.args.length !== argTypes.length) {
            return decorate(node, 'wrongNumberOfArgs', hit, ctx._full);
        }
        let changed = false;
        const args = node.args.map((arg, i) => {
            const at = ctx.getType(arg);
            if (at == null) {
                return arg;
            }
            if (!typeMatches(at, ttype.args[i].typ, ctx._full)) {
                changed = true;
                return decorate(arg, 'argWrongType', hit, ctx._full, [
                    {
                        label: 'expected',
                        arg: {
                            type: 'DType',
                            loc: noloc,
                            typ: ttype.args[i].typ,
                        },
                        loc: noloc,
                    },
                ]);
            }
            return arg;
        });
        // iffff target is resolved, we check the args
        // if it's not resolved, then
        return changed ? { ...node, args } : null;
    },
};
