import { Visitor } from '../transform-tast';
import { Ctx as ACtx, tdecorate } from '../typing/analyze';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { filterUnresolved, typeToplevel, typeToplevelT } from './base';
import { TApply, TVars } from './type-vbls';
import { FullContext } from '../ctx';
import { justStringAdds, numOps } from '../typing/ops';

export const grammar = `
Type = TOps
TDecorated = decorators:(Decorator _)+ inner:TApply

TAtom = TConst / TBlank / TRef / Number / String / TLambda / TVars / TParens / TEnum / TRecord
TRef = text:($IdText) hash:($JustSym / $HashRef / $RecurHash / $BuiltinHash / $UnresolvedHash)?

TConst = "const" __ inner:TAtom

TOps = left:TOpInner right_drop:TRight*
TRight = _ top:$top _ right:TOpInner
top = "-" / "+"
TOpInner = TDecorated / TApply

TParens = "(" _ items:TComma? open:(_ "*")? _ ")"

TArg = label:($IdText _ ":" _)? typ:Type
TArgs = first:TArg rest:( _ "," _ TArg)* _ ","? _
TLambda = "(" _ args:TArgs? ")" _ "=>" _ result:Type

TypeAlias = "type" _ first:TypePair rest:(_ "and" _ TypePair)*
TypePair = name:$IdText _ "=" _ typ:Type

TBlank = pseudo:"_"

`;

export type TConst = {
    type: 'TConst';
    inner: Type;
    loc: t.Loc;
};

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

export type TVbl = {
    type: 'TVbl';
    id: number;
    loc: t.Loc;
};

// Unconstrained
export type TBlank = {
    type: 'TBlank';
    loc: t.Loc;
};

export type Type =
    | TRef
    | TVbl
    | TBlank
    | TLambda
    | t.TEnum
    | t.Number
    | t.String
    | TVars
    | TConst
    | TApply
    | t.TRecord
    | TDecorated
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
              items: { type: 'TComma', items: [t], loc: t.loc },
              loc: t.loc,
              open: null,
          }
        : t;

export const ToTast = {
    TBlank({ type, loc }: p.TBlank, ctx: TCtx): t.Type {
        return ctx.newTypeVar(loc);
    },
    TConst({ type, inner, loc }: p.TConst, ctx: TCtx): TConst {
        return {
            type: 'TConst',
            inner: ctx.ToTast.Type(inner, ctx),
            loc,
        };
    },
    TypeAlias({ loc, items }: p.TypeAlias, ctx: TCtx): t.TypeAlias {
        return {
            type: 'TypeAlias',
            loc,
            elements: items.map((x) => {
                // ctx.resetSym();
                return {
                    name: x.name,
                    type: ctx.ToTast.Type(x.typ, ctx),
                };
            }),
        };
    },
    TOps({ loc, left, right }: p.TOps_inner, ctx: TCtx): TOps {
        return {
            type: 'TOps',
            loc,
            left: ctx.ToTast.Type(left, ctx),
            right: right.map((x) => ({
                top: x.top as '+' | '-',
                right: ctx.ToTast.Type(x.right, ctx),
            })),
        };
    },
    TParens({ loc, items, open }: p.TParens, ctx: TCtx): t.Type {
        if (items?.items.length === 1) {
            return ctx.ToTast.Type(items.items[0], ctx);
        }
        return {
            type: 'TRecord',
            loc,
            spreads: [],
            items:
                items?.items.map((x, i) => ({
                    type: 'TRecordKeyValue',
                    key: i.toString(),
                    default_: null,
                    value: ctx.ToTast.Type(x, ctx),
                    loc: x.loc,
                })) ?? [],
            open: !!open,
        };
    },
    TDecorated(
        { loc, inner, decorators }: p.TDecorated,
        ctx: TCtx,
    ): TDecorated {
        return {
            type: 'TDecorated',
            loc,
            inner: ctx.ToTast.Type(inner, ctx),
            decorators: decorators.map((x) => ctx.ToTast.Decorator(x, ctx)),
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
                    typ: ctx.ToTast.Type(typ, ctx),
                    label,
                    loc,
                })) ?? [],
            loc,
            result: ctx.ToTast.Type(result, ctx),
        };
    },
    // TArgs({ args, loc }: p.TArgs, ctx: TCtx): t.TArgs {
    // }
};

