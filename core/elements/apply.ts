import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { noloc } from '../ctx';

export const grammar = `
Apply = target:Atom suffixes_drop:Suffix*
Suffix = CallSuffix / TypeApplicationSuffix
CallSuffix = "(" _ args:CommaExpr? ")"
CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _
`;

export type Apply = {
    type: 'Apply';
    target: t.Expression;
    args: Array<t.Expression>;
    loc: t.Loc;
};

export type IApply = {
    type: 'IApply';
    target: t.IExpression;
    args: Array<t.IExpression>;
    loc: t.Loc;
};

export const ToTast = {
    Apply(apply: p.Apply_inner, ctx: TCtx): t.Expression {
        let res = ctx.ToTast.Expression(apply.target, ctx);
        while (apply.suffixes.length) {
            const next = apply.suffixes.shift()!;
            res = ctx.ToTast.Suffix(next, res, ctx);
        }
        return res;
    },
    CallSuffix(suffix: p.CallSuffix, target: t.Expression, ctx: TCtx): Apply {
        return {
            type: 'Apply',
            target,
            args:
                suffix.args?.items.map((arg) =>
                    ctx.ToTast.Expression(arg, ctx),
                ) ?? [],
            loc: {
                ...suffix.loc,
                start: target.loc.start,
            },
        };
    },
};

export const makeApply = (
    inner: p.Expression,
    suffix: p.Suffix,
    loc: t.Loc,
): p.Apply_inner => {
    if (inner.type === 'Apply') {
        return { ...inner, suffixes: inner.suffixes.concat([suffix]) };
    }
    if (inner.type === 'DecoratedExpression') {
        return {
            type: 'Apply',
            target: {
                type: 'ParenedExpression',
                items: {
                    type: 'CommaExpr',
                    items: [inner],
                    loc,
                },
                loc,
            },
            suffixes: [suffix],
            loc,
        };
    }
    if (inner.type === 'BinOp' || inner.type === 'WithUnary') {
        inner = {
            type: 'ParenedExpression',
            items: {
                type: 'CommaExpr',
                items: [inner],
                loc,
            },
            loc,
        };
    }
    return { type: 'Apply', target: inner, suffixes: [suffix], loc };
};

export const ToAst = {
    Apply({ target, args, loc }: Apply, ctx: TACtx): p.Apply {
        if (target.type === 'TypeApplication') {
            const ttype = ctx.actx.getType(target.target);
            const argTypes = args.map((arg) => ctx.actx.getType(arg));
            if (
                argTypes.every(Boolean) &&
                ttype?.type === 'TVars' &&
                ttype.inner.type === 'TLambda'
            ) {
                const auto = autoTypeApply(
                    { type: 'Apply', loc, args, target: target.target },
                    ttype.args,
                    ttype.inner.args.map((t) => t.typ),
                    argTypes as t.Type[],
                    ctx.actx,
                );
                if (auto) {
                    const targs = (auto.target as t.TypeApplication).args;
                    if (
                        targs.length === target.args.length &&
                        targs.every(
                            (targ, i) =>
                                typeMatches(targ, target.args[i], ctx.actx) &&
                                typeMatches(target.args[i], targ, ctx.actx),
                        )
                    ) {
                        return makeApply(
                            ctx.ToAst.Expression(target.target, ctx),
                            {
                                type: 'CallSuffix',
                                args: {
                                    type: 'CommaExpr',
                                    items: args.map((a) =>
                                        ctx.ToAst.Expression(a, ctx),
                                    ),
                                    loc,
                                },
                                loc,
                            },
                            loc,
                        );
                    }
                }
            }
        }

        return makeApply(
            ctx.ToAst.Expression(target, ctx),
            {
                type: 'CallSuffix',
                args: {
                    type: 'CommaExpr',
                    items: args.map((a) => ctx.ToAst.Expression(a, ctx)),
                    loc,
                },
                loc,
            },
            loc,
        );
    },
};

