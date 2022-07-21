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
import { opLevel } from './binops';
import { unifyTypes } from '../typing/unifyTypes';

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
    type: 'Apply';
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

export const isOpText = (t: string) => !t.match(/^[a-zA-Z_$]/);

export const maybeParenedBinop = (v: p.Expression): p.WithUnary => {
    if (v.type === 'BinOp' || v.type === 'Lambda') {
        return {
            type: 'ParenedExpression',
            loc: v.loc,
            items: { type: 'CommaExpr', items: [v], loc: v.loc },
        };
    }
    return v;
};

export const makeBinop = (
    op: p.Identifier,
    left: p.Expression,
    right: p.Expression,
): p.Expression => {
    const opp: p.BinOpRight['op'] = {
        op: op.text,
        loc: op.loc,
        hash: op.hash,
        type: 'binopWithHash',
    };
    let level = opLevel(op.text);
    if (left.type === 'BinOp') {
        const levels = left.rest.map((r) => opLevel(r.op.op));
        let maxLevel = Math.max(...levels);
        if (maxLevel >= level) {
            let rest = left.rest.slice();
            if (right.type === 'BinOp') {
                const levels = right.rest.map((r) => opLevel(r.op.op));
                const maxLevel = Math.max(...levels);
                if (maxLevel >= level) {
                    rest.push(
                        {
                            type: 'BinOpRight',
                            op: opp,
                            right: right.first,
                            loc: right.loc,
                        },
                        ...right.rest,
                    );
                } else {
                    rest.push({
                        type: 'BinOpRight',
                        op: opp,
                        right: maybeParenedBinop(right),
                        loc: right.loc,
                    });
                }
            } else {
                rest.push({
                    type: 'BinOpRight',
                    op: opp,
                    right: maybeParenedBinop(right),
                    loc: right.loc,
                });
            }
            return {
                ...left,
                rest,
            };
        }
    }
    if (right.type === 'BinOp') {
        const levels = right.rest.map((r) => opLevel(r.op.op));
        const maxLevel = Math.max(...levels);
        if (maxLevel >= level) {
            return {
                type: 'BinOp',
                first: maybeParenedBinop(left),
                rest: [
                    {
                        type: 'BinOpRight',
                        right: right.first,
                        loc: op.loc,
                        op: {
                            op: op.text,
                            loc: op.loc,
                            hash: op.hash,
                            type: 'binopWithHash',
                        },
                    },
                    ...right.rest,
                ],
                loc: op.loc,
            };
        }
    }
    return {
        type: 'BinOp',
        first: maybeParenedBinop(left),
        rest: [
            {
                type: 'BinOpRight',
                right: maybeParenedBinop(right),
                loc: op.loc,
                op: {
                    op: op.text,
                    loc: op.loc,
                    hash: op.hash,
                    type: 'binopWithHash',
                },
            },
        ],
        loc: op.loc,
    };
};

export const makeApply = (
    inner: p.Expression,
    suffix: p.Suffix,
    loc: t.Loc,
): p.Expression => {
    if (
        inner.type === 'Identifier' &&
        isOpText(inner.text) &&
        suffix.type === 'CallSuffix' &&
        suffix.args &&
        suffix.args.items.length === 2
    ) {
        return makeBinop(inner, suffix.args.items[0], suffix.args.items[1]);
    }
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
    if (
        inner.type === 'BinOp' ||
        inner.type === 'WithUnary' ||
        inner.type === 'Lambda'
    ) {
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
    Apply({ target, args, loc }: Apply, ctx: TACtx): p.Expression {
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

import { Ctx as ICtx } from '../ir/ir';
export const ToIR = {
    Apply({ args, loc, target }: t.Apply, ctx: ICtx): t.IApply {
        return {
            type: 'Apply',
            loc,
            args: args.map((arg) => ctx.ToIR[arg.type](arg as any, ctx)),
            target: ctx.ToIR[target.type](target as any, ctx),
        };
    },
};

import { Ctx as JCtx } from '../ir/to-js';
import * as b from '@babel/types';
export const ToJS = {
    Apply({ args, loc, target }: IApply, ctx: JCtx): b.Expression {
        return b.callExpression(
            ctx.ToJS.IExpression(target, ctx),
            args.map((arg) => ctx.ToJS.IExpression(arg, ctx)),
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
        let ttype = ctx.getType(node.target);
        if (!ttype) {
            // Something deeper has an error.
            // Huh I should probably do a transformFile checking that all expressions
            // have types before signing off.
            return null;
        }
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (ttype.type === 'TVbl') {
            ttype = ctx.addTypeConstraint(ttype, {
                type: 'TLambda',
                args: argTypes.map((typ) => ({
                    typ: typ ? typ : { type: 'TBlank', loc: node.loc },
                    loc: typ?.loc ?? node.loc,
                    label: '',
                })),
                loc: node.loc,
                result: { type: 'TBlank', loc: node.loc },
            });
        }
        if (ttype.type !== 'TLambda') {
            if (ttype.type === 'TVars') {
                return {
                    ...node,
                    target: decorate(
                        node.target,
                        'needsTypeVariables',
                        hit,
                        ctx,
                    ),
                };
            }
            return decorate(node, 'notAFunction', hit, ctx);
        }
        if (ttype.args.length !== argTypes.length) {
            return decorate(node, 'wrongNumberOfArgs', hit, ctx);
        }
        const atype = ttype;
        let changed = false;
        const args = node.args.map((arg, i) => {
            let at = ctx.getType(arg);
            if (at == null) {
                return arg;
            }
            if (at.type === 'TVbl') {
                at = ctx.addTypeConstraint(at, atype.args[i].typ);
            }
            // hmm so 'unconstrained' would be a thing.
            if (!typeMatches(at, atype.args[i].typ, ctx)) {
                changed = true;
                return decorate(arg, 'argWrongType', hit, ctx, [
                    {
                        label: 'expected',
                        arg: {
                            type: 'DType',
                            loc: noloc,
                            typ: atype.args[i].typ,
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
): null | { [key: number]: number[] } => {
    const mapping: { [sym: number]: false | number[] } = {};
    vars.forEach((v) => {
        mapping[v.sym.id] = false;
    });
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.type === 'TRef' && arg.ref.type === 'Local') {
            if (mapping[arg.ref.sym] === false) {
                mapping[arg.ref.sym] = [i];
            } else if (mapping[arg.ref.sym] != null) {
                (mapping[arg.ref.sym] as number[]).push(i);
            }
        }
    }
    if (Object.keys(mapping).every((k) => mapping[+k] !== false)) {
        return mapping as { [sym: number]: number[] };
    }
    return null;
};

export const unifiedTypes = (argTypes: t.Type[], idx: number[], ctx: Ctx) => {
    let t = argTypes[idx[0]];
    for (let i = 1; i < idx.length; i++) {
        let unified = unifyTypes(t, argTypes[idx[i]], ctx);
        if (unified) {
            t = unified;
        }
    }
    // if (idx.length > 1) {
    //     ctx.debugger();
    // }
    return t;
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
                typeMatches(
                    unifiedTypes(argTypes, mapping[arg.sym.id], ctx),
                    arg.bound,
                    ctx,
                ),
        )
    ) {
        return {
            ...node,
            target: {
                type: 'TypeApplication',
                target: node.target,
                args: vars.map((arg) =>
                    unifiedTypes(argTypes, mapping[arg.sym.id], ctx),
                ),
                loc: node.target.loc,
            },
        };
    }
    return null;
};
