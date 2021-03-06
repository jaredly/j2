// So ...
// do we want to be able to define .. like ... 'passes' or something?
// orwait, maybe all I need is to be able to record the hash of a toplevel?
// So, after analyze, we record the hash. then that is used from here on out.

import { builtinContext, FullContext } from '../ctx';
import {
    removeErrorDecorators,
    typeToplevel,
    typeToplevelT,
} from '../elements/base';
import * as p from '../grammar/base.parser';
import * as trat from '../transform-ast';
import { fixComments } from '../grammar/fixComments';
import { iCtx } from '../ir/ir';
import { jCtx, newExecutionContext } from '../ir/to-js';
import {
    transformToplevel,
    transformType,
    transformTypeToplevel,
} from '../transform-tast';
import * as t from '../typed-ast';
import {
    analyzeTop,
    analyzeTypeTop,
    errorCount,
    initVerify,
    Verify,
    verifyVisitor,
} from '../typing/analyze';
import { printCtx } from '../typing/to-ast';
import * as b from '@babel/types';
import { annotationVisitor } from '../../devui/collectAnnotations';
import { toId } from '../ids';
import { simplify } from './simplify';
import generate from '@babel/generator';

export type TestResult = Result<FileContents>;
export type SuccessTestResult = Success<FileContents>;
export type SuccessTypeResult = Success<TypeContents>;
export type TypeTestResult = Result<TypeContents>;

export const emptyFileResult: TestResult = {
    type: 'Success',
    comments: [],
    ctx: builtinContext,
    pctx: printCtx(builtinContext),
    info: [],
};

export type IrTop = {
    type: t.Type | null;
    ir: t.IBlock;
    js: b.BlockStatement;
    name?: string;
};

export type FileContents = {
    type: 'File';
    top: t.Toplevel;
    orig: p.Toplevel;
    refmt: p.Toplevel;
    irtops: null | IrTop[];
};

export type TypeContents = {
    type: 'Type';
    top: t.TypeToplevel;
    orig: p.TypeToplevel;
    refmt: p.TypeToplevel;
};

export type ToplevelInfo<Contents> = {
    aliases: { [key: string]: string };
    contents: Contents;
    verify: Verify;
    annotations: { loc: t.Loc; text: string }[];
};

export type Success<Contents> = {
    type: 'Success';
    info: ToplevelInfo<Contents>[];
    comments: p.File['comments'];
    ctx: FullContext;
    pctx: ReturnType<typeof printCtx>;
};
export type Result<Contents> =
    | Success<Contents>
    | {
          type: 'Error';
          text: string;
          err: t.Loc;
      };

export const toJs = (
    t: t.Expression,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    ctx: FullContext,
    name?: string,
): IrTop => {
    // Here's where we simplify! and then re-verify.
    // and ... return something invalid if we messed up.

    const ir = ictx.ToIR.BlockSt(
        {
            type: 'Block',
            stmts: [simplify(t, ctx)],
            loc: t.loc,
        },
        ictx,
    );
    const js = jctx.ToJS.Block(ir, jctx);
    return { ir, js, type: ctx.getType(t), name };
};

export type ExecutionInfo = {
    terms: { [key: string]: any };
    exprs: { [key: number]: any };
};
export const executeFile = (file: Success<FileContents>) => {
    const ectx = newExecutionContext(file.ctx);
    const results: ExecutionInfo = { terms: ectx.terms, exprs: [] };
    file.info.forEach((info, i) => {
        info.contents.irtops?.forEach((irtop) => {
            try {
                const res = ectx.executeJs(irtop.js, irtop.name);
                if (info.contents.irtops?.length === 1) {
                    results.exprs[i] = res;
                }
            } catch (err) {
                console.log(`Failed to execute`);
                console.log(err);
                console.log(generate(irtop.js).code);
            }
        });
    });

    return results;
};

export const processTypeFile = (
    text: string,
    baseCtx = builtinContext,
    debugs?: { [key: number]: boolean },
): Result<TypeContents> => {
    let ast: p.TypeFile;
    try {
        ast = fixComments(p.parseTypeFile(text));
    } catch (err) {
        return {
            type: 'Error',
            text,
            err: (err as p.SyntaxError).location,
        };
    }

    return processTypeFileR(ast, baseCtx, debugs);
};

