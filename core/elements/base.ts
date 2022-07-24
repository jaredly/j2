import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as ICtx } from '../ir/ir';
import { analyzeTop, analyzeTypeTop, Ctx as ACtx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx, Toplevel, TopTypeKind } from '../typing/to-tast';

export const grammar = `
_lineEnd = '\n' / _EOF

_EOF = !.

Toplevel = TypeAlias / ToplevelLet / Expression
TypeToplevel = TypeAlias / Type

Expression = Lambda / BinOp

Identifier = text:$IdText hash:IdHash?

IdHash = $(JustSym / HashRef / RecurHash / ShortRef / BuiltinHash / UnresolvedHash)

Atom = Number / Boolean / Identifier / ParenedOp / ParenedExpression / TemplateString / Enum / Record / Block

ParenedExpression = "(" _ items:CommaExpr? _ ")"

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+
AttrText "attribute" = $([0-9a-z-A-Z_]+)

`;

export const typeToplevelT = (t: t.TypeAlias, ctx: ACtx): Toplevel => {
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
    };
};

export const typeToplevel = (t: p.TypeAlias, ctx: Ctx): Toplevel => {
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
};

export const typeFileToTast = (
    { toplevels, loc, comments }: p.TypeFile,
    ctx: Ctx,
    analyze = true,
): [t.TypeFile, Ctx] => {
    let parsed = toplevels.map((t) => {
        ctx.resetSym();
        let config: null | Toplevel = null;
        if (t.type === 'TypeAlias') {
            config = typeToplevel(t, ctx);
            ctx.resetSym();
        }
        ctx = ctx.toplevelConfig(config);
        let top = ctx.ToTast.TypeToplevel(t, ctx);
        if (top.type === 'TypeAlias') {
            ctx = ctx.withTypes(top.elements);
        }
        return analyze ? analyzeTypeTop(top, ctx) : top;
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
    analyze = true,
): [t.File, Ctx] => {
    let parsed = toplevels.map((t) => {
        ctx.resetSym();
        let config: null | Toplevel = null;
        if (t.type === 'TypeAlias') {
            config = typeToplevel(t, ctx);
            ctx.resetSym();
        }
        ctx = ctx.toplevelConfig(config);
        let top = ctx.ToTast.Toplevel(t, ctx);
        if (top.type === 'TypeAlias') {
            ctx = ctx.withTypes(top.elements);
        }
        if (top.type === 'ToplevelLet') {
            // const hash = hash
        }
        if (!analyze) {
            return top;
        }
        top = transformToplevel(top, removeErrorDecorators(ctx), null);
        return analyzeTop(top, ctx);
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
        TDecorated(node, ctx) {
            const left = removeErrorDecorators(node.decorators);
            return left.length < node.decorators.length
                ? { ...node, decorators: left }
                : null;
        },
    };
};

export const ToTast = {
    Toplevel(top: p.Toplevel, ctx: Ctx): t.Toplevel {
        if (top.type === 'TypeAlias') {
            return ctx.ToTast.TypeAlias(top, ctx);
        } else if (top.type === 'ToplevelLet') {
            return ctx.ToTast.ToplevelLet(top, ctx);
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
            elements: top.items.map((item) => ({
                expr: ctx.ToTast.Expression(item.expr, ctx),
                name: item.name,
                loc: item.loc,
            })),
            loc: top.loc,
        };
    },
    TypeToplevel(top: p.TypeAlias | p.Type, ctx: Ctx): t.Type | t.TypeAlias {
        if (top.type === 'TypeAlias') {
            return ctx.ToTast.TypeAlias(top, ctx);
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
                let inner = ctx;
                if (t.type === 'TypeAlias') {
                    inner = ctx.withToplevel(typeToplevelT(t, ctx.actx));
                }
                return inner.ToAst.Toplevel(t, inner);
            }),
            loc,
            comments,
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
                            pp.text(' = ', item.loc),
                            ctx.ToPP.Expression(item.expr, ctx),
                        ],
                        item.loc,
                    ),
                ),
                top.loc,
                'always',
            );
        }
        return ctx.ToPP.Expression(top, ctx);
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
                        // ctx.hideIds
                        //     ? identifier.text :
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
import { FullContext } from '../ctx';
import { idsEqual } from '../ids';
import { transformToplevel, Visitor } from '../transform-tast';
export const ToJS = {
    Ref(x: t.Ref, ctx: JCtx): b.Identifier {
        if (x.kind.type === 'Global') {
            const name = findBuiltinName(x.kind.id, ctx.actx);
            if (name) {
                return b.identifier(name);
            } else {
                return b.identifier('unresolved itsadeal');
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
        return b.identifier(t.refHash(x.kind));
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
    DecoratedExpression(
        { loc, expr }: t.DecoratedExpression,
        ctx: ICtx,
    ): t.IExpression {
        return ctx.ToIR.Expression(expr, ctx);
    },
};
