import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { transformType, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { applyType } from '../typing/getType';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TMCtx, typeMatches } from '../typing/typeMatches';

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
        let inner = ctx.ToTast[type.inner.type](type.inner as any, ctx);
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
                args:
                    next.items.map((arg) =>
                        ctx.ToTast[arg.type](arg as any, ctx),
                    ) ?? [],
            };
        }
        return inner;
    },
    TBArg({ label, hash, bound, default_, loc }: p.TBArg, ctx: TCtx): TVar {
        const sym = hash
            ? { name: label, id: +hash.slice(2, -1) }
            : ctx.sym(label);
        return {
            sym,
            bound: bound ? ctx.ToTast[bound.type](bound as any, ctx) : null,
            default_: default_
                ? ctx.ToTast[default_.type](default_ as any, ctx)
                : null,
            loc,
        };
    },
    TVars({ args, inner, loc }: p.TVars, ctx: TCtx): t.TVars {
        // TODO later args can refer to previous ones in their `bound`
        // e.g <T, A: T>xyz
        const targs = args.items.map((arg) =>
            ctx.ToTast[arg.type](arg as any, ctx),
        );
        let innerCtx = ctx.withLocalTypes(targs);
        return {
            type: 'TVars',
            args: targs,
            inner: innerCtx.ToTast[inner.type](inner as any, innerCtx),
            loc,
        };
    },
};

export const ToAst = {
    TApply({ target, args, loc }: TApply, ctx: TACtx): p.TApply_inner {
        const inner: p.Type = ctx.ToAst[target.type](target as any, ctx);
        const targs: p.TComma = {
            type: 'TComma',
            loc,
            items: args.map((arg) => ctx.ToAst[arg.type](arg as any, ctx)),
        };
        if (inner.type === 'TApply') {
            return { ...inner, args: inner.args.concat([targs]) };
        }
        const in2: p.TAtom =
            inner.type === 'TDecorated' ||
            inner.type === 'TOps' ||
            inner.type === 'TVars'
                ? { type: 'TParens', inner: inner, loc }
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
                items: type.args.map(
                    ({ sym, bound, default_, loc }): p.TBArg => ({
                        type: 'TBArg',
                        ...ctx.printSym(sym),
                        // label: sym.name,
                        // hash: `#[${sym.id}]`,
                        default_: default_
                            ? ctx.ToAst[default_.type](default_ as any, ctx)
                            : null,
                        bound: bound
                            ? ctx.ToAst[bound.type](bound as any, ctx)
                            : null,
                        loc,
                    }),
                ),
            },
            inner: ctx.ToAst[type.inner.type](type.inner as any, ctx),
            loc: type.loc,
        };
    },
};

export const ToPP = {
    TVars({ args, inner, loc }: p.TVars, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.args(
                    args.items.map(({ label, hash, bound, default_, loc }) =>
                        pp.items(
                            [
                                pp.atom(label, loc),
                                pp.atom(hash, loc),
                                bound
                                    ? pp.items(
                                          [
                                              pp.atom(': ', loc),
                                              ctx.ToPP[bound.type](
                                                  bound as any,
                                                  ctx,
                                              ),
                                          ],
                                          loc,
                                      )
                                    : null,
                                default_
                                    ? pp.items(
                                          [
                                              pp.atom(' = ', loc),
                                              ctx.ToPP[default_.type](
                                                  default_ as any,
                                                  ctx,
                                              ),
                                          ],
                                          loc,
                                      )
                                    : null,
                            ],
                            loc,
                        ),
                    ),
                    loc,
                    '<',
                    '>',
                ),
                ctx.ToPP[inner.type](inner as any, ctx),
            ],
            loc,
        );
    },
    TApply({ args, inner, loc }: p.TApply_inner, ctx: PCtx): pp.PP {
        const pinner = ctx.ToPP[inner.type](inner as any, ctx);
        return pp.items(
            [
                // inner.type === 'TVars'
                pinner,
                ...args.map(({ items, loc }) =>
                    pp.args(
                        items.map((arg) => ctx.ToPP[arg.type](arg as any, ctx)),
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

export const tvarsMatches = (
    candidate: TVars,
    expected: t.Type,
    ctx: TMCtx,
) => {
    if (
        expected.type !== 'TVars' ||
        expected.args.length !== candidate.args.length ||
        !expected.args.every(
            // True if the bounds align
            (arg, i) => {
                const carg: TVar = (candidate as TVars).args[i];
                if (!arg.bound) {
                    return !carg.bound;
                }
                if (!carg.bound) {
                    return true; // bounded is a subset of unbounded
                }

                // REVERSED! For Variance
                return typeMatches(arg.bound, carg.bound!, ctx);
            },
        )
    ) {
        console.log('bad args');
        return false;
    }
    let maxSym = 0;
    const visit: Visitor<null> = {
        TRef(node) {
            if (node.ref.type === 'Local') {
                maxSym = Math.max(maxSym, node.ref.sym);
            }
            return null;
        },
        TVar(node, ctx) {
            maxSym = Math.max(maxSym, node.sym.id);
            return null;
        },
    };
    transformType(expected, visit, null);
    transformType(candidate, visit, null);
    const bounds: { [key: number]: t.Type | null } = {};
    let newTypes: t.TRef[] = expected.args.map((arg, i) => {
        const sym = maxSym + i + 1;
        bounds[sym] = arg.bound;
        return {
            type: 'TRef',
            loc: noloc,
            ref: { type: 'Local', sym: sym },
        };
    });
    ctx = ctx.withBounds(bounds);
    const capp = applyType(newTypes, candidate, ctx);
    const eapp = applyType(newTypes, expected, ctx);
    // Ohhhhhhhh failed to find bound.
    // console.log(newTypes);
    // console.log('applied=in', capp, eapp);
    return capp != null && eapp != null && typeMatches(capp, eapp, ctx);
};
