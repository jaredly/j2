import { Visitor } from '../transform-tast';
import { Ctx as ACtx } from '../typing/analyze';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { filterUnresolved } from './base';
import { TApply, TVars } from './type-vbls';

export const grammar = `
Type = TOps
TDecorated = decorators:(Decorator _)+ inner:TApply

TAtom = TRef / Number / String / TLambda / TVars / TParens / TEnum
TRef = text:($IdText) hash:($JustSym / $HashRef / $RecurHash / $BuiltinHash / $UnresolvedHash)?

TOps = left:TOpInner right_drop:TRight*
TRight = _ top:$top _ right:TOpInner
top = "-" / "+"
TOpInner = TDecorated / TApply

TParens = "(" _ inner:Type _ ")"

TArg = label:($IdText _ ":" _)? typ:Type
TArgs = first:TArg rest:( _ "," _ TArg)* _ ","? _
TLambda = "(" _ args:TArgs? ")" _ "=>" _ result:Type

TypeAlias = "type" _ first:TypePair rest:(_ "and" _ TypePair)*
TypePair = name:$IdText _ "=" _ typ:Type

`;

export type TOps = {
    type: 'TOps';
    left: Type;
    right: Array<{ top: '+' | '-'; right: Type }>;
    loc: t.Loc;
};

export type TRef = {
    type: 'TRef';
    ref: t.RefKind | t.UnresolvedRef;
    loc: t.Loc;
};

export type TDecorated = {
    type: 'TDecorated';
    loc: t.Loc;
    inner: Type;
    decorators: t.Decorator[];
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

export type Type =
    | TRef
    | TLambda
    | t.TEnum
    | t.Number
    | t.String
    | TVars
    | TDecorated
    | TApply
    | TOps;

// | TApply | TDecorated | TApply | TVars

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

export const asApply = (t: p.Type): p.TApply =>
    t.type === 'TDecorated' || t.type === 'TOps'
        ? {
              type: 'TParens',
              inner: t,
              loc: t.loc,
          }
        : t;

export const ToTast = {
    TypeAlias({ loc, items }: p.TypeAlias, ctx: TCtx): t.TypeAlias {
        return {
            type: 'TypeAlias',
            loc,
            elements: items.map((x) => {
                ctx.resetSym();
                return {
                    name: x.name,
                    type: ctx.ToTast[x.typ.type](x.typ as any, ctx),
                };
            }),
        };
    },
    TOps({ loc, left, right }: p.TOps_inner, ctx: TCtx): TOps {
        return {
            type: 'TOps',
            loc,
            left: ctx.ToTast[left.type](left as any, ctx),
            right: right.map((x) => ({
                top: x.top as '+' | '-',
                right: ctx.ToTast[x.right.type](x.right as any, ctx),
            })),
        };
    },
    TParens({ loc, inner }: p.TParens, ctx: TCtx): t.Type {
        return ctx.ToTast[inner.type](inner as any, ctx);
    },
    TDecorated(
        { loc, inner, decorators }: p.TDecorated,
        ctx: TCtx,
    ): TDecorated {
        return {
            type: 'TDecorated',
            loc,
            inner: ctx.ToTast[inner.type](inner as any, ctx),
            decorators: decorators.map((x) =>
                ctx.ToTast[x.type](x as any, ctx),
            ),
        };
    },
    TRef(type: p.TRef, ctx: TCtx): Type {
        const hash = filterUnresolved(type.hash?.slice(2, -1));
        const resolved = ctx.resolveType(type.text, hash);
        const res: TRef = {
            type: 'TRef',
            ref: resolved ?? {
                type: 'Unresolved',
                text: type.text,
                hash,
            },
            loc: type.loc,
        };
        return res;
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
    // TArgs({ args, loc }: p.TArgs, ctx: TCtx): t.TArgs {
    // }
};

export const ToAst = {
    TypeAlias({ elements, loc }: t.TypeAlias, ctx: TACtx): p.TypeAlias {
        return {
            type: 'TypeAlias',
            loc,
            items: elements.map(
                ({ name, type }): p.TypePair => ({
                    type: 'TypePair',
                    name: name,
                    typ: ctx.ToAst[type.type](type as any, ctx),
                    loc,
                }),
            ),
        };
    },
    TOps(type: TOps, ctx: TACtx): p.TOps_inner {
        return {
            type: 'TOps',
            loc: type.loc,
            left: asApply(ctx.ToAst[type.left.type](type.left as any, ctx)),
            right: type.right.map((x) => ({
                type: 'TRight',
                loc: type.loc,
                top: x.top as '+' | '-',
                right: asApply(ctx.ToAst[x.right.type](x.right as any, ctx)),
            })),
        };
    },
    TDecorated(type: TDecorated, ctx: TACtx): p.TDecorated {
        const inner = ctx.ToAst[type.inner.type](type.inner as any, ctx);
        const decorators = type.decorators.map((x) =>
            ctx.ToAst[x.type](x as any, ctx),
        );
        if (inner.type === 'TDecorated') {
            return {
                ...inner,
                decorators: decorators.concat(inner.decorators),
            };
        }
        if (inner.type === 'TOps') {
            return {
                type: 'TDecorated',
                loc: type.loc,
                inner: {
                    type: 'TParens',
                    loc: inner.loc,
                    inner,
                },
                decorators,
            };
        }
        return {
            type: 'TDecorated',
            loc: type.loc,
            inner,
            decorators,
        };
    },
    TRef({ ref, loc }: t.TRef, ctx: TACtx): p.TRef {
        const { text, hash } =
            ref.type === 'Unresolved'
                ? { text: ref.text, hash: '#[:unresolved:]' }
                : ctx.printRef(ref, loc, 'type');
        return {
            type: 'TRef',
            text,
            hash,
            loc,
        };
    },
    TLambda({ args, result, loc }: t.TLambda, ctx: TACtx): p.Type {
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
    String({ loc, text }: t.String): p.String {
        return { type: 'String', loc, text };
    },
};

export const ToPP = {
    TypeAlias({ items, loc }: p.TypeAlias, ctx: PCtx): pp.PP {
        const lines: pp.PP[] = [];
        items.forEach(({ name, typ, loc }, i) => {
            lines.push(
                pp.items(
                    [
                        pp.atom(i === 0 ? 'type ' : 'and ', loc),
                        pp.atom(name, typ.loc),
                        pp.atom(' = ', typ.loc),
                        ctx.ToPP[typ.type](typ as any, ctx),
                    ],
                    loc,
                ),
            );
        });

        return pp.items(lines, loc, 'always');
    },
    TOps(type: p.TOps_inner, ctx: PCtx): pp.PP {
        return pp.items(
            [
                ctx.ToPP[type.left.type](type.left as any, ctx),
                ...type.right.map((x) =>
                    pp.items(
                        [
                            pp.atom(' ' + x.top + ' ', x.loc),
                            ctx.ToPP[x.right.type](x.right as any, ctx),
                        ],
                        x.loc,
                    ),
                ),
            ],
            type.loc,
        );
    },
    TDecorated({ inner, decorators, loc }: p.TDecorated, ctx: PCtx): pp.PP {
        return pp.items(
            [
                ...decorators.map((x) => ctx.ToPP[x.type](x as any, ctx)),
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
    TParens({ inner, loc }: p.TParens, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.atom('(', loc),
                ctx.ToPP[inner.type](inner as any, ctx),
                pp.atom(')', loc),
            ],
            loc,
        );
    },
    TRef(type: p.TRef, ctx: PCtx): pp.PP {
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
