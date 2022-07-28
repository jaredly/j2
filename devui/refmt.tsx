import generate from '@babel/generator';
import { noloc } from '../core/ctx';
import { injectComments } from '../core/elements/comments';
import { TestResult } from '../core/full/full';
import * as p from '../core/grammar/base.parser';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';
import { errorCount } from '../core/typing/analyze';
import * as b from '@babel/types';

export const withFmt = (file: TestResult) => {
    return file.type === 'Error'
        ? { file, text: file.text }
        : { file, text: refmt(file, true) };
};

export const refmt = (file: TestResult, addComments = false) => {
    if (file.type === 'Error') {
        return file.text;
    }

    const ast: p.File = {
        type: 'File',
        comments: file.comments.slice(),
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
            start: { line: 0, column: 0, offset: 0 },
            end: ast.toplevels[ast.toplevels.length - 1].loc.end,
            idx: -1,
        };
    }

    if (addComments) {
        const pctx = file.pctx;
        const pp = newPPCtx(false);
        file.info.forEach((info) => {
            const errors = errorCount(info.verify);
            if (!errors) {
                info.contents.irtops?.forEach((ir) => {
                    if (ir.type) {
                        const type = pctx.ToAst.Type(ir.type, pctx);
                        const cm = printToString(pp.ToPP.Type(type, pp), 200);
                        ast.comments.push([
                            {
                                ...info.contents.top.loc,
                                start: info.contents.top.loc.end,
                            },
                            '// ' + cm,
                        ]);
                    }

                    let js: b.Node = ir.js;
                    if (
                        ir.js.body.length === 1 &&
                        ir.js.body[0].type === 'ReturnStatement'
                    ) {
                        js = ir.js.body[0].argument!;
                    }
                    const jsraw = generate(js).code;
                    ast.comments.push([
                        {
                            ...info.contents.top.loc,
                            start: info.contents.top.loc.end,
                        },
                        '/* ' + jsraw + ' */',
                    ]);
                });
            }
        });
    }

    const pctx = newPPCtx();
    const pp = injectComments(pctx.ToPP.File(ast, pctx), ast.comments);
    return printToString(pp, 100).replace(/[ \t]+$/gm, '');
};
