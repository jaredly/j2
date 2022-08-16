import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';

export const grammar = `
TApply = inner:TAtom args_drop:(_ "<" _ TComma _ ">")*
TComma = first:Type rest:(_ "," _ Type)* _ ","?

TVars = "<" _ args:TBargs _ ">" inner:Type
TBargs = first:TBArg rest:(_ "," _ TBArg)* _ ","?
TBArg = label:$IdText hash:$JustSym? bound:(_ ":" _ Type)? default_:(_ "=" _ Type)?
`;

// Something<T>
export type TApply = {
    type: 'TApply';
    target: t.Type;
    args: Array<t.Type>;
    loc: t.Loc;
};

export type TVar = {
    sym: t.Sym;
    bound: t.Type | null;
    loc: t.Loc;
    default_: t.Type | null;
};

// OK also how do I do ... type bounds
// yeah that would be here.
// <T, I, K>Something
export type TVars = {
    type: 'TVars';
    args: Array<TVar>;
    inner: t.Type;
    loc: t.Loc;
};

export const ToTast = {
    TApply(type: p.TApply_inner, ctx: TCtx): t.Type {
        let inner = ctx.ToTast.Type(type.inner, ctx);
        if (!type.args.length) {
            return inner;
        }
        const args = type.args.slice();
        while (args.length) {
            const next = args.shift()!;
            inner = {
                type: 'TApply',
                target: inner,
                loc: type.loc,
                args: next.items.map((arg) => ctx.ToTast.Type(arg, ctx)) ?? [],
            };
        }
        return inner;
    },
    TBArg({ label, hash, bound, default_, loc }: p.TBArg, ctx: TCtx): TVar {
        const sym = hash
            ? { name: label, id: +hash.slice(2, -1), loc }
            : ctx.sym(label, loc);
        return {
            sym,
            bound: bound ? ctx.ToTast.Type(bound, ctx) : null,
            default_: default_ ? ctx.ToTast.Type(default_, ctx) : null,
            loc,
        };
    },
    TVars({ args, inner, loc }: p.TVars, ctx: TCtx): t.TVars {
        // TODO later args can refer to previous ones in their `bound`
        // e.g <T, A: T>xyz
        const targs = args.items.map((arg) => {
            const targ = ctx.ToTast.TBArg(arg, ctx);
            ctx = ctx.withLocalTypes([targ]);
            return targ;
        });
        return {
            type: 'TVars',
            args: targs,
            inner: ctx.ToTast.Type(inner, ctx),
            loc,
        };
    },
};

export const Analyze: Visitor<{ ctx: Ctx; hit: {} }> = {
    TVars(node, ctx) {
        let innerCtx = ctx.ctx.withLocalTypes(node.args);
        return [null, { ...ctx, ctx: innerCtx }];
    },
};

export const ToAst = {
    TApply({ target, args, loc }: TApply, ctx: TACtx): p.TApply_inner {
        const inner: p.Type = ctx.ToAst.Type(target, ctx);
        const targs: p.TComma = {
            type: 'TComma',
            loc,
            items: args.map((arg) => ctx.ToAst.Type(arg, ctx)),
        };
        if (inner.type === 'TApply') {
            return { ...inner, args: inner.args.concat([targs]) };
        }
        const in2: p.TAtom =
            inner.type === 'TDecorated' ||
            inner.type === 'TOps' ||
            inner.type === 'TVars'
                ? {
                      type: 'TParens',
                      items: { type: 'TComma', items: [inner], loc },
                      loc,
                      open: null,
                  }
                : inner;
        return {
            type: 'TApply',
            inner: in2,
            args: [targs],
            loc,
        };
    },

    TVars(type: t.TVars, ctx: TACtx): p.TVars {
        type.args.forEach((arg) => ctx.recordSym(arg.sym, 'type'));
        return {
            type: 'TVars',
            args: {
                type: 'TBargs',
                loc: type.loc,
                items: type.args.map((arg) => ctx.ToAst.TBArg(arg, ctx)),
            },
            inner: ctx.ToAst.Type(type.inner, ctx),
            loc: type.loc,
        };
    },
    TBArg({ sym, bound, default_, loc }: t.TVar, ctx: TACtx): p.TBArg {
        return {
            type: 'TBArg',
            ...ctx.printSym(sym),
            // label: sym.name,
            // hash: `#[${sym.id}]`,
            default_: default_ ? ctx.ToAst.Type(default_, ctx) : null,
            bound: bound ? ctx.ToAst.Type(bound, ctx) : null,
            loc,
        };
    },
};

export const ToPP = {
    TVars({ args, inner, loc }: p.TVars, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.args(
                    args.items.map((arg) => ctx.ToPP.TBArg(arg, ctx)),
                    loc,
                    '<',
                    '>',
                ),
                ctx.ToPP.Type(inner, ctx),
            ],
            loc,
        );
    },
    TBArg({ label, hash, bound, default_, loc }: p.TBArg, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.atom(label, loc),
                pp.atom(hash, loc),
                bound
                    ? pp.items(
                          [pp.atom(': ', loc), ctx.ToPP.Type(bound, ctx)],
                          loc,
                      )
                    : null,
                default_
                    ? pp.items(
                          [pp.atom(' = ', loc), ctx.ToPP.Type(default_, ctx)],
                          loc,
                      )
                    : null,
            ],
            loc,
        );
    },
    TApply({ args, inner, loc }: p.TApply_inner, ctx: PCtx): pp.PP {
        const pinner = ctx.ToPP.Type(inner, ctx);
        return pp.items(
            [
                // inner.type === 'TVars'
                pinner,
                ...args.map(({ items, loc }) =>
                    pp.args(
                        items.map((arg) => ctx.ToPP.Type(arg, ctx)),
                        loc,
                        '<',
                        '>',
                    ),
                ),
            ],
            loc,
        );
    },
};
