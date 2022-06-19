// Printing I hope
import * as p from '../grammar/base.parser';
import * as peggy from 'peggy';
import * as pp from './pp';
import { noloc } from '../ctx';
import { ToPP as ConstantsToPP } from '../elements/constants';
import { ToPP as DecoratorsToPP } from '../elements/decorators';

export type Ctx = {
    hideIds: boolean;
    ToPP: ToPP;
};

export type ToPP = typeof GeneralToPP &
    typeof ConstantsToPP &
    typeof DecoratorsToPP;

export const makeToPP = (): ToPP => ({
    ...GeneralToPP,
    ...ConstantsToPP,
    ...DecoratorsToPP,
});

export const newPPCtx = (hideIds: boolean): Ctx => ({
    hideIds,
    ToPP: makeToPP(),
});

export const GeneralToPP = {
    File: (file: p.File, ctx: Ctx): pp.PP => {
        return pp.items(
            file.toplevels.map((t) => ctx.ToPP[t.type](t as any, ctx)),
            file.loc,
            'always',
        );
    },
    Apply(apply: p.Apply_inner, ctx: Ctx): pp.PP {
        return pp.items(
            [
                ctx.ToPP[apply.target.type](apply.target as any, ctx),
                ...apply.suffixes.map((s) => ctx.ToPP[s.type](s, ctx)),
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
    ParenedExpression({ loc, expr }: p.ParenedExpression, ctx: Ctx): pp.PP {
        return pp.items(
            [
                pp.atom('(', loc),
                ctx.ToPP[expr.type](expr as any, ctx),
                pp.atom(')', loc),
            ],
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
            (parens.args?.items ?? []).map((a) =>
                ctx.ToPP[a.type](a as any, ctx),
            ),
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
    return injectComments(ctx.ToPP.File(ast, ctx), ast.comments.slice());
};
