import { noloc } from '../core/ctx';
import { injectComments } from '../core/elements/comments';
import { TestResult } from '../core/full/full';
import * as p from '../core/grammar/base.parser';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';

export const refmt = (file: TestResult) => {
    if (file.type === 'Error') {
        return file.text;
    }

    const ast: p.File = {
        type: 'File',
        comments: file.comments,
        toplevels: [],
        loc: noloc,
    };

    file.info.forEach((info) => {
        const keys = Object.keys(info.aliases);
        if (keys.length) {
            ast.toplevels.push({
                type: 'Aliases',
                items: keys.sort().map((k) => ({
                    type: 'AliasItem',
                    name: k,
                    hash: `#[${info.aliases[k]}]`,
                    loc: noloc,
                })),
                loc: noloc,
            });
        }
        ast.toplevels.push(info.contents.refmt);
    });

    if (ast.toplevels.length > 0) {
        ast.loc = {
            start: ast.toplevels[0].loc.start,
            end: ast.toplevels[ast.toplevels.length - 1].loc.end,
            idx: -1,
        };
    }

    const pctx = newPPCtx();
    const pp = injectComments(pctx.ToPP.File(ast, pctx), ast.comments.slice());
    return printToString(pp, 100).replace(/[ \t]+$/gm, '');
};
