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
    Int(int: p.Int): pp.PP {
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

export const pegPrinter = (ast: p.File, past: peggy.ast.Grammar): pp.PP => {
    let comments = ast.comments.slice();
    return pp.crawl(ToPP.File(ast), (item) => {
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
                    // Should get handled inside?
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
                // used.push(i);
            }
        }

        comments = comments.filter((_, i) => !used.includes(i));

        // while (comments.length && comments[0][0].start.offset < mend) {
        //     const no = comments[0][0].start.offset;
        //     const atom = pp.atom(
        //         comments[0][1].trim(),
        //         comments[0][0],
        //         undefined,
        //         true,
        //     );
        //     let place = contents.length;
        //     for (let i = 0; i < contents.length; i++) {
        //         if (contents[i].loc.start.offset > no) {
        //             place = i;
        //             break;
        //         }
        //         const loc = contents[i].loc;
        //         if (loc.start.offset <= no && no <= loc.end.offset) {
        //             place = -1;
        //             break;
        //         }
        //     }
        //     if (place === -1) {
        //     }
        //     // let idx = contents.findIndex(
        //     //     (i) => (i.loc?.start.offset ?? -1) > no,
        //     // );
        //     // if (idx === -1) {
        //     //     idx = contents.length;
        //     // }
        //     comments.shift();
        //     contents.splice(place, 0, atom);
        // }
        return item;
    });
};
