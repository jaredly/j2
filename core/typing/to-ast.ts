import { FullContext } from '../ctx';
import * as p from '../grammar/base.parser';
import * as t from '../typed-ast';
import { makeToAst, ToAst } from './to-ast.gen';
import { ToplevelConfig } from './to-tast';
export { type ToAst } from './to-ast.gen';
import { Ctx as ACtx } from './analyze';
import { toId } from '../ids';

export type Ctx = {
    printRef: (
        ref: t.RefKind,
        loc: p.Loc,
        kind: 'value' | 'type' | 'decorator',
    ) => p.Identifier;
    printSym: (sym: t.Sym) => { label: string; hash: string };
    ToAst: ToAst;
    recordSym: (sym: t.Sym, kind: 'value' | 'type') => void;
    aliases: { [key: string]: string };
    backAliases: { [key: string]: string };
    withToplevel: (t: ToplevelConfig | null) => Ctx;

    reverse: {
        decorators: { [key: string]: string };
        types: { [key: string]: string };
        values: { [key: string]: string };
    };
    actx: ACtx;
};

export const printCtx = (fctx: FullContext, showIds: boolean = false): Ctx => {
    const backAliases: { [key: string]: string } = {};
    const aliases: { [key: string]: string } = {};

    const add = (name: string, ref: t.RefKind) => {
        let i = 2;
        let uniqueName = name;
        const key = t.refHash(ref);
        // if (aliases[key])
        while (Object.hasOwn(backAliases, uniqueName)) {
            uniqueName = `${name}_${key.slice(0, i++)}`;
        }
        backAliases[uniqueName] = key;
        aliases[key] = uniqueName;
    };

    const ctx = fctx.extract();

    const reverse: Ctx['reverse'] = {
        decorators: {},
        types: {},
        values: {},
    };
    Object.keys(ctx.values.names).forEach((name) => {
        ctx.values.names[name].forEach((ref) => {
            reverse.values[t.refHash(ref)] = name;
        });
    });
    Object.keys(ctx.types.names).forEach((name) => {
        reverse.types[t.refHash(ctx.types.names[name])] = name;
    });
    Object.keys(ctx.decorators.names).forEach((name) => {
        ctx.decorators.names[name].forEach((ref) => {
            reverse.decorators[t.refHash(ref)] = name;
        });
    });
    ctx.locals.forEach(({ types, values }) => {
        types.forEach(({ sym, bound }) => {
            reverse.types[sym.id] = sym.name;
        });
    });

    // HM: I need the ctx to be able to register the
    // fact that we've just passed a new toplevel.

    // const top = fctx.extract().toplevel;
    // if (top?.type === 'Type') {
    //     top.items.forEach(({ name }, i) => {
    //         reverseType['r' + i] = name;
    //     });
    // }

    return {
        actx: fctx,
        reverse,

        withToplevel(top) {
            if (!top) {
                return this;
            }
            console.log(`with toplevel`, top);
            const reverse = {
                ...this.reverse,
                types: { ...this.reverse.types },
                values: { ...this.reverse.values },
            };
            if (top.type === 'Type') {
                top.items.forEach((item, i) => {
                    reverse.types[t.refHash({ type: 'Recur', idx: i })] =
                        item.name;
                    if (top.hash) {
                        reverse.types[
                            t.refHash({
                                type: 'Global',
                                id: toId(top.hash, i),
                            })
                        ] = item.name;
                    }
                });
            }
            if (top.type === 'Expr') {
                top.items.forEach((item, i) => {
                    reverse.values[t.refHash({ type: 'Recur', idx: i })] =
                        item.name;
                    if (top.hash) {
                        reverse.values[
                            t.refHash({
                                type: 'Global',
                                id: toId(top.hash, i),
                            })
                        ] = item.name;
                    }
                });
            }
            return { ...this, reverse };
        },
        aliases,
        backAliases,
        recordSym(sym, kind) {
            if (kind === 'value') {
                this.reverse.values[sym.id] = sym.name;
            } else {
                this.reverse.types[sym.id] = sym.name;
            }
        },
        printSym(sym) {
            if (showIds || true) {
                return { label: sym.name, hash: `#[${sym.id}]` };
            }
            const hash = '' + sym.id;
            if (!this.aliases[hash]) {
                add(sym.name, { type: 'Local', sym: sym.id });
            }
            return { label: this.aliases[hash], hash: '' };
        },
        printRef(ref, loc, kind) {
            const hash = t.refHash(ref);
            const name =
                kind === 'value'
                    ? this.reverse.values[hash]
                    : kind === 'decorator'
                    ? this.reverse.decorators[hash]
                    : this.reverse.types[hash];

            if (
                name &&
                !showIds &&
                ref.type !== 'Local' &&
                ref.type !== 'Recur'
            ) {
                if (!this.aliases[hash]) {
                    add(name, ref);
                }
                return {
                    type: 'Identifier',
                    text: this.aliases[hash],
                    hash: null,
                    loc,
                };
            }
            return {
                type: 'Identifier',
                text: name ?? 'unnamed',
                hash: `#[${hash}]`,
                loc,
            };
        },
        ToAst: makeToAst(),
    };
};
