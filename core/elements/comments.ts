import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';

export const grammar = `
newline = "\n"
_nonnewline = [ \t\r]* (comment [ \t\r]*)*
__nonnewline = [ \t\r]+ (comment [ \t\r]*)*
_ "whitespace"
  = [ \t\n\r]* (comment _)*
__ "whitespace"
  = [ \t\n\r]+ (comment _)*
comment = multiLineComment / lineComment
multiLineComment = $("/*" (!"*/" .)* "*/")
lineComment = $("//" (!"\n" .)* &"\n")
finalLineComment = $("//" (!"\n" .)*)
`;

export const injectComments = (pretty: pp.PP, comments: [p.Loc, string][]) => {
    const res = pp.crawl(pretty, (item) => {
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
            if (item.breakMode === 'never') {
                return item;
            }
        } else {
            return item;
        }

        let used: number[] = [];
        for (let i = 0; i < comments.length; i++) {
            const [loc, text] = comments[i];
            const atom = pp.atom(text.trim(), loc, undefined, true);

            if (mstart <= loc.start.offset && loc.end.offset <= mend) {
                let dontappend = false;
                let nextup = false;
                for (let ci = 0; ci < contents.length; ci++) {
                    const item = contents[ci];
                    if (item.loc.start.offset > loc.start.offset) {
                        contents.splice(ci, 0, atom);
                        dontappend = true;
                        used.push(i);
                        break;
                    }
                    if (nextup && item.loc.start.offset === -1) {
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
                    if (item.loc.end.offset === loc.start.offset) {
                        nextup = true;
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
    if (comments.length) {
        let contents: Array<pp.PP>;
        if (res.type === 'block' || res.type === 'args') {
            contents = res.contents;
        } else if (res.type === 'items') {
            contents = res.items;
        } else {
            return res;
        }
        comments.forEach((comment) => {
            contents.push(
                pp.atom(comment[1].trim(), comment[0], undefined, true),
            );
        });
    }
    return res;
};
