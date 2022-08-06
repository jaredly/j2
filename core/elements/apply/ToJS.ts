import * as t from '../../typed-ast';
import { Ctx as JCtx } from '../../ir/to-js';
import * as b from '@babel/types';
import { findBuiltinName } from '../base';
import { equable } from './apply';

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
