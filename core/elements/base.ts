import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as ICtx } from '../ir/ir';
import { analyzeTop, analyzeTypeTop, Ctx as ACtx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx, ToplevelConfig, TopTypeKind } from '../typing/to-tast';

export const grammar = `
_lineEnd = '\n' / _EOF

_EOF = !.

Toplevel = Aliases / TypeAlias / ToplevelLet / Expression
TypeToplevel = Aliases / TypeAlias / Type

Aliases = "alias" __nonnewline first:AliasItem rest:(__nonnewline AliasItem)*
AliasItem = name:$AliasName hash:$HashRef
AliasName = $NamespacedIdText / $binop

Expression = TypeAbstraction / Lambda / BinOp

Identifier = text:$IdText hash:IdHash?

IdHash = $(JustSym / HashRef / RecurHash / ShortRef / BuiltinHash / UnresolvedHash)

Atom = If / Switch / Number / Boolean / Identifier / ParenedOp / ParenedExpression / TemplateString / Enum / Record / Block

ParenedExpression = "(" _ items:CommaExpr? _ ")"

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+
AttrText "attribute" = $([0-9a-z-A-Z_]+)

`;

export const typeToplevelT = (
    t: t.Toplevel | t.TypeToplevel,
    ctx: ACtx,
): ToplevelConfig | null => {
    if (t.type === 'TypeAlias') {
        return {
            type: 'Type',
            items: t.elements.map((t) => {
                const kind = determineKindT(t.type, ctx);
                if (t.type.type === 'TVars') {
                    const args = t.type.args;
                    return { name: t.name, args, kind };
                }
                return { name: t.name, args: [], kind };
            }),
            hash: t.hash,
        };
    }
    if (t.type === 'ToplevelLet') {
        return {
            type: 'Expr',
            hash: t.hash,
            items: t.elements.map((t) => ({
                name: t.name,
                type: ctx.getType(t.expr) ?? { type: 'TBlank', loc: t.loc },
            })),
        };
    }
    return null;
};

export const typeToplevel = (
    t: p.Toplevel | p.TypeToplevel,
    ctx: Ctx,
): ToplevelConfig | null => {
    if (t.type === 'TypeAlias') {
        return {
            type: 'Type',
            items: t.items.map((t) => {
                const kind = determineKind(t.typ, ctx);
                if (t.typ.type === 'TVars') {
                    const args = t.typ.args.items.map((arg) =>
                        ctx.ToTast[arg.type](arg, ctx),
                    );
                    return { name: t.name, args, kind };
                }
                return { name: t.name, args: [], kind };
            }),
        };
    } else if (t.type === 'ToplevelLet') {
        return {
            type: 'Expr',
            items: t.items.map((t) => {
                return {
                    name: t.name,
                    type: t.typ
                        ? ctx.ToTast.Type(t.typ, ctx)
                        : inferTopType(t.expr, ctx),
                };
            }),
        };
    }
    return null;
};

export const inferTopType = (expr: p.Expression, ctx: Ctx): t.Type => {
    if (expr.type === 'TypeAbstraction') {
        const args = expr.args.items.map((t) => ctx.ToTast.TBArg(t, ctx));
        return {
            type: 'TVars',
            inner: inferTopType(expr.inner, ctx.withLocalTypes(args)),
            args: args,
            loc: expr.loc,
        };
    }
    if (expr.type === 'Lambda') {
        return {
            type: 'TLambda',
            args:
                expr.args?.items.map((t) => ({
                    label: '',
                    typ: t.typ
                        ? ctx.ToTast.Type(t.typ, ctx)
                        : { type: 'TBlank', loc: t.loc },
                    loc: t.loc,
                })) ?? [],
            result: expr.res
                ? ctx.ToTast.Type(expr.res, ctx)
                : { type: 'TBlank', loc: expr.loc },
            loc: expr.loc,
        };
    }
    return { type: 'TBlank', loc: expr.loc };
};

