import * as p from '../../grammar/base.parser';
import { transformType } from '../../transform-tast';
import * as t from '../../typed-ast';
import { Ctx } from '../../typing/analyze';
import { ConstraintMap, typeMatches } from '../../typing/typeMatches';
import { unifyTypes } from '../../typing/unifyTypes';

export const grammar = `
Apply = target:Atom suffixes_drop:Suffix*
Suffix = CallSuffix / TypeApplicationSuffix / AwaitSuffix / ArrowSuffix
CallSuffix = "(" _ args:CommaExpr? ")"
CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _
ArrowSuffix = _ "->" _ name:Identifier types:TypeApplicationSuffix? args:CallSuffix?
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

import { Ctx as ICtx } from '../../ir/ir';
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

export const equable = (a: t.Type, ctx: Ctx) => {
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

import { tnever } from '../../typing/tasks';
import { autoTypeApply } from './autoTypeApply';
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
                    Object.keys(constraints).forEach((key) => {
                        ctx.addTypeConstraint(+key, constraints[+key]);
                    });
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
                    Object.keys(typed.constraints).forEach((key) => {
                        ctx.addTypeConstraint(+key, typed.constraints[+key]);
                    });
                    return typed.apply;
                }
            }
        }
    }
};

export const inferVarsFromArgs = (
    vars: t.TVar[],
    args: t.Type[],
    ctx: Ctx,
): null | { [key: number]: number[] } => {
    const mapping: { [sym: number]: false | number[] } = {};
    for (let v of vars) {
        mapping[v.sym.id] = false;
        // if the bound includes
        if (v.bound) {
            let hasOthers = false;
            transformType(
                v.bound,
                {
                    TRef(node, ctx) {
                        if (node.ref.type === 'Local') {
                            const sym = node.ref.sym;
                            if (vars.find((o) => o.sym.id === sym)) {
                                hasOthers = true;
                            }
                        }

                        return null;
                    },
                },
                null,
            );
            if (hasOthers) {
                return null;
            }
        }
    }
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
    let constraints: ConstraintMap = {};
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
        if (!typeMatches(argType, arg.typ, ctx, undefined, constraints)) {
            return null;
        }
    }
    return constraints;
};