export const processTypeFileR = (
    ast: p.TypeFile,
    baseCtx = builtinContext,
    debugs?: { [key: number]: boolean },
): Success<TypeContents> => {
    const info: ToplevelInfo<TypeContents>[] = [];
    let ctx = baseCtx.clone();
    let pctx = printCtx(ctx);
    const aliases: { [key: string]: string } = {};

    ast.toplevels.forEach((t, i) => {
        if (t.type === 'Aliases') {
            const aliases: { [key: string]: string } = {};
            t.items.forEach(({ name, hash }) => {
                aliases[name] = hash.slice(2, -1);
            });
            ctx = ctx.withAliases(aliases) as FullContext;
            return;
        }

        if (debugs && debugs[i]) {
            console.log(`Debugging toplevel ${i}`);
            debugger;
        }
        const maybeDebug =
            debugs && debugs[i]
                ? {
                      ...ctx,
                      debugger() {
                          debugger;
                      },
                  }
                : ctx;
        const res = processTypeToplevel(t, maybeDebug, pctx, aliases);
        info.push(res.i);
        ctx = res.ctx;
        const config = typeToplevelT(res.i.contents.top, res.ctx);
        pctx = pctx.withToplevel(config);
    });

    return { type: 'Success', info, ctx, pctx, comments: ast.comments };
};

export const processFileR = (
    ast: p.File,
    baseCtx: FullContext = builtinContext,
    debugs?: { [key: number]: boolean },
): Success<FileContents> => {
    const info: ToplevelInfo<FileContents>[] = [];
    let ctx = baseCtx.clone();
    let pctx = printCtx(ctx);
    let jctx = jCtx(ctx);
    let ictx = iCtx(ctx);
    const aliases: { [key: string]: string } = {};
    // TODO: load builtins?

    ast.toplevels.forEach((t, i) => {
        if (t.type === 'Aliases') {
            const aliases: { [key: string]: string } = {};
            t.items.forEach(({ name, hash }) => {
                aliases[name] = hash.slice(2, -1);
            });
            ctx = ctx.withAliases(aliases) as FullContext;
            return;
        }

        const maybeDebug =
            debugs && debugs[i]
                ? {
                      ...ctx,
                      debugger() {
                          debugger;
                      },
                  }
                : ctx;
        const res = processToplevel(t, maybeDebug, ictx, jctx, pctx, aliases);
        info.push(res.i);
        ctx = res.ctx;
        pctx = res.pctx;
        pctx = pctx.withToplevel(typeToplevelT(res.i.contents.top, res.ctx));
    });

    return { type: 'Success', info, ctx, pctx, comments: ast.comments };
};

export const processFile = (
    text: string,
    baseCtx?: FullContext,
    debugs?: { [key: number]: boolean },
): Result<FileContents> => {
    let ast: p.File;
    try {
        ast = fixComments(p.parseFile(text));
    } catch (err) {
        return {
            type: 'Error',
            text,
            err: (err as p.SyntaxError).location,
        };
    }
    return processFileR(ast, baseCtx, debugs);
};

export const processTypeToplevel = (
    t: p.TypeToplevel,
    ctx: FullContext,
    pctx: ReturnType<typeof printCtx>,
    allAliases: Aliases,
): { i: ToplevelInfo<TypeContents>; ctx: FullContext } => {
    ctx.resetSym();
    const config = typeToplevel(t, ctx);
    ctx.resetSym();
    ctx = ctx.toplevelConfig(config) as FullContext;
    pctx = pctx.withToplevel(config);
    let type = ctx.ToTast.TypeToplevel(t, ctx);
    type = transformTypeToplevel(type, removeErrorDecorators(ctx), null);
    type = analyzeTypeTop(type, ctx);

    const verify = initVerify();
    transformTypeToplevel(type, verifyVisitor(verify, ctx), ctx);

    if (type.type === 'TypeAlias' && errorCount(verify) === 0) {
        const res = ctx.withTypes(type.elements);
        ctx = res.ctx as FullContext;
        type.hash = res.hash;
    }

    const refmt = pctx.ToAst.TypeToplevel(type, pctx);
    // let's do annotations
    const annotations: { loc: t.Loc; text: string }[] = [];
    transformTypeToplevel(type, annotationVisitor(annotations), ctx);

    return {
        i: {
            contents: {
                type: 'Type',
                orig: t,
                top: type,
                refmt,
            },
            verify,
            annotations,
            aliases: newAliases(allAliases, pctx.backAliases),
        },
        ctx,
    };
};

