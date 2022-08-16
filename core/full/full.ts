// So ...
// do we want to be able to define .. like ... 'passes' or something?
// orwait, maybe all I need is to be able to record the hash of a toplevel?
// So, after analyze, we record the hash. then that is used from here on out.

import generate from '@babel/generator';
import * as b from '@babel/types';
import { annotationVisitor } from '../../devui/collectAnnotations';
import { builtinContext, FullContext } from '../ctx';
import {
    removeErrorDecorators,
    typeToplevel,
    typeToplevelT,
} from '../elements/base';
import * as p from '../grammar/base.parser';
import { fixComments } from '../grammar/fixComments';
import { toId } from '../ids';
import { iCtx } from '../ir/ir';
import { jCtx, NameTrack, newExecutionContext } from '../ir/to-js';
import { printToString } from '../printer/pp';
import { newPPCtx } from '../printer/to-pp';
import * as trat from '../transform-ast';
import { transformToplevel, transformTypeToplevel } from '../transform-tast';
import * as t from '../typed-ast';
import {
    analyzeTop,
    analyzeTypeTop,
    errorCount,
    Verify,
} from '../typing/analyze';
import { initVerify, verifyVisitor } from '../typing/verify';
import { printCtx } from '../typing/to-ast';
import { typeToString } from '../typing/__test__/typeToString';
import { simplify } from './simplify';

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
    tstring: string;
    ir: t.IBlock;
    js: b.BlockStatement;
    simple: p.Expression;
    id?: t.Id;
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
    type: 'Info';
    aliases: { [key: string]: string };
    uses: { [key: string]: true };
    contents: Contents;
    verify: Verify;
    annotations: { loc: t.Loc; text: string }[];
    comments: p.File['comments'];
};

export type Success<Contents> = {
    type: 'Success';
    // loc: t.Loc;
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
    type: t.Type | null,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    pctx: ReturnType<typeof printCtx>,
    ctx: FullContext,
    id?: t.Id,
    name?: string,
): IrTop => {
    // Here's where we simplify! and then re-verify.
    // and ... return something invalid if we messed up.

    const simple = simplify(t, ctx);
    const sast = pctx.ToAst.Expression(simple, pctx);
    const ir = ictx.ToIR.BlockSt(
        {
            type: 'Block',
            stmts: [simple],
            loc: t.loc,
        },
        ictx,
    );
    const js = jctx.ToJS.Block(ir, jctx);
    // const type = ctx.getType(t);
    const tstring = type ? typeToString(type, ctx) : '[no type]';
    return { id, ir, js, type, tstring, simple: sast, name };
};

