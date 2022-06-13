// Printing I hope
import * as p from '../grammar/base.parser';
import * as peggy from 'peggy';
import * as pp from './pp';

export const ToPP = {
    File: (file: p.File): pp.PP => {
        return pp.items(
            file.toplevels.map((t) => ToPP[t.type](t as any)),
            'always',
            file.loc,
        );
    },
    Int(int: p.Int): pp.PP {
        return pp.atom(int.contents, undefined, int.loc);
    },
    Apply(apply: p.Apply_inner): pp.PP {
        return pp.items(
            [
                ToPP[apply.target.type](apply.target as any),
                ...apply.suffixes.map((s) => ToPP[s.type](s)),
            ],
            undefined,
            apply.loc,
        );
    },
    Identifier(identifier: p.Identifier): pp.PP {
        return pp.atom(
            identifier.text + (identifier.hash ?? ''),
            undefined,
            identifier.loc,
        );
    },
    Parens(parens: p.Parens): pp.PP {
        return pp.args(
            (parens.args?.items ?? []).map((a) => ToPP[a.type](a as any)),
            undefined,
            undefined,
            undefined,
            parens.loc,
        );
    },
};

export const pegPrinter = (ast: p.File, past: peggy.ast.Grammar): pp.PP => {
    const comments = ast.comments.slice();
    return pp.crawl(ToPP.File(ast), (item) => {
        if (!comments.length) {
            return item;
        }
        const mend = item.loc?.end.offset ?? -1;
        while (comments.length && comments[0][0].start.offset < mend) {
            const no = comments[0][0].start.offset;
            let several: Array<pp.PP> | null = null;
            if (item.type === 'block') {
                several = item.contents;
            }
            if (item.type === 'args') {
                several = item.contents;
            }
            if (item.type === 'items') {
                several = item.items;
            }
            const atom = pp.atom(
                comments[0][1].trim(),
                undefined,
                comments[0][0],
                true,
            );
            if (!several) {
                return item;
            }
            let idx = several.findIndex(
                (i) => (i.loc?.start.offset ?? -1) > no,
            );
            if (idx === -1) {
                idx = several.length;
            }
            comments.shift();
            several.splice(idx, 0, atom);
        }
        return item;
    });
};
