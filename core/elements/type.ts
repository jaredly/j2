import { Visitor } from '../transform-tast';
import { Ctx as ACtx } from '../typing/analyze';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx, filterUnresolved } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';

export const grammar = `
Type = TRef / Number / String / TLambda / TVars
TRef = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?
TVars = "<" _ args:TBargs _ ">" inner:Type
TBargs = first:TBArg rest:(_ "," _ TBArg)* _ ","?
TBArg = label:$IdText hash:$JustSym? bound:(_ ":" _ Type)?

TArg = label:($IdText _ ":" _)? typ:Type
TArgs = first:TArg rest:( _ "," _ TArg)* _ ","? _
TLambda = "(" _ args:TArgs? ")" _ "=>" _ result:Type
`;

export type TRef = {
    type: 'TRef';
    ref: t.RefKind | t.UnresolvedRef;
    loc: t.Loc;
};

// Something<T>
export type TApply = {
    type: 'TApply';
    target: Type;
    args: Array<Type>;
    loc: t.Loc;
};

// OK also how do I do ... type bounds
// yeah that would be here.
// <T, I, K>Something
export type TVars = {
    type: 'TVars';
    args: Array<{ sym: t.Sym; bound: Type | null; loc: t.Loc }>;
    inner: Type;
    loc: t.Loc;
};

// (arg: int, arg2: float) => string
// NOTE that type arguments, and effect arguments,
// will have already been applied if you get to this point.
// TApply(TVars(TLambda)) => TLambda ... right?
// or is it ... an expression that applies the tvars and stuff. I think?
// Yeah, if you have
// const x = <T>(m) => n;
// x<T>(1)
// (ApplyType(x, T)) and the getType of the ApplyType will be the lambda.
export type TLambda = {
    type: 'TLambda';
    args: Array<{ label: string | null; typ: Type; loc: t.Loc }>;
    result: Type;
    loc: t.Loc;
};

// Ok so also, you can just drop an inline record declaration, right?

export type Type = TRef | TLambda | t.Number | t.String | TVars; // | TApply;
// | TDecorated | TApply | TVars

// Should I only allow local refs?
// hmm no.
// oh I can subtract numbers too rite
// export type TExpr = t.Number | t.String; // TAdd | TSub | TOr | ;

export type TAdd = { type: 'TAdd'; elements: Array<Type>; loc: t.Loc };
export type TSub = { type: 'TSub'; elements: Array<Type>; loc: t.Loc };
export type TOr = { type: 'TOr'; elements: Array<Type>; loc: t.Loc };

/// and ... something about instantiating a record? Although that might get into
// the realm of "where"s. Yeah I think it would.

// (T -> T) -> T // hm that would be Kinds yep.

export const ToTast = {
    // Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
    // },
    TRef(type: p.TRef, ctx: TCtx): t.TRef {
        const hash = filterUnresolved(type.hash?.slice(2, -1));
        const resolved = ctx.resolveType(type.text, hash);
        return {
            type: 'TRef',
            ref: resolved ?? {
                type: 'Unresolved',
                text: type.text,
                hash,
            },
            loc: type.loc,
        };
    },
    String({ type, loc, text }: p.String, ctx: TCtx): t.String {
        return { type: 'String', loc, text };
    },
    TLambda({ args, result, loc }: p.TLambda, ctx: TCtx): t.TLambda {
        return {
            type: 'TLambda',
            args:
                args?.items.map(({ label, typ, loc }) => ({
                    typ: ctx.ToTast[typ.type](typ as any, ctx),
                    label,
                    loc,
                })) ?? [],
            loc,
            result: ctx.ToTast[result.type](result as any, ctx),
        };
    },
    TVars({ args, inner, loc }: p.TVars, ctx: TCtx): t.TVars {
        // TODO later args can refer to previous ones.
        const targs = args.items.map(({ label, hash, bound, loc }) => {
            const sym = hash
                ? { name: label, id: +hash.slice(2, -1) }
                : ctx.sym(label);
            return {
                sym,
                bound: bound ? ctx.ToTast[bound.type](bound as any, ctx) : null,
                loc,
            };
        });
        return {
            type: 'TVars',
            args: targs,
            inner: ctx.ToTast[inner.type](
                inner as any,
                ctx.withLocalTypes(targs),
            ),
            loc,
        };
    },
    // TArgs({ args, loc }: p.TArgs, ctx: TCtx): t.TArgs {
    // }
};

export const ToAst = {
    TVars(type: t.TVars, ctx: TACtx): p.TVars {
        type.args.forEach((arg) => ctx.recordSym(arg.sym, 'type'));
        return {
            type: 'TVars',
            args: {
                type: 'TBargs',
                loc: type.loc,
                items: type.args.map(({ sym, bound, loc }) => ({
                    type: 'TBArg',
                    label: sym.name,
                    hash: `#[${sym.id}]`,
                    bound: bound
                        ? ctx.ToAst[bound.type](bound as any, ctx)
                        : null,
                    loc,
                })),
            },
            inner: ctx.ToAst[type.inner.type](type.inner as any, ctx),
            loc: type.loc,
        };
    },
    TRef({ type, ref, loc }: t.TRef, ctx: TACtx): p.TRef {
        const { text, hash } =
            ref.type === 'Unresolved'
                ? { text: ref.text, hash: '#[:unresolved:]' }
                : ctx.printRef(ref, loc, 'type');
        return { type: 'TRef', text, hash, loc };
    },
    TLambda({ type, args, result, loc }: t.TLambda, ctx: TACtx): p.Type {
        return {
            type: 'TLambda',
            args: {
                items: args.map(({ label, typ, loc }) => ({
                    type: 'TArg',
                    label,
                    typ: ctx.ToAst[typ.type](typ as any, ctx),
                    loc,
                })),
                type: 'TArgs',
                loc,
            },
            result: ctx.ToAst[result.type](result as any, ctx),
            loc,
        };
    },
    String({ type, loc, text }: t.String): p.String {
        return { type: 'String', loc, text };
    },
};

export const ToPP = {
    TVars({ args, inner, loc }: p.TVars, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.args(
                    args.items.map(({ label, hash, bound, loc }) =>
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
    TLambda({ args, result, loc }: p.TLambda, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.args(
                    args?.items.map((arg) =>
                        pp.items(
                            [
                                arg.label
                                    ? pp.items(
                                          [
                                              pp.atom(arg.label, arg.loc),
                                              pp.atom(': ', arg.loc),
                                          ],
                                          arg.loc,
                                      )
                                    : null,
                                ctx.ToPP[arg.typ.type](arg.typ as any, ctx),
                            ],
                            loc,
                        ),
                    ) ?? [],
                    args?.loc ?? loc,
                ),
                pp.atom(' => ', loc),
                ctx.ToPP[result.type](result as any, ctx),
            ],
            loc,
        );
    },
    TRef(type: p.TRef, ctx: PCtx): pp.PP {
        if (ctx.hideIds) {
            return pp.atom(type.text, type.loc);
        }
        return pp.atom(type.text + (type.hash ?? ''), type.loc);
    },
    String(type: p.String, ctx: PCtx): pp.PP {
        return pp.atom(`"${type.text}"`, type.loc);
    },
};

export const analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
