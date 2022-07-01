import { FullContext } from '../ctx';
import * as p from '../grammar/base.parser';
import * as t from '../typed-ast';
import { makeToAst, ToAst } from './to-ast.gen';
export { type ToAst } from './to-ast.gen';

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
};

export const printCtx = (fctx: FullContext, showIds: boolean = false): Ctx => {
    const backAliases: { [key: string]: string } = {};
    const aliases: { [key: string]: string } = {};

    const add = (name: string, ref: t.RefKind) => {
        let i = 2;
        let uniqueName = name;
        const key = t.refHash(ref);
        while (Object.hasOwn(backAliases, uniqueName)) {
            uniqueName = `${name}_${key.slice(0, i++)}`;
        }
        backAliases[uniqueName] = key;
        aliases[key] = uniqueName;
    };

    const ctx = fctx.extract();

    const reverse: { [key: string]: string } = {};
    Object.keys(ctx.values.names).forEach((name) => {
        ctx.values.names[name].forEach((ref) => {
            reverse[t.refHash(ref)] = name;
        });
    });
    const reverseType: { [key: string]: string } = {};
    Object.keys(ctx.types.names).forEach((name) => {
        reverseType[t.refHash(ctx.types.names[name])] = name;
    });
    const reverseDecorator: { [key: string]: string } = {};
    Object.keys(ctx.decorators.names).forEach((name) => {
        ctx.decorators.names[name].forEach((ref) => {
            reverseDecorator[t.refHash(ref)] = name;
        });
    });
    ctx.locals.forEach(({ types, values }) => {
        types.forEach(({ sym, bound }) => {
            reverseType[sym.id] = sym.name;
        });
    });

    const top = fctx.extract().toplevel;
    if (top?.type === 'Type') {
        top.items.forEach(({ name }, i) => {
            reverseType['r' + i] = name;
        });
    }

    return {
        aliases,
        backAliases,
        recordSym(sym, kind) {
            if (kind === 'value') {
                reverse[sym.id] = sym.name;
            } else {
                reverseType[sym.id] = sym.name;
            }
        },
        printSym(sym) {
            if (showIds) {
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
                    ? reverse[hash]
                    : kind === 'decorator'
                    ? reverseDecorator[hash]
                    : reverseType[hash];

            if (name && !showIds) {
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
