// So ...
// do we want to be able to define .. like ... 'passes' or something?
// orwait, maybe all I need is to be able to record the hash of a toplevel?
// So, after analyze, we record the hash. then that is used from here on out.

import { builtinContext, FullContext } from '../ctx';
import { removeErrorDecorators, typeToplevel } from '../elements/base';
import * as p from '../grammar/base.parser';
import { fixComments } from '../grammar/fixComments';
import { iCtx } from '../ir/ir';
import { jCtx } from '../ir/to-js';
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

export type IrTop = {
    type: t.Type | null;
    ir: t.IExpression;
    js: b.Expression;
};

export type FileContents = {
    type: 'File';
    top: t.Toplevel;
    refmt: p.Toplevel;
    irtops: null | IrTop[];
};

export type TypeContents = {
    type: 'Type';
    top: t.TypeToplevel;
    refmt: p.TypeToplevel;
};

export type ToplevelInfo<Contents> = {
    contents: Contents;
    verify: Verify;
    annotations: { loc: t.Loc; text: string }[];
};

export const toJs = (
    t: t.Expression,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    ctx: FullContext,
) => {
    const ir = ictx.ToIR.Expression(t, ictx);
    const js = jctx.ToJS.IExpression(ir, jctx);
    return { ir, js, type: ctx.getType(t) };
};

export const processTypeFile = (text: string) => {
    const info: ToplevelInfo<FileContents | TypeContents>[] = [];
    let ast: p.TypeFile;
    try {
        ast = fixComments(p.parseTypeFile(text));
    } catch (err) {
        return {
            type: 'Error',
            err: (err as p.SyntaxError).location,
        };
    }

    let ctx = builtinContext.clone();
    let pctx = printCtx(ctx);
    let jctx = jCtx(ctx);
    let ictx = iCtx(ctx);

    ast.toplevels.forEach((t) => {
        const res = processTypeToplevel(t, ctx, ictx, jctx, pctx);
        info.push(res.i);
        ctx = res.ctx;
    });

    return { type: 'Success', ast, info, ctx };
};

export const processFile = (text: string) => {
    const info: ToplevelInfo<FileContents>[] = [];
    let ast: p.File;
    try {
        ast = fixComments(p.parseFile(text));
    } catch (err) {
        return {
            type: 'Error',
            err: (err as p.SyntaxError).location,
        };
    }

    let ctx = builtinContext.clone();
    let pctx = printCtx(ctx);
    let jctx = jCtx(ctx);
    let ictx = iCtx(ctx);
    // TODO: load builtins?

    ast.toplevels.forEach((t) => {
        if (t.type === 'Aliases') {
            const aliases: { [key: string]: string } = {};
            t.items.forEach(({ name, hash }) => {
                aliases[name] = hash.slice(2, -1);
            });
            ctx = ctx.withAliases(aliases) as FullContext;
            return;
        }

        const res = processToplevel(t, ctx, ictx, jctx, pctx);
        info.push(res.i);
        ctx = res.ctx;
    });

    return { type: 'Success', ast, info, ctx };
};

export const processTypeToplevel = (
    t: p.TypeToplevel,
    ctx: FullContext,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    pctx: ReturnType<typeof printCtx>,
): { i: ToplevelInfo<TypeContents>; ctx: FullContext } => {
    ctx.resetSym();
    const config = typeToplevel(t, ctx);
    ctx.resetSym();
    ctx = ctx.toplevelConfig(config) as FullContext;
    let type = ctx.ToTast.TypeToplevel(t, ctx);
    type = transformTypeToplevel(type, removeErrorDecorators(ctx), null);
    type = analyzeTypeTop(type, ctx);

    const verify = initVerify();
    transformTypeToplevel(type, verifyVisitor(verify, ctx), ctx);

    if (type.type === 'TypeAlias' && errorCount(verify) === 0) {
        const res = ctx.withTypes(type.elements);
        ctx = res.ctx as FullContext;
        // todo: top.hash folks
    }

    const refmt = pctx.ToAst.TypeToplevel(type, pctx);
    // let's do annotations
    const annotations: { loc: t.Loc; text: string }[] = [];
    transformTypeToplevel(type, annotationVisitor(annotations), ctx);

    return {
        i: {
            contents: {
                type: 'Type',
                top: type,
                refmt,
            },
            verify,
            annotations,
        },
        ctx,
    };
};

export const processToplevel = (
    t: p.Toplevel,
    ctx: FullContext,
    ictx: ReturnType<typeof iCtx>,
    jctx: ReturnType<typeof jCtx>,
    pctx: ReturnType<typeof printCtx>,
): { i: ToplevelInfo<FileContents>; ctx: FullContext } => {
    ctx.resetSym();
    const config = typeToplevel(t, ctx);
    ctx.resetSym();
    ctx = ctx.toplevelConfig(config) as FullContext;
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
            // todo: top.hash folks
        } else if (top.type === 'ToplevelLet') {
            const res = ctx.withValues(top.elements);
            ctx = res.ctx as FullContext;
            top.hash = res.hash;
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
                ? top.elements.map((el) => toJs(el.expr, ictx, jctx, ctx))
                : []
            : null;

    // let's do annotations
    const annotations: { loc: t.Loc; text: string }[] = [];
    transformToplevel(top, annotationVisitor(annotations), ctx);

    return {
        i: {
            contents: {
                type: 'File',
                top,
                refmt,
                irtops,
            },
            verify,
            annotations,
        },
        ctx,
    };
};