export type ExecutionInfo = {
    terms: { [key: string]: any };
    exprs: { [key: number]: any };
    errors: { [key: number]: Error };
};
export const executeFile = (
    file: Success<FileContents>,
    shared?: { [key: string]: any },
) => {
    const ectx = newExecutionContext(file.ctx);
    if (shared) {
        ectx.terms = shared;
    }
    const results: ExecutionInfo = { terms: ectx.terms, exprs: [], errors: {} };
    file.info.forEach((info, i) => {
        info.contents.irtops?.forEach((irtop, j) => {
            try {
                const res = ectx.executeJs(irtop.js, irtop.name, `${i}-${j}`);
                if (info.contents.irtops?.length === 1) {
                    results.exprs[i] = res;
                }
            } catch (err) {
                console.log(`Failed to execute`);
                console.log(err);
                console.log(generate(irtop.js).code);
                results.errors[i] = err as Error;
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
    let at = 0;

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
        const res = processTypeToplevel(
            t,
            maybeDebug,
            pctx,
            aliases,
            ast.comments.filter(
                (c) =>
                    c[0].start.offset >= at &&
                    (i === ast.toplevels.length - 1 ||
                        c[0].end.offset <= t.loc.end.offset),
            ),
        );
        at = t.loc.end.offset;
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
    track?: NameTrack,
    noPrintError?: boolean,
): Success<FileContents> => {
    const info: ToplevelInfo<FileContents>[] = [];
    let ctx = baseCtx.clone();
    let pctx = printCtx(ctx, noPrintError ? false : true);
    let jctx = jCtx(ctx, true, track);
    let ictx = iCtx(ctx);
    const aliases: { [key: string]: string } = {};
    // TODO: load builtins?
    let at = 0;

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
        const res = processToplevel(
            t,
            maybeDebug,
            ictx,
            jctx,
            pctx,
            aliases,
            ast.comments.filter(
                (c) =>
                    c[0].start.offset >= at &&
                    (i === ast.toplevels.length - 1 ||
                        c[0].end.offset <= t.loc.end.offset),
            ),
            noPrintError,
        );
        at = t.loc.end.offset;
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
    track?: NameTrack,
    noPrintError?: boolean,
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
    return processFileR(ast, baseCtx, debugs, track, noPrintError);
};

export const processTypeToplevel = (
    t: p.TypeToplevel,
    ctx: FullContext,
    pctx: ReturnType<typeof printCtx>,
    allAliases: Aliases,
    comments: p.File['comments'],
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
    const uses: { [key: string]: true } = {};
    // const allLocals: t.Locals = [];
    transformTypeToplevel(type, annotationVisitor(annotations, uses), {
        ...ctx,
        allLocals: annotations,
    });
    // allLocals.forEach((local) => {
    //     // const type = getType(local.type, ctx);
    //     const text = typeToString(local.type, ctx);
    //     annotations.push({ loc: local.sym.loc, text });
    // });

    return {
        i: {
            type: 'Info',
            contents: {
                type: 'Type',
                orig: t,
                top: type,
                refmt,
            },
            uses,
            verify,
            annotations,
            comments,
            aliases: newAliases(allAliases, pctx.backAliases),
        },
        ctx,
    };
};

type Aliases = { [key: string]: string };

type PCtx = ReturnType<typeof printCtx>;

const reIdx = (t: t.Toplevel): t.Toplevel => {
    let nidx = 0;
    return transformToplevel(
        t,
        {
            Loc(node, ctx) {
                return { ...node, idx: nidx++ };
            },
        },
        null,
    );
};

const findIdxReuse = (t: t.Toplevel) => {
    const used: { [k: number]: boolean } = {};
    transformToplevel(
        t,
        {
            Loc(node, ctx) {
                if (used[node.idx] != null) {
                    used[node.idx] = true;
                } else {
                    used[node.idx] = false;
                }
                return null;
            },
        },
        null,
    );
    return Object.keys(used)
        .filter((k) => used[+k] === true)
        .map((k) => +k);
};

export const processToplevel = (
    t: p.Toplevel,
    ctx: FullContext,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    pctx: PCtx,
    allAliases: Aliases,
    comments: p.File['comments'],
    noPrintError = false,
): { i: ToplevelInfo<FileContents>; ctx: FullContext; pctx: PCtx } => {
    ctx = ctx.toplevelConfig(null) as FullContext;
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

    // TODO: fix the other code so I don't have to re-idx everything
    top = reIdx(top);
    const reused = findIdxReuse(top);
    if (reused.length) {
        console.error(reused);
    }

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
    } else {
        if (top.type === 'ToplevelLet') {
            // console.log(
            //     'yeah failed to verify, sorry',
            //     verify,
            //     top.elements.map((m) => m.name),
            // );
        }
    }

    pctx.actx = ctx;
    jctx.actx = ctx;
    ictx.actx = ctx;

    const refmt = pctx.ToAst.Toplevel(
        noPrintError
            ? transformToplevel(top, removeErrorDecorators(ctx), null)
            : top,
        pctx,
    );

    if (errorCount(verify)) {
        // console.log(`%cVERIFICATION FAILED`, 'color:orange');
        // const pp = newPPCtx();
        // console.log(printToString(pp.ToPP.Toplevel(refmt, pp), 100));
        // console.log(verify);
    }

    const irtops =
        errorCount(verify) === 0
            ? top.type === 'ToplevelExpression'
                ? [toJs(top.expr, ctx.getType(top.expr), ictx, jctx, pctx, ctx)]
                : top.type === 'ToplevelLet'
                ? top.elements.map((el, i) =>
                      toJs(
                          el.expr,
                          el.typ ?? ctx.getType(el.expr),
                          ictx,
                          jctx,
                          pctx,
                          ctx,
                          toId((top as t.ToplevelLet).hash!, i),
                          jctx.addGlobalName(
                              toId((top as t.ToplevelLet).hash!, i),
                              el.name,
                          ),
                      ),
                  )
                : []
            : null;

    const uses: { [key: string]: true } = {};
    // let's do annotations
    const annotations: { loc: t.Loc; text: string }[] = [];
    // const allLocals: t.Locals = [];
    transformToplevel(top, annotationVisitor(annotations, uses), {
        ...ctx,
        allLocals: annotations,
    });
    Object.keys(verify.cache.types).forEach((k) => {
        verify.cache.types[+k].failures.forEach((failure) => {
            annotations.push({
                loc: failure.loc,
                text: failure.error,
            });
        });
    });

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
            type: 'Info',
            contents: {
                type: 'File',
                top,
                orig: t,
                refmt,
                irtops,
            },
            uses,
            verify,
            annotations,
            comments,
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
