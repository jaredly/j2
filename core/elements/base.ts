import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import {
    analyze,
    analyzeTop,
    analyzeTypeTop,
    Ctx as ACtx,
} from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx, Toplevel, TopTypeKind } from '../typing/to-tast';

export const grammar = `


_lineEnd = '\n' / _EOF

_EOF = !.

Toplevel = TypeAlias / Expression
TypeToplevel = TypeAlias / Type

Expression = DecoratedExpression

Identifier = text:$IdText hash:($JustSym / $HashRef / $RecurHash / $ShortRef / $BuiltinHash / $UnresolvedHash)?

Atom = Number / Boolean / Identifier / ParenedExpression / TemplateString / Enum

ParenedExpression = "(" _ expr:Expression _ ")"

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+

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
        let top = ctx.ToTast.TypeToplevel(t as any, ctx);
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
        let top = ctx.ToTast.Toplevel(t as any, ctx);
        if (top.type === 'TypeAlias') {
            ctx = ctx.withTypes(top.elements);
        }
        return analyze ? analyzeTop(top, ctx) : top;
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

export const ToTast = {
    Toplevel(top: p.Toplevel, ctx: Ctx): t.Toplevel {
        if (top.type === 'TypeAlias') {
            return ctx.ToTast.TypeAlias(top, ctx);
        } else {
            return {
                type: 'ToplevelExpression',
                expr: ctx.ToTast[top.type](top as any, ctx),
                loc: top.loc,
            };
        }
    },
    TypeToplevel(top: p.TypeAlias | p.Type, ctx: Ctx): t.Type | t.TypeAlias {
        if (top.type === 'TypeAlias') {
            return ctx.ToTast.TypeAlias(top, ctx);
        } else {
            return ctx.ToTast[top.type](top as any, ctx);
        }
    },
    ParenedExpression(expr: p.ParenedExpression, ctx: Ctx): t.Expression {
        return ctx.ToTast[expr.expr.type](expr.expr as any, ctx);
    },
    // Expression(expr: p.Expression, typ: Type | null, ctx: Ctx): Expression {
    //     return ctx.ToTast[expr.type](expr as any, typ, ctx);
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
                return inner.ToAst[t.type](t as any, inner);
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
                return inner.ToAst[t.type](t as any, inner);
            }),
            loc,
            comments,
        };
    },

    ToplevelExpression(
        { type, expr, loc }: t.ToplevelExpression,
        ctx: TACtx,
    ): p.Toplevel {
        return ctx.ToAst[expr.type](expr as any, ctx);
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
            file.toplevels.map((t) => ctx.ToPP[t.type](t as any, ctx)),
            file.loc,
            'always',
        );
    },
    TypeFile: (file: p.TypeFile, ctx: PCtx): pp.PP => {
        return pp.items(
            file.toplevels.map((t) =>
                pp.items(
                    [ctx.ToPP[t.type](t as any, ctx), pp.text('\n', file.loc)],
                    t.loc,
                ),
            ),
            file.loc,
            'always',
        );
    },
    ParenedExpression({ loc, expr }: p.ParenedExpression, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.atom('(', loc),
                ctx.ToPP[expr.type](expr as any, ctx),
                pp.atom(')', loc),
            ],
            loc,
        );
    },
    Identifier(identifier: p.Identifier, ctx: PCtx): pp.PP {
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
            return 'builtin';
        case 'TDecorated':
        case 'TVars':
        case 'TParens':
        case 'TApply':
            return determineKind(t.inner, ctx);
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
        case 'Number':
        case 'String':
        case 'TOps':
            return 'builtin';
        case 'TDecorated':
        case 'TVars':
            return determineKindT(t.inner, ctx);
        case 'TApply':
            return determineKindT(t.target, ctx);
        case 'TEnum':
            return 'enum';
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
