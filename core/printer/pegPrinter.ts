// Printing I hope
import * as p from '../grammar/base.parser';
import * as peggy from 'peggy';
import * as pp from './pp';
import { noloc } from '../ctx';
import { ConstantsToPP } from '../elements/constants';

export type Ctx = {
    hideIds: boolean;
};

export const ToPP = {
    ...ConstantsToPP,
    File: (file: p.File, ctx: Ctx): pp.PP => {
        return pp.items(
            file.toplevels.map((t) => ToPP[t.type](t as any, ctx)),
            file.loc,
            'always',
        );
    },
    Apply(apply: p.Apply_inner, ctx: Ctx): pp.PP {
        return pp.items(
            [
                ToPP[apply.target.type](apply.target as any, ctx),
                ...apply.suffixes.map((s) => ToPP[s.type](s, ctx)),
            ],
            apply.loc,
        );
    },
    Type(type: p.Type, ctx: Ctx): pp.PP {
        if (ctx.hideIds) {
            return pp.atom(type.text, type.loc);
        }
        return pp.atom(type.text + (type.hash ?? ''), type.loc);
    },
    DecoratedExpression(
        { inner, decorators, loc }: p.DecoratedExpression_inner,
        ctx: Ctx,
    ): pp.PP {
        const inn = ToPP[inner.type](inner as any, ctx);
        return pp.items(
            [...decorators.map((dec) => ToPP[dec.type](dec as any, ctx)), inn],
            loc,
        );
    },
    Decorator({ args, id, loc }: p.Decorator, ctx: Ctx): pp.PP {
        return pp.items(
            [
                pp.atom('@', loc),
                ctx.hideIds
                    ? pp.atom(id.text, id.loc)
                    : pp.atom(id.text + (id.hash ?? ''), loc),
                pp.args(
                    args?.items.map((a) => {
                        return pp.items(
                            (a.label
                                ? [
                                      pp.atom(a.label, a.loc),
                                      pp.atom(': ', a.loc),
                                  ]
                                : []
                            ).concat([ToPP[a.arg.type](a.arg as any, ctx)]),
                            a.loc,
                        );
                    }) ?? [],
                    loc,
                ),
                pp.atom(' ', loc),
            ],
            loc,
        );
    },
    ParenedExpression({ loc, expr }: p.ParenedExpression, ctx: Ctx): pp.PP {
        return pp.items(
            [
                pp.atom('(', loc),
                ToPP[expr.type](expr as any, ctx),
                pp.atom(')', loc),
            ],
            loc,
        );
    },
    DecExpr({ expr, loc }: p.DecExpr, ctx: Ctx): pp.PP {
        return pp.items([ToPP[expr.type](expr as any, ctx)], loc);
    },
    DecType({ type, type_, loc }: p.DecType, ctx: Ctx): pp.PP {
        return pp.items(
            [pp.atom(':', loc), ToPP[type_.type](type_ as any, ctx)],
            loc,
        );
    },
    Identifier(identifier: p.Identifier, ctx: Ctx): pp.PP {
        return pp.atom(
            ctx.hideIds
                ? identifier.text
                : identifier.text + (identifier.hash ?? ''),
            identifier.loc,
        );
    },
    Parens(parens: p.Parens, ctx: Ctx): pp.PP {
        return pp.args(
            (parens.args?.items ?? []).map((a) => ToPP[a.type](a as any, ctx)),
            parens.loc,
        );
    },
};

export const injectComments = (pretty: pp.PP, comments: [p.Loc, string][]) => {
    return pp.crawl(pretty, (item) => {
        if (!comments.length) {
            return item;
        }
        const mstart = item.loc.start.offset;
        const mend = item.loc.end.offset;

        let contents: Array<pp.PP> | null = null;
        if (item.type === 'block' || item.type === 'args') {
            contents = item.contents;
        } else if (item.type === 'items') {
            contents = item.items;
        } else {
            return item;
        }

        let used: number[] = [];
        for (let i = 0; i < comments.length; i++) {
            const [loc, text] = comments[i];
            const atom = pp.atom(text.trim(), loc, undefined, true);

            if (mstart <= loc.start.offset && loc.end.offset <= mend) {
                let dontappend = false;
                for (let ci = 0; ci < contents.length; ci++) {
                    const item = contents[ci];
                    if (item.loc.start.offset > loc.start.offset) {
                        contents.splice(ci, 0, atom);
                        dontappend = true;
                        used.push(i);
                        break;
                    }
                    if (
                        item.loc.end.offset > loc.start.offset &&
                        !pp.isAtomic(item)
                    ) {
                        dontappend = true;
                        break;
                    }
                }
                if (!dontappend) {
                    contents.push(atom);
                    used.push(i);
                }
            }
        }

        comments = comments.filter((_, i) => !used.includes(i));
        return item;
    });
};

export const pegPrinter = (
    ast: p.File,
    // past: peggy.ast.Grammar,
    ctx: Ctx,
): pp.PP => {
    return injectComments(ToPP.File(ast, ctx), ast.comments.slice());
};