export const typeFileToTast = (
    { toplevels, loc, comments }: p.TypeFile,
    ctx: Ctx,
): [t.TypeFile, Ctx] => {
    let parsed = toplevels.map((t) => {
        ctx.resetSym();
        let config = typeToplevel(t, ctx);
        ctx.resetSym();
        ctx = ctx.toplevelConfig(config);
        let top = ctx.ToTast.TypeToplevel(t, ctx);
        top = analyzeTypeTop(top, ctx);
        if (top.type === 'TypeAlias') {
            const res = ctx.withTypes(top.elements);
            ctx = res.ctx;
        }
        // return analyze ? analyzeTypeTop(top, ctx) : top;
        return top;
    });
    return [
        {
            type: 'TypeFile',
            toplevels: parsed,
            comments,
            loc,
        },
        ctx,
    ];
};

export const fileToTast = (
    { toplevels, loc, comments }: p.File,
    ctx: Ctx,
): [t.File, Ctx] => {
    let parsed = toplevels.map((t) => {
        ctx.resetSym();
        let config = typeToplevel(t, ctx);
        ctx.resetSym();
        ctx = ctx.toplevelConfig(config);
        let top = ctx.ToTast.Toplevel(t, ctx);
        top = transformToplevel(top, removeErrorDecorators(ctx), null);
        if (config?.type === 'Type' && top.type === 'TypeAlias') {
            config.items.forEach((item, i) => {
                item.actual = (top as t.TypeAlias).elements[i].type;
            });
        }
        top = analyzeTop(top, ctx);
        if (top.type === 'TypeAlias') {
            const res = ctx.withTypes(top.elements);
            ctx = res.ctx;
        } else if (top.type === 'ToplevelLet') {
            // ok
            const res = ctx.withValues(top.elements);
            ctx = res.ctx;
            top.hash = res.hash;
        }
        return top;
    });
    return [
        {
            type: 'File',
            toplevels: parsed,
            comments,
            loc,
        },
        ctx,
    ];
};

export const removeErrorDecorators = (ctx: Ctx): Visitor<null> => {
    const errorDecs = ctx.errorDecorators();
    function removeErrorDecorators(decorators: t.Decorator[]) {
        return decorators.filter(
            (t) =>
                !(
                    t.id.ref.type === 'Global' &&
                    errorDecs.some((i) =>
                        idsEqual(i, (t.id.ref as t.GlobalRef).id),
                    )
                ),
        );
    }

    return {
        EnumCase(node, ctx) {
            const left = removeErrorDecorators(node.decorators);
            return left.length < node.decorators.length
                ? { ...node, decorators: left }
                : null;
        },
        ExpressionPost_DecoratedExpression(node, ctx) {
            if (!node.decorators.length) {
                return node.expr;
            }
            return null;
        },
        DecoratedExpression(node, ctx) {
            const left = removeErrorDecorators(node.decorators);
            return left.length < node.decorators.length
                ? { ...node, decorators: left }
                : null;
        },
        TypePost_TDecorated(node, ctx) {
            if (!node.decorators.length) {
                return node.inner;
            }
            return null;
        },
        Pattern_PDecorated(node, ctx) {
            const left = removeErrorDecorators(node.decorators);
            return left.length < node.decorators.length
                ? left.length
                    ? { ...node, decorators: left }
                    : node.inner
                : null;
        },
        TDecorated(node, ctx) {
            const left = removeErrorDecorators(node.decorators);
            return left.length < node.decorators.length
                ? { ...node, decorators: left }
                : null;
        },
    };
};