export const ToPP = {
    Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
        return pp.items(
            [
                ctx.ToPP.Expression(apply.target, ctx),
                ...apply.suffixes.map((s) => ctx.ToPP.Suffix(s, ctx)),
            ],
            apply.loc,
        );
    },
    CallSuffix(parens: p.CallSuffix, ctx: PCtx): pp.PP {
        return pp.args(
            (parens.args?.items ?? []).map((a) => ctx.ToPP.Expression(a, ctx)),
            parens.loc,
        );
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    ApplyPost(node, { ctx, hit }) {
        if (
            node.target.type === 'Ref' &&
            node.target.kind.type === 'Unresolved'
        ) {
            const resolved = ctx.resolve(node.target.kind.text, null);
            if (resolved.length > 1) {
                const argTypes = node.args.map((arg) => ctx.getType(arg));
                if (argTypes.every(Boolean)) {
                    for (let option of resolved) {
                        const ttype = ctx.getType({
                            ...node.target,
                            kind: option,
                        });
                        if (
                            ttype?.type === 'TLambda' &&
                            ttype.args.length === argTypes.length &&
                            ttype.args.every((arg, i) =>
                                typeMatches(argTypes[i]!, arg.typ, ctx),
                            )
                        ) {
                            return {
                                ...node,
                                target: { ...node.target, kind: option },
                            };
                        }
                        if (
                            ttype?.type === 'TVars' &&
                            ttype.inner.type === 'TLambda'
                        ) {
                            const typed = autoTypeApply(
                                {
                                    ...node,
                                    target: { ...node.target, kind: option },
                                },
                                ttype.args,
                                ttype.inner.args.map((t) => t.typ),
                                argTypes as t.Type[],
                                ctx,
                            );
                            if (typed) {
                                return typed;
                            }
                        }
                    }
                }
                // ctx.debugger();
            }
            // Check if there are multiples
            return null;
        }

        const ttype = ctx.getType(node.target);
        if (ttype?.type === 'TVars' && ttype.inner.type === 'TLambda') {
            const argTypes = node.args.map((arg) => ctx.getType(arg));
            if (argTypes.every(Boolean)) {
                return autoTypeApply(
                    node,
                    ttype.args,
                    ttype.inner.args.map((t) => t.typ),
                    argTypes as t.Type[],
                    ctx,
                );
            }
        }

        return null;
    },
    ExpressionPost_Apply(node, { ctx, hit }) {
        // Otherwise, try to get the type of the target & compare to the args
        const ttype = ctx.getType(node.target);
        if (!ttype) {
            // Something deeper has an error.
            // Huh I should probably do a transformFile checking that all expressions
            // have types before signing off.
            return null;
        }
        if (ttype?.type !== 'TLambda') {
            return decorate(node, 'notAFunction', hit, ctx);
        }
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (ttype.args.length !== argTypes.length) {
            return decorate(node, 'wrongNumberOfArgs', hit, ctx);
        }
        let changed = false;
        const args = node.args.map((arg, i) => {
            const at = ctx.getType(arg);
            if (at == null) {
                return arg;
            }
            if (!typeMatches(at, ttype.args[i].typ, ctx)) {
                changed = true;
                return decorate(arg, 'argWrongType', hit, ctx, [
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

export const inferVarsFromArgs = (
    vars: t.TVar[],
    args: t.Type[],
): null | { [key: number]: number } => {
    const mapping: { [sym: number]: false | number } = {};
    vars.forEach((v) => {
        mapping[v.sym.id] = false;
    });
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.type === 'TRef' && arg.ref.type === 'Local') {
            if (mapping[arg.ref.sym] === false) {
                mapping[arg.ref.sym] = i;
            }
        }
    }
    if (Object.keys(mapping).every((k) => mapping[+k] !== false)) {
        return mapping as { [sym: number]: number };
    }
    return null;
};

export const autoTypeApply = (
    node: t.Apply,
    vars: t.TVar[],
    args: t.Type[],
    argTypes: t.Type[],
    ctx: Ctx,
): null | t.Apply => {
    const mapping = inferVarsFromArgs(vars, args);
    if (
        mapping &&
        vars.every(
            (arg, i) =>
                !arg.bound ||
                typeMatches(argTypes[mapping[arg.sym.id]]!, arg.bound, ctx),
        )
    ) {
        return {
            ...node,
            target: {
                type: 'TypeApplication',
                target: node.target,
                args: vars.map((arg) => argTypes[mapping[arg.sym.id]]!),
                loc: node.target.loc,
            },
        };
    }
    return null;
};
