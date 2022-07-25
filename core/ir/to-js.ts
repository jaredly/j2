import * as b from '@babel/types';
import { ToJS, makeToJS } from './to-js.gen';
import { Ctx as ACtx } from '../typing/analyze';
import { FullContext } from '../ctx';
import { Expression, Id } from '../typed-ast';
import { iCtx } from './ir';
import generate from '@babel/generator';
import { idToString } from '../ids';

export type Ctx = {
    namespaced: boolean;
    ToJS: ToJS;
    actx: ACtx;
    globalName(id: Id): string;
    addGlobalName(id: Id, name: string): string;
};

export const jCtx = (actx: ACtx, namespaced = true): Ctx => {
    const names: { [key: string]: string } = {};
    const used: { [key: string]: true } = {};
    return {
        namespaced,
        ToJS: makeToJS(),
        actx,
        globalName(id) {
            const key = idToString(id);
            if (names[key]) {
                return names[key];
            }
            return this.addGlobalName(id, 'unnamed');
        },
        addGlobalName(id, name) {
            const key = idToString(id);
            if (names[key]) {
                return names[key];
            }
            if (!used[name]) {
                used[name] = true;
                return (names[key] = name);
            }
            for (let i = 0; i < key.length; i++) {
                const n = name + '_' + key.slice(0, i);
                if (!used[n]) {
                    used[n] = true;
                    return (names[key] = n);
                }
            }
            throw new Error(`Unable to find unique name for ${key} : ${name}`);
        },
    };
};

export type ExecutionContext = {
    ctx: FullContext;
    // I wonder .. should 'unit' evaluate to 'null'?
    // kinda might as well, idk
    terms: { [key: string]: any };
    execute(expr: Expression): any;
};

export const newExecutionContext = (ctx: FullContext): ExecutionContext => {
    return {
        ctx,
        terms: {},
        execute(expr: Expression) {
            const ictx = iCtx(ctx);
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
            // console.log(jsraw);
            try {
                const f = new Function('$terms', jsraw);
                return f(this.terms);
            } catch (err) {
                throw new Error(jsraw, { cause: err as Error });
            }
        },
    };
};