export const ToTast = {
    Aliases(top: p.Aliases, ctx: Ctx): t.ToplevelAliases {
        return {
            type: 'ToplevelAliases',
            aliases: top.items.map((t) => ({
                name: t.name,
                hash: t.hash.slice(2, -1),
                loc: t.loc,
            })),
            loc: top.loc,
        };
    },
    Toplevel(top: p.Toplevel, ctx: Ctx): t.Toplevel {
        if (top.type === 'TypeAlias') {
            return ctx.ToTast.TypeAlias(top, ctx);
        } else if (top.type === 'ToplevelLet') {
            return ctx.ToTast.ToplevelLet(top, ctx);
        } else if (top.type === 'Aliases') {
            return ctx.ToTast.Aliases(top, ctx);
        } else {
            return {
                type: 'ToplevelExpression',
                expr: ctx.ToTast.Expression(top, ctx),
                loc: top.loc,
            };
        }
    },
    ToplevelLet(top: p.ToplevelLet, ctx: Ctx): t.ToplevelLet {
        return {
            type: 'ToplevelLet',
            elements: top.items.map((item) => {
                const typ = item.typ ? ctx.ToTast.Type(item.typ, ctx) : null;
                return {
                    expr:
                        typ?.type === 'TLambda' && item.expr.type === 'Lambda'
                            ? ctx.ToTast.Lambda(item.expr, ctx, typ)
                            : ctx.ToTast.Expression(item.expr, ctx),
                    name: item.name,
                    loc: item.loc,
                    typ,
                };
            }),
            loc: top.loc,
        };
    },
    TypeToplevel(top: p.TypeToplevel, ctx: Ctx): t.TypeToplevel {
        if (top.type === 'TypeAlias') {
            return ctx.ToTast.TypeAlias(top, ctx);
        } else if (top.type === 'Aliases') {
            return ctx.ToTast.Aliases(top, ctx);
        } else {
            return ctx.ToTast.Type(top, ctx);
        }
    },
    ParenedExpression(expr: p.ParenedExpression, ctx: Ctx): t.Expression {
        return maybeTuple(expr.items, expr.loc, ctx);
    },
    // Expression(expr: p.Expression, typ: Type | null, ctx: Ctx): Expression {
    //     return ctx.ToTast[expr.type](expr , typ, ctx);
    // },
    Identifier({ hash, loc, text }: p.Identifier, ctx: Ctx): t.Expression {
        // ok so here's where rubber meets road, right?
        // like I need to know what Ctx is.
        // hmmmm what if we have a mapping of 'id to type'
        // that can be independent of ... whether it came
        // from builtlin or somethign else.
        //
        hash = filterUnresolved(hash?.slice(2, -1));
        const resolved = ctx.resolve(text, hash);
        // console.log('resolved', text, hash);
        if (resolved.length === 1) {
            return { type: 'Ref', loc, kind: resolved[0] };
        }
        return {
            type: 'Ref',
            kind: { type: 'Unresolved', text, hash },
            loc,
        };
    },
};

export const filterUnresolved = (v: string | null | undefined) =>
    v == null || v === ':unresolved:' ? null : v;

export const maybeTuple = (
    items: null | p.CommaExpr,
    loc: t.Loc,
    ctx: Ctx,
): t.Expression => {
    if (items?.items.length === 1) {
        return ctx.ToTast.Expression(items.items[0], ctx);
    }
    return {
        type: 'Record',
        spreads: [],
        loc,
        items:
            items?.items.map((item, i) => ({
                type: 'RecordKeyValue',
                key: i.toString(),
                value: ctx.ToTast.Expression(item, ctx),
                loc: item.loc,
            })) ?? [],
    };
};

export const ToAst = {
    File({ type, toplevels, loc, comments }: t.File, ctx: TACtx): p.File {
        // TOOD: Go through and find all hashes, right?
        // maybe when printing unresolved things, put `#[:unresolved:]` or something?
        return {
            type,
            toplevels: toplevels.map((t) => {
                let inner = ctx.withToplevel(typeToplevelT(t, ctx.actx));
                return inner.ToAst.Toplevel(t, inner);
            }),
            loc,
            comments,
        };
    },

    ToplevelAliases(
        { aliases, loc }: t.ToplevelAliases,
        ctx: TACtx,
    ): p.Aliases {
        return {
            type: 'Aliases',
            items: aliases.map((a) => ({
                type: 'AliasItem',
                name: a.name,
                hash: `#[${a.hash}]`,
                loc: a.loc,
            })),
            loc,
        };
    },

    TypeFile(
        { type, toplevels, loc, comments }: t.TypeFile,
        ctx: TACtx,
    ): p.TypeFile {
        // TOOD: Go through and find all hashes, right?
        // maybe when printing unresolved things, put `#[:unresolved:]` or something?
        return {
            type,
            toplevels: toplevels.map((t) => {
                let inner = ctx;
                if (t.type === 'TypeAlias') {
                    inner = ctx.withToplevel(typeToplevelT(t, ctx.actx));
                }
                return inner.ToAst.TypeToplevel(t, inner);
            }),
            loc,
            comments,
        };
    },

    ToplevelExpression(
        { type, expr, loc }: t.ToplevelExpression,
        ctx: TACtx,
    ): p.Toplevel {
        return ctx.ToAst.Expression(expr, ctx);
    },

    Ref({ type, kind, loc }: t.Ref, ctx: TACtx): p.Identifier {
        if (kind.type === 'Unresolved') {
            return {
                type: 'Identifier',
                text: kind.text,
                hash: '#[:unresolved:]',
                loc,
            };
        } else {
            return ctx.printRef(kind, loc, 'value');
        }
    },
};