export const ToAst = {
    TBlank(blank: t.TBlank, ctx: TACtx): p.TBlank {
        return { ...blank, pseudo: '_' };
    },
    TConst(constant: t.TConst, ctx: TACtx): p.TConst {
        let inner = ctx.ToAst.Type(constant.inner, ctx);
        if (
            inner.type === 'TOps' ||
            inner.type === 'TDecorated' ||
            inner.type === 'TApply'
        ) {
            inner = {
                type: 'TParens',
                items: { type: 'TComma', items: [inner], loc: constant.loc },
                loc: constant.loc,
                open: null,
            };
        }
        return {
            type: 'TConst',
            inner,
            loc: constant.loc,
        };
    },
    TypeAlias({ elements, loc }: t.TypeAlias, ctx: TACtx): p.TypeAlias {
        return {
            type: 'TypeAlias',
            loc,
            items: elements.map(
                ({ name, type }): p.TypePair => ({
                    type: 'TypePair',
                    name: name,
                    typ: ctx.ToAst.Type(type, ctx),
                    loc,
                }),
            ),
        };
    },
    TOps(type: TOps, ctx: TACtx): p.TOps_inner {
        return {
            type: 'TOps',
            loc: type.loc,
            left: asApply(ctx.ToAst.Type(type.left, ctx)),
            right: type.right.map((x) => ({
                type: 'TRight',
                loc: type.loc,
                top: x.top as '+' | '-',
                right: asApply(ctx.ToAst.Type(x.right, ctx)),
            })),
        };
    },
    TDecorated(type: TDecorated, ctx: TACtx): p.TDecorated {
        const inner = ctx.ToAst.Type(type.inner, ctx);
        const decorators = type.decorators.map((x) =>
            ctx.ToAst.Decorator(x, ctx),
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
                    items: { type: 'TComma', items: [inner], loc: inner.loc },
                    open: '',
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
                    typ: ctx.ToAst.Type(typ, ctx),
                    loc,
                })),
                type: 'TArgs',
                loc,
            },
            result: ctx.ToAst.Type(result, ctx),
            loc,
        };
    },
    String({ loc, text }: t.String, ctx: TACtx): p.String {
        return { type: 'String', loc, text };
    },
};

export const ToPP = {
    TBlank({ loc }: p.TBlank, ctx: PCtx): pp.PP {
        return pp.atom('_', loc);
    },
    TConst({ inner, loc }: p.TConst, ctx: PCtx): pp.PP {
        return pp.items(
            [pp.atom('const ', loc), ctx.ToPP.Type(inner, ctx)],
            loc,
        );
    },
    TypeAlias({ items, loc }: p.TypeAlias, ctx: PCtx): pp.PP {
        const lines: pp.PP[] = [];
        items.forEach(({ name, typ, loc }, i) => {
            lines.push(
                pp.items(
                    [
                        pp.atom(i === 0 ? 'type ' : 'and ', loc),
                        pp.atom(name, typ.loc),
                        pp.atom(' = ', typ.loc),
                        ctx.ToPP.Type(typ, ctx),
                        // i === items.length - 1 ? pp.atom(';', loc) : null,
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
                ctx.ToPP.Type(type.left, ctx),
                ...type.right.map((x) =>
                    pp.items(
                        [
                            pp.atom(' ' + x.top + ' ', x.loc),
                            ctx.ToPP.Type(x.right, ctx),
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
                pp.items(
                    decorators.map((x) => ctx.ToPP.Decorator(x, ctx)),
                    loc,
                    'always',
                ),
                ctx.ToPP.Type(inner, ctx),
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
                                ctx.ToPP.Type(arg.typ, ctx),
                            ],
                            loc,
                        ),
                    ) ?? [],
                    args?.loc ?? loc,
                ),
                pp.atom(' => ', loc),
                ctx.ToPP.Type(result, ctx),
            ],
            loc,
        );
    },
    TParens({ items, loc, open }: p.TParens, ctx: PCtx): pp.PP {
        return pp.args(
            items?.items
                .map((x) => ctx.ToPP.Type(x, ctx))
                .concat(open ? [pp.text('*', loc)] : []) ?? [],
            loc,
        );
        // return pp.items(
        //     [
        //         pp.atom('(', loc),
        //         ctx.ToPP[items.type](items , ctx),
        //         pp.atom(')', loc),
        //     ],
        //     loc,
        // );
    },
    TRef(type: p.TRef, ctx: PCtx): pp.PP {
        return pp.atom(type.text + (type.hash ?? ''), type.loc);
    },
    String(type: p.String, ctx: PCtx): pp.PP {
        return pp.atom(`"${type.text}"`, type.loc);
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    Type_TRef(node, ctx) {
        if (node.ref.type === 'Unresolved' || node.ref.type === 'Local') {
            return null;
        }
        if (!ctx.ctx.resolveRefsAndApplies(node)) {
            return tdecorate(node, 'invalidType', ctx);
        }
        return null;
    },
    Type_TOps(node, ctx) {
        const adds = justStringAdds(node, ctx.ctx);
        if (adds) {
            return null;
        }
        const ops = numOps(node, ctx.ctx);
        if (ops) {
            return null;
        }

        return tdecorate(node, 'invalidOps', ctx);
    },
};
