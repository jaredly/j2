// Printing I hope
import * as p from '../grammar/base.parser';
import * as peggy from 'peggy';
import * as pp from './pp';

export const ToPP = {
    File: (file: p.File): pp.PP => {
        return pp.items(
            file.toplevels.map((t) => ToPP[t.type](t as any)),
            file.loc,
            'always',
        );
    },
    Boolean(bool: p.Boolean): pp.PP {
        return pp.atom(bool.v, bool.loc);
    },
    Number(int: p.Number): pp.PP {
        return pp.atom(int.contents, int.loc);
    },
    Apply(apply: p.Apply_inner): pp.PP {
        return pp.items(
            [
                ToPP[apply.target.type](apply.target as any),
                ...apply.suffixes.map((s) => ToPP[s.type](s)),
            ],
            apply.loc,
        );
    },
    Type(type: p.Type): pp.PP {
        return pp.atom(type.text + (type.hash ?? ''), type.loc);
    },
    DecoratedExpression({
        inner,
        decorators,
        loc,
    }: p.DecoratedExpression_inner): pp.PP {
        const inn = ToPP[inner.type](inner as any);
        return pp.items(
            [...decorators.map((dec) => ToPP[dec.type](dec as any)), inn],
            loc,
        );
    },
    Decorator({ args, id, loc }: p.Decorator): pp.PP {
        return pp.items(
            [
                pp.atom('@', loc),
                pp.atom(id.text + (id.hash ?? ''), loc),
                pp.args(
                    args?.items.map((a) => {
                        return pp.items(
                            (a.label
                                ? [
                                      pp.atom(a.label, a.loc),
                                      pp.atom(': ', a.loc),
                                  ]
                                : []
                            ).concat([ToPP[a.arg.type](a.arg as any)]),
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
    ParenedExpression({ loc, expr }: p.ParenedExpression): pp.PP {
        return pp.items(
            [
                pp.atom('(', loc),
                ToPP[expr.type](expr as any),
                pp.atom(')', loc),
            ],
            loc,
        );
    },
    DecExpr({ expr, loc }: p.DecExpr): pp.PP {
        return pp.items([ToPP[expr.type](expr as any)], loc);
    },
    DecType({ type, type_, loc }: p.DecType): pp.PP {
        return pp.items(
            [pp.atom(':', loc), ToPP[type_.type](type_ as any)],
            loc,
        );
    },
    Identifier(identifier: p.Identifier): pp.PP {
        return pp.atom(
            identifier.text + (identifier.hash ?? ''),
            identifier.loc,
        );
    },
    Parens(parens: p.Parens): pp.PP {
        return pp.args(
            (parens.args?.items ?? []).map((a) => ToPP[a.type](a as any)),
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

export const pegPrinter = (ast: p.File, past: peggy.ast.Grammar): pp.PP => {
    return injectComments(ToPP.File(ast), ast.comments.slice());
};