export const ToPP = {
    File: (file: p.File, ctx: PCtx): pp.PP => {
        return pp.items(
            file.toplevels.map((t) => ctx.ToPP.Toplevel(t, ctx)),
            file.loc,
            'always',
        );
    },
    Toplevel(top: p.Toplevel, ctx: PCtx): pp.PP {
        if (top.type === 'TypeAlias') {
            return ctx.ToPP.TypeAlias(top, ctx);
        }
        if (top.type === 'ToplevelLet') {
            return pp.items(
                top.items.map((item, i) =>
                    pp.items(
                        [
                            pp.text(i > 0 ? 'and ' : 'let ', item.loc),
                            pp.text(item.name, item.loc),
                            item.typ != null
                                ? pp.items(
                                      [
                                          pp.text(': ', item.loc),
                                          ctx.ToPP.Type(item.typ, ctx),
                                      ],
                                      item.loc,
                                  )
                                : null,
                            pp.text(' = ', item.loc),
                            ctx.ToPP.Expression(item.expr, ctx),
                            // i === top.items.length - 1
                            //     ? pp.text(';', top.loc)
                            //     : null,
                        ],
                        item.loc,
                    ),
                ),
                top.loc,
                'always',
            );
        }
        if (top.type === 'Aliases') {
            return ctx.ToPP.Aliases(top, ctx);
        }
        return pp.items(
            [
                ctx.ToPP.Expression(top, ctx),
                // pp.text(';', top.loc)
            ],
            top.loc,
            'never',
        );
    },
    Aliases(top: p.Aliases, ctx: PCtx): pp.PP {
        return pp.text(
            'alias ' +
                top.items.map((item) => `${item.name}${item.hash}`).join(' '),
            top.loc,
        );
    },
    // ToplevelLet()
    TypeFile: (file: p.TypeFile, ctx: PCtx): pp.PP => {
        return pp.items(
            file.toplevels.map((t) =>
                pp.items(
                    [ctx.ToPP.TypeToplevel(t, ctx), pp.text('\n', file.loc)],
                    t.loc,
                ),
            ),
            file.loc,
            'always',
        );
    },
    ParenedExpression({ loc, items }: p.ParenedExpression, ctx: PCtx): pp.PP {
        return pp.args(
            items?.items.map((item) => ctx.ToPP.Expression(item, ctx)) ?? [],
            loc,
        );
    },
    Identifier(identifier: p.Identifier, ctx: PCtx): pp.PP {
        if (!identifier.text.match(/^[a-zA-Z_0-0]/)) {
            return pp.items(
                [
                    pp.text('(', identifier.loc),
                    pp.atom(
                        identifier.text + (identifier.hash ?? ''),
                        identifier.loc,
                    ),
                    pp.text(')', identifier.loc),
                ],
                identifier.loc,
            );
        }
        return pp.atom(
            // ctx.hideIds
            //     ? identifier.text :
            identifier.text + (identifier.hash ?? ''),
            identifier.loc,
        );
    },
};

function determineKind(t: p.Type, ctx: ACtx): TopTypeKind {
    switch (t.type) {
        case 'Number':
        case 'String':
        case 'TOps':
        case 'TBlank':
            return 'builtin';
        case 'TRecord':
            return 'record';
        case 'TDecorated':
        case 'TVars':
        case 'TApply':
            return determineKind(t.inner, ctx);
        case 'TParens':
            if (t.items?.items.length === 1) {
                return determineKind(t.items.items[0], ctx);
            }
            return 'record';
        case 'TEnum':
            return 'enum';
        case 'TLambda':
            return 'lambda';
        case 'TRef':
            const ref = ctx.resolveType(t.text, t.hash);
            if (!ref || ref.type === 'Recur' || ref.type === 'Local') {
                return 'unknown';
            }
            const got = ctx.typeForId(ref.id);
            if (!got) {
                return 'unknown';
            }
            if (got?.type === 'builtin') {
                return 'builtin';
            }
            return determineKindT(got.typ, ctx);
    }
}