type Aliases = { [key: string]: string };

type PCtx = ReturnType<typeof printCtx>;

export const processToplevel = (
    t: p.Toplevel,
    ctx: FullContext,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    pctx: PCtx,
    allAliases: Aliases,
): { i: ToplevelInfo<FileContents>; ctx: FullContext; pctx: PCtx } => {
    ctx.resetSym();
    const config = typeToplevel(t, ctx);
    ctx.resetSym();
    trat.transformToplevel(
        t,
        {
            PName(node) {
                if (node.hash) {
                    const num = +node.hash.slice(2, -1);
                    ctx.resetSym(num + 1);
                }
                return null;
            },
        },
        null,
    );
    ctx = ctx.toplevelConfig(config) as FullContext;
    pctx = pctx.withToplevel(config);
    let top = ctx.ToTast.Toplevel(t, ctx);
    top = transformToplevel(top, removeErrorDecorators(ctx), null);
    if (config?.type === 'Type' && top.type === 'TypeAlias') {
        config.items.forEach((item, i) => {
            item.actual = (top as t.TypeAlias).elements[i].type;
        });
    }
    top = analyzeTop(top, ctx);

    const verify = initVerify();
    transformToplevel(top, verifyVisitor(verify, ctx), ctx);

    if (errorCount(verify) === 0) {
        if (top.type === 'TypeAlias') {
            const res = ctx.withTypes(top.elements);
            ctx = res.ctx as FullContext;
            top.hash = res.hash;
            config!.hash = res.hash;
        } else if (top.type === 'ToplevelLet') {
            const res = ctx.withValues(top.elements);
            ctx = res.ctx as FullContext;
            top.hash = res.hash;
            config!.hash = res.hash;
        }
    }

    pctx.actx = ctx;
    jctx.actx = ctx;
    ictx.actx = ctx;

    const refmt = pctx.ToAst.Toplevel(top, pctx);
    const irtops =
        errorCount(verify) === 0
            ? top.type === 'ToplevelExpression'
                ? [toJs(top.expr, ictx, jctx, ctx)]
                : top.type === 'ToplevelLet'
                ? top.elements.map((el, i) =>
                      toJs(
                          el.expr,
                          ictx,
                          jctx,
                          ctx,
                          jctx.addGlobalName(
                              toId((top as t.ToplevelLet).hash!, i),
                              el.name,
                          ),
                      ),
                  )
                : []
            : null;

    // let's do annotations
    const annotations: { loc: t.Loc; text: string }[] = [];
    transformToplevel(top, annotationVisitor(annotations), ctx);

    // Ok, so here we want any extra verification.
    // Because I want to be able to ... re-run with
    // debugging on, if need be.

    // ALternatively,
    // I could allow, like right-clicking on a term
    // and saying "debug". Which tbh might be better.

    // Cheap & dirty is to say "debug number X"
    // OH wait, I'm already showing a little red emoji,
    // maybe when you click that it sets it to debug that one.

    return {
        i: {
            contents: {
                type: 'File',
                top,
                orig: t,
                refmt,
                irtops,
            },
            verify,
            annotations,
            aliases: newAliases(allAliases, pctx.backAliases),
        },
        ctx,
        pctx,
    };
};

export const newAliases = (
    allAliases: Aliases,
    backAliases: Aliases,
): Aliases => {
    const newOnes: Aliases = {};
    Object.keys(backAliases).forEach((key) => {
        if (allAliases[key] != backAliases[key]) {
            allAliases[key] = newOnes[key] = backAliases[key];
        }
    });
    return newOnes;
};
