import { Visitor } from '../transform-tast';
import { Constraints, decorate, tdecorate } from '../typing/analyze';
import { Ctx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { noloc } from '../consts';
import { opLevel } from './binops';
import { constrainTypes, unifyTypes } from '../typing/unifyTypes';

export const grammar = `
Apply = target:Atom suffixes_drop:Suffix*
Suffix = CallSuffix / TypeApplicationSuffix / AwaitSuffix / ArrowSuffix
CallSuffix = "(" _ args:CommaExpr? ")"
CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _
ArrowSuffix = _ "->" _ name:Identifier args:CallSuffix?
`;

export type Apply = {
    type: 'Apply';
    target: t.Expression;
    args: Array<t.Expression>;
    arrow: boolean;
    loc: t.Loc;
};

export type IApply = {
    type: 'Apply';
    target: t.IExpression;
    args: Array<{ expr: t.IExpression; type: t.Type }>;
    loc: t.Loc;
};

export const ToTast = {
    Apply(apply: p.Apply_inner, ctx: TCtx): t.Expression {
        let res = ctx.ToTast.Expression(apply.target, ctx);
        const suffixes = apply.suffixes.slice();
        while (suffixes.length) {
            const next = suffixes.shift()!;
            res = ctx.ToTast.Suffix(next, res, ctx);
        }
        return res;
    },
    ArrowSuffix(suffix: p.ArrowSuffix, target: t.Expression, ctx: TCtx): Apply {
        // const
        const nt = ctx.ToTast.Identifier(suffix.name, ctx);
        return maybeAutoType(
            {
                type: 'Apply',
                target: nt,
                args: [
                    target,
                    ...(suffix.args?.args?.items.map((arg) =>
                        ctx.ToTast.Expression(arg, ctx),
                    ) ?? []),
                ],
                loc: {
                    ...suffix.loc,
                    start: target.loc.start,
                },
                arrow: true,
            },
            ctx,
        );
    },
    CallSuffix(suffix: p.CallSuffix, target: t.Expression, ctx: TCtx): Apply {
        return maybeAutoType(
            {
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
                arrow: false,
            },
            ctx,
        );
    },
};

export const maybeAutoType = (node: t.Apply, ctx: TCtx): t.Apply => {
    if (node.target.type === 'Ref' && node.target.kind.type === 'Unresolved') {
        const resolved = ctx.resolve(node.target.kind.text, null);
        const auto = chooseAutoTypable(node, node.target, resolved, ctx);
        if (auto) {
            return auto;
        }
    }
    const ttype = ctx.getType(node.target);
    if (ttype?.type === 'TVars' && ttype.inner.type === 'TLambda') {
        const argTypes = node.args.map((arg) => ctx.getType(arg));
        if (argTypes.every(Boolean)) {
            const auto = autoTypeApply(
                node,
                ttype.args,
                ttype.inner.args.map((t) => t.typ),
                argTypes as t.Type[],
                ctx,
            );
            if (auto) {
                // STOPSHIP(infer)
                // Object.keys(auto.constraints).forEach((key) => {
                //     ctx.addTypeConstraint(+key, auto.constraints[+key]);
                // });
                return auto.apply;
            }
        }
    }

    return node;
};

export const isOpText = (t: string) => !t.match(/^[a-zA-Z_$]/);

export const maybeParenedBinop = (v: p.Expression): p.WithUnary => {
    if (
        v.type === 'BinOp' ||
        v.type === 'Lambda' ||
        v.type === 'TypeAbstraction'
    ) {
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
    loc: p.Loc,
    showIds: boolean,
): p.Expression => {
    const opp: p.BinOpRight['op'] = {
        op: op.text,
        loc: op.loc,
        hash: showIds ? op.hash : null,
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
                loc,
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
                        loc: {
                            ...right.first.loc,
                            start: op.loc.start,
                        },
                        op: {
                            op: op.text,
                            loc: op.loc,
                            hash: showIds ? op.hash : null,
                            type: 'binopWithHash',
                        },
                    },
                    ...right.rest,
                ],
                loc,
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
                loc: {
                    ...right.loc,
                    start: op.loc.start,
                },
                op: {
                    op: op.text,
                    loc: op.loc,
                    hash: showIds ? op.hash : null,
                    type: 'binopWithHash',
                },
            },
        ],
        loc,
    };
};

