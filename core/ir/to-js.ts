import * as b from '@babel/types';
import { ToJS, makeToJS } from './to-js.gen';
import { Ctx as ACtx } from '../typing/analyze';
import { FullContext } from '../ctx';
import { Expression } from '../typed-ast';
import { iCtx } from './ir';
import generate from '@babel/generator';

export type Ctx = {
    ToJS: ToJS;
    actx: ACtx;
};

export const jCtx = (actx: ACtx): Ctx => ({ ToJS: makeToJS(), actx });

export type ExecutionContext = {
    ctx: FullContext;
    // I wonder .. should 'unit' evaluate to 'null'?
    // kinda might as well, idk
    terms: { [key: string]: any };
    execute(expr: Expression): any;
};

export const newExecutionContext = (ctx: FullContext) => {
    return {
        ctx,
        terms: {},
        execute(expr: Expression) {
            const ictx = iCtx();
            const ir = ictx.ToIR.BlockSt(
                {
                    type: 'Block',
                    stmts: [expr],
                    loc: expr.loc,
                },
                ictx,
            );
            const jctx = jCtx(ctx);
            const js = jctx.ToJS.Block(ir, jctx);
            const jsraw = generate(js).code;
            console.log(jsraw);
            try {
                const f = new Function('$terms', jsraw);
                return f(this.terms);
            } catch (err) {
                throw new Error(jsraw, { cause: err as Error });
            }
        },
    };
};