function determineKindT(t: t.Type, ctx: ACtx): TopTypeKind {
    switch (t.type) {
        case 'TVbl':
        case 'Number':
        case 'String':
        case 'TOps':
        case 'TBlank':
            return 'builtin';
        case 'TDecorated':
        case 'TVars':
            return determineKindT(t.inner, ctx);
        case 'TApply':
            return determineKindT(t.target, ctx);
        case 'TEnum':
            return 'enum';
        case 'TRecord':
            return 'record';
        case 'TLambda':
            return 'lambda';
        case 'TRef':
            const ref = t.ref;
            if (
                !ref ||
                ref.type === 'Recur' ||
                ref.type === 'Local' ||
                ref.type === 'Unresolved'
            ) {
                return 'unknown';
            }
            const got = ctx.typeForId(ref.id);
            if (!got) {
                return 'unknown';
            }
            if (got.type === 'builtin') {
                return 'builtin';
            }
            return determineKindT(got?.typ, ctx);
    }
}

export const findBuiltinName = (id: t.Id, ctx: ACtx): string | null => {
    const got = ctx.valueForId(id);
    if (got && got.type === 'builtin') {
        const inner = (ctx as FullContext).extract();

        for (let key of Object.keys(inner.values.names)) {
            if (inner.values.names[key].some((ref) => idsEqual(ref.id, id))) {
                return key;
            }
        }
    }
    return null;
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { FullContext, nodebug } from '../ctx';
import { idsEqual } from '../ids';
import { transformToplevel, Visitor } from '../transform-tast';

export const ToJS = {
    Ref(x: t.Ref, ctx: JCtx): b.Expression {
        if (x.kind.type === 'Global') {
            const name = findBuiltinName(x.kind.id, ctx.actx);
            if (name) {
                if (ctx.namespaced) {
                    return b.memberExpression(
                        b.identifier('$builtins'),
                        b.identifier(name),
                        false,
                    );
                }
                return b.identifier(name);
            } else {
                if (ctx.namespaced) {
                    return b.memberExpression(
                        b.identifier('$terms'),
                        b.identifier(ctx.globalName(x.kind.id)),
                        false,
                    );
                }
                return b.identifier(ctx.globalName(x.kind.id));
            }
        }
        if (x.kind.type === 'Local') {
            const found = ctx.actx.valueForSym(x.kind.sym);
            if (found) {
                return b.identifier(found.name);
            } else {
                return b.identifier(`unresolved sym!`);
            }
        }
        if (x.kind.type === 'Recur') {
            const id = ctx.actx.resolveRecur(x.kind.idx);
            if (!id) {
                console.log(id, x.kind.idx, ctx.actx);
            }
            if (ctx.namespaced) {
                return b.memberExpression(
                    b.identifier('$terms'),
                    b.identifier(id ? ctx.globalName(id) : ':no recur found:'),
                    false,
                );
            }
            return b.identifier(id ? ctx.globalName(id) : ':no recur found:');
        }
        return b.identifier(`:unresovled:`);
    },
    TypeAbstraction(
        { loc, items, body }: t.ITypeAbstraction,
        ctx: JCtx,
    ): b.Expression {
        ctx = { ...ctx, actx: ctx.actx.withLocalTypes(items) };
        return ctx.ToJS.IExpression(body, ctx);
    },
};

export const ToIR = {
    TypeApplication(
        { loc, target, args }: t.TypeApplication,
        ctx: ICtx,
    ): t.IExpression {
        // ugh this is gonna mess me up, right?
        // like, ... idk maybe I do need to keep this in IR,
        // at least to be able to know what types things are?
        // on the other hand, maybe I can bake types at this point?
        // like, monomorphizing is going to happen before this.
        return ctx.ToIR.Expression(target, ctx);
    },
    TypeAbstraction(
        { items, body, loc }: t.TypeAbstraction,
        ctx: ICtx,
    ): t.IExpression {
        ctx = { ...ctx, actx: ctx.actx.withLocalTypes(items) };
        return {
            type: 'TypeAbstraction',
            items,
            body: ctx.ToIR.Expression(body, ctx),
            loc,
        };
    },
    DecoratedExpression(
        { loc, expr }: t.DecoratedExpression,
        ctx: ICtx,
    ): t.IExpression {
        return ctx.ToIR.Expression(expr, ctx);
    },
};