export const makeApply = (
    inner: p.Expression,
    suffix: p.Suffix,
    loc: t.Loc,
    showIds: boolean,
    arrow = false,
): p.Expression => {
    if (
        arrow &&
        suffix.type === 'CallSuffix' &&
        suffix.args?.items.length &&
        inner.type === 'Identifier'
    ) {
        const ninner = suffix.args.items[0];
        suffix = {
            type: 'ArrowSuffix',
            args:
                suffix.args.items.length > 1
                    ? {
                          type: 'CallSuffix',
                          args: {
                              type: 'CommaExpr',
                              items: suffix.args.items.slice(1),
                              loc: suffix.args.loc,
                          },
                          loc: suffix.args.loc,
                      }
                    : null,
            loc: suffix.loc,
            name: inner,
        };
        inner = ninner;
    }
    if (
        inner.type === 'Identifier' &&
        isOpText(inner.text) &&
        suffix.type === 'CallSuffix' &&
        suffix.args &&
        suffix.args.items.length === 2
    ) {
        return makeBinop(
            inner,
            suffix.args.items[0],
            suffix.args.items[1],
            loc,
            showIds,
        );
    }
    if (inner.type === 'Apply') {
        return { ...inner, suffixes: inner.suffixes.concat([suffix]), loc };
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
        inner.type === 'Lambda' ||
        inner.type === 'TypeAbstraction'
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
    Apply({ target, args, loc, arrow }: Apply, ctx: TACtx): p.Expression {
        if (target.type === 'TypeApplication' && target.inferred) {
            const ttype = ctx.actx.getType(target.target);
            const argTypes = args.map((arg) => ctx.actx.getType(arg));
            if (
                argTypes.every(Boolean) &&
                ttype?.type === 'TVars' &&
                ttype.inner.type === 'TLambda'
            ) {
                const auto = autoTypeApply(
                    {
                        type: 'Apply',
                        loc,
                        args,
                        target: target.target,
                        arrow: false,
                    },
                    ttype.args,
                    ttype.inner.args.map((t) => t.typ),
                    argTypes as t.Type[],
                    ctx.actx,
                );
                if (auto) {
                    const targs = (auto.apply.target as t.TypeApplication).args;
                    if (
                        targs.length === target.args.length &&
                        targs.every(
                            (targ, i) =>
                                typeMatches(targ, target.args[i], ctx.actx) &&
                                typeMatches(target.args[i], targ, ctx.actx),
                        )
                    ) {
                        // STOPSHIP(infer)
                        // Object.keys(auto.constraints).forEach((key) => {
                        //     ctx.actx.addTypeConstraint(
                        //         +key,
                        //         auto.constraints[+key],
                        //     );
                        // });
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
                            ctx.showIds,
                            arrow,
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
            ctx.showIds,
            arrow,
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
            'never',
        );
    },
    ArrowSuffix(suffix: p.ArrowSuffix, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('->', suffix.loc),
                ctx.ToPP.Identifier(suffix.name, ctx),
                suffix.args ? ctx.ToPP.CallSuffix(suffix.args, ctx) : null,
            ],
            suffix.loc,
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
            args: args.map((arg) => ({
                expr: ctx.ToIR.Expression(arg, ctx),
                type: ctx.actx.getType(arg) ?? tnever,
            })),
            target: ctx.ToIR.Expression(target, ctx),
        };
    },
};

const equable = (a: t.Type, ctx: Ctx) => {
    switch (a.type) {
        case 'Number':
        case 'String':
            return true;
        case 'TRef':
            if (
                ctx.isBuiltinType(a, 'int') ||
                ctx.isBuiltinType(a, 'float') ||
                ctx.isBuiltinType(a, 'string') ||
                ctx.isBuiltinType(a, 'bool')
            ) {
                return true;
            }
    }
    return false;
};

import { Ctx as JCtx } from '../ir/to-js';
import * as b from '@babel/types';
import { findBuiltinName } from './base';
import { expandTask, tnever } from '../typing/tasks';
export const ToJS = {
    Apply({ target, args, loc }: t.IApply, ctx: JCtx): b.Expression {
        if (
            args.length === 2 &&
            target.type === 'Ref' &&
            target.kind.type === 'Global'
        ) {
            const name = findBuiltinName(target.kind.id, ctx.actx);
            if (name === '==' || name == '!=') {
                if (
                    !equable(args[0].type, ctx.actx) ||
                    !equable(args[1].type, ctx.actx)
                ) {
                    const inner = b.callExpression(
                        b.memberExpression(
                            b.identifier('$builtins'),
                            b.identifier('equal'),
                        ),
                        args.map((arg) => ctx.ToJS.IExpression(arg.expr, ctx)),
                    );
                    if (name === '!=') {
                        return b.unaryExpression('!', inner);
                    }
                    return inner;
                }
            }
            if (name && !name.match(/^[a-zA-Z_0-0]/)) {
                return b.binaryExpression(
                    name === '==' ? '===' : (name as any),
                    ctx.ToJS.IExpression(args[0].expr, ctx),
                    ctx.ToJS.IExpression(args[1].expr, ctx),
                );
            }
        }
        return b.callExpression(
            ctx.ToJS.IExpression(target, ctx),
            args.map((arg) => ctx.ToJS.IExpression(arg.expr, ctx)),
        );
    },
};

export const chooseAutoTypable = (
    node: t.Apply,
    target: t.Ref,
    resolved: t.RefKind[],
    ctx: Ctx,
) => {
    const argTypes = node.args.map((arg) => ctx.getType(arg));
    if (argTypes.every(Boolean)) {
        for (let option of resolved) {
            const ttype = ctx.getType({
                ...target,
                kind: option,
            });
            if (
                ttype?.type === 'TLambda' &&
                ttype.args.length === argTypes.length
            ) {
                // Will return 'null' if any types don't match
                const constraints = constraintsForApply(
                    argTypes as t.Type[],
                    ttype.args,
                    ctx,
                );
                if (constraints) {
                    // STOPSHIP(infer)
                    // Object.keys(constraints).forEach((key) => {
                    //     ctx.addTypeConstraint(+key, constraints[+key]);
                    // });
                    return {
                        ...node,
                        target: { ...target, kind: option },
                    };
                }
            }
            if (ttype?.type === 'TVars' && ttype.inner.type === 'TLambda') {
                const typed = autoTypeApply(
                    {
                        ...node,
                        target: { ...target, kind: option },
                    },
                    ttype.args,
                    ttype.inner.args.map((t) => t.typ),
                    argTypes as t.Type[],
                    ctx,
                );
                if (typed) {
                    // STOPSHIP(infer)
                    // Object.keys(typed.constraints).forEach((key) => {
                    //     ctx.addTypeConstraint(+key, typed.constraints[+key]);
                    // });
                    return typed.apply;
                }
            }
        }
    }
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    ApplyPost(node, { ctx, hit }) {
        if (
            node.target.type === 'Ref' &&
            node.target.kind.type === 'Unresolved'
        ) {
            const resolved = ctx.resolve(node.target.kind.text, null);
            if (resolved.length > 1) {
                const auto = chooseAutoTypable(
                    node,
                    node.target,
                    resolved,
                    ctx,
                );
                if (auto) {
                    return auto;
                }
            }
            // Check if there are multiples
            return null;
        }

        const ttype = ctx.getType(node.target);
        if (ttype?.type === 'TVars' && ttype.inner.type === 'TLambda') {
            const argTypes = node.args.map((arg) => ctx.getType(arg));
            if (argTypes.every(Boolean)) {
                const auto = autoTypeApply(
                    node,
                    ttype.args,
                    ttype.inner.args.map((t) => t.typ),
                    argTypes as t.Type[],
                    ctx,
                );
                if (auto) {
                    // STOPSHIP(infer)
                    // Object.keys(auto.constraints).forEach((key) => {
                    //     ctx.addTypeConstraint(+key, auto.constraints[+key]);
                    // });
                    return auto.apply;
                }
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
        // STOPSHIP(infer)
        // if (ttype.type === 'TVbl') {
        //     ttype = ctx.addTypeConstraint(ttype.id, {
        //         type: 'TLambda',
        //         args: argTypes.map((typ) => ({
        //             typ: typ ? typ : { type: 'TBlank', loc: node.loc },
        //             loc: typ?.loc ?? node.loc,
        //             label: null,
        //         })),
        //         loc: node.loc,
        //         result: { type: 'TBlank', loc: node.loc },
        //     });
        // }
        if (ttype.type !== 'TLambda') {
            if (ttype.type === 'TVars') {
                // return {
                //     ...node,
                //     target: {
                //         type: 'TypeApplication',
                //         loc: node.loc,
                //         target: node.target,
                //         inferred: true,
                //         args: ttype.args.map((t) => ({
                //             type: 'TBlank',
                //             loc: node.loc,
                //         })),
                //     },
                // };
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
            // STOPSHIP(infer)
            // if (at.type === 'TVbl') {
            //     at = ctx.addTypeConstraint(at.id, atype.args[i].typ);
            // }
            const constraints: { [key: number]: Constraints } = {};
            const expected = atype.args[i].typ;
            // hmm so 'unconstrained' would be a thing.
            if (!typeMatches(at, expected, ctx, [], constraints)) {
                changed = true;
                const taskEnum =
                    expected.type === 'TApply' &&
                    ctx.isBuiltinType(expected.target, 'Task')
                        ? expandTask(expected.loc, expected.args, ctx)
                        : null;
                ctx.debugger();
                typeMatches(at, expected, ctx);

                return decorate(arg, 'argWrongType', hit, ctx, [
                    {
                        label: 'expected',
                        arg: {
                            type: 'DType',
                            loc: noloc,
                            typ: atype.args[i].typ,
                        },
                        loc: noloc,
                    } as t.Decorator['args'][0],
                    {
                        label: 'got',
                        arg: {
                            type: 'DType',
                            loc: noloc,
                            typ: at,
                        },
                        loc: noloc,
                    } as t.Decorator['args'][0],
                    ...(taskEnum
                        ? [
                              {
                                  label: 'task',
                                  arg: {
                                      type: 'DType',
                                      loc: noloc,
                                      typ: taskEnum,
                                  },
                                  loc: noloc,
                              } as t.Decorator['args'][0],
                          ]
                        : []),
                ]);
            }
            Object.keys(constraints).forEach((k) => {
                ctx.addTypeConstraint(+k, constraints[+k]);
            });
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
    return t;
};

export const constraintsForApply = (
    argTypes: t.Type[],
    args: t.TLambda['args'],
    ctx: Ctx,
) => {
    let constraints: { [key: number]: Constraints } = {};
    for (let i = 0; i < argTypes.length; i++) {
        const argType = argTypes[i];
        const arg = args[i];
        // STOPSHIP(infer)
        // if (
        //     argType.type === 'TVbl' &&
        //     ctx.currentConstraints(argType.id).type === 'TBlank'
        // ) {
        //     if (constraints[argType.id] != null) {
        //         const t = constrainTypes(constraints[argType.id], arg.typ, ctx);
        //         if (t) {
        //             constraints[argType.id] = t;
        //             continue;
        //         } else {
        //             return null;
        //         }
        //     } else {
        //         constraints[argType.id] = arg.typ;
        //         continue;
        //     }
        // }
        if (!typeMatches(argType, arg.typ, ctx)) {
            return null;
        }
    }
    return constraints;
};

export const autoTypeApply = (
    node: t.Apply,
    vars: t.TVar[],
    args: t.Type[],
    argTypes: t.Type[],
    ctx: Ctx,
): null | { apply: t.Apply; constraints: { [key: number]: t.Type } } => {
    const mapping = inferVarsFromArgs(vars, args);
    if (!mapping) {
        return null;
    }
    let constraints: { [key: number]: t.Type } = {};
    for (let arg of vars) {
        if (!arg.bound) {
            continue;
        }

        const idxs = mapping[arg.sym.id];
        if (idxs.length === 1) {
            const argType = argTypes[idxs[0]];
            // STOPSHIP(infer)
            // if (
            //     argType.type === 'TVbl' &&
            //     ctx.currentConstraints(argType.id).type === 'TBlank'
            // ) {
            //     if (constraints[argType.id] != null) {
            //         const t = constrainTypes(
            //             constraints[argType.id],
            //             arg.bound,
            //             ctx,
            //         );
            //         if (t) {
            //             constraints[argType.id] = t;
            //             continue;
            //         }
            //     } else {
            //         constraints[argType.id] = arg.bound;
            //         continue;
            //     }
            // }
        }

        if (
            !typeMatches(
                unifiedTypes(argTypes, mapping[arg.sym.id], ctx),
                arg.bound,
                ctx,
            )
        ) {
            return null;
        }
    }
    return {
        apply: {
            ...node,
            target: {
                type: 'TypeApplication',
                target: node.target,
                inferred: true,
                args: vars.map((arg) =>
                    unifiedTypes(argTypes, mapping[arg.sym.id], ctx),
                ),
                loc: node.target.loc,
            },
        },
        constraints,
    };
};
