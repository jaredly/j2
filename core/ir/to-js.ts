import * as b from '@babel/types';
import { ToJS, makeToJS } from './to-js.gen';
import { Ctx as ACtx } from '../typing/analyze';
import { FullContext } from '../ctx';
import { Expression, Id } from '../typed-ast';
import { iCtx } from './ir';
import generate from '@babel/generator';
import { idToString } from '../ids';
import equal from 'fast-deep-equal';

export type Ctx = {
    namespaced: boolean;
    ToJS: ToJS;
    actx: ACtx;
    globalName(id: Id): string;
    addGlobalName(id: Id, name: string): string;
};

export type NameTrack = {
    names: { [key: string]: string };
    used: { [key: string]: true };
};

export const jCtx = (
    actx: ACtx,
    namespaced = true,
    useTrack?: NameTrack,
): Ctx => {
    const track = useTrack ?? { names: {}, used: {} };
    return {
        namespaced,
        ToJS: makeToJS(),
        actx,
        globalName(id) {
            const key = idToString(id);
            if (track.names[key]) {
                return track.names[key];
            }
            return this.addGlobalName(id, 'unnamed');
        },
        addGlobalName(id, name) {
            const key = idToString(id);
            if (track.names[key]) {
                return track.names[key];
            }
            if (!track.used[name]) {
                track.used[name] = true;
                return (track.names[key] = name);
            }
            for (let i = 0; i < key.length; i++) {
                const n = name + '_' + key.slice(0, i);
                if (!track.used[n]) {
                    track.used[n] = true;
                    return (track.names[key] = n);
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
    executeJs(js: b.BlockStatement, name?: string, hash?: string): any;
    execute(expr: Expression): any;
};

const withHandler = (
    { tag, payload }: { tag: string; payload: [any, Function | null] },
    handler: Function,
) =>
    tag === 'Return'
        ? { tag, payload }
        : {
              tag,
              payload: [
                  payload[0],
                  payload[1] ? (x: any) => handler(payload[1]!(x)) : null,
              ],
          };

// and ...

const andThen = (
    { tag, payload }: { tag: string; payload: any },
    next: (v: any) => any,
) => {
    return tag === 'Return'
        ? next(payload)
        : {
              tag,
              payload: [
                  payload[0],
                  payload[1] ? (x: any) => andThen(payload[1](x), next) : null,
              ],
          };
};

type IO<R> =
    | { tag: 'Read'; payload: [null, (v: string) => IO<R>] }
    | {
          tag: 'Print';
          payload: [string, (x: null) => IO<R>];
      }
    | {
          tag: 'Return';
          payload: R;
      };
const testIO = <T>(read: string, task: IO<T>): T => {
    // console.log('TESTIO', task);
    if (task.tag === 'Read') {
        return testIO(read, task.payload[1](read));
    } else if (task.tag === 'Print') {
        console.log(task.payload[0]);
        return testIO(read, task.payload[1](null));
    } else {
        return task.payload;
    }
};

const builtins = {
    andThen,
    withHandler,
    testIO,
    equal,
    isSquare: (v: number) => Math.sqrt(v) % 1 === 0,
    toString: (v: any) => '' + v,
};

export const newExecutionContext = (ctx: FullContext): ExecutionContext => {
    return {
        ctx,
        terms: {},
        executeJs(expr: b.BlockStatement, name?: string, hash?: string) {
            const jsraw =
                generate(expr).code +
                '\n//# sourceURL=' +
                (name ?? 'unnamed') +
                '_' +
                (hash ?? Math.random());
            let f;
            try {
                f = new Function('$terms', `$builtins`, jsraw);
            } catch (err) {
                throw new Error(
                    `Syntax probably: ${(err as Error).message}\n` + jsraw,
                    {
                        cause: err as Error,
                    },
                );
            }
            let res;
            try {
                res = f(this.terms, builtins);
            } catch (err) {
                // console.log(this.terms);
                throw new Error(
                    `Exec Error: ${(err as Error).message}\n` + jsraw,
                    {
                        cause: err as Error,
                    },
                );
            }
            if (name) {
                this.terms[name] = res;
            }
            return res;
        },
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
