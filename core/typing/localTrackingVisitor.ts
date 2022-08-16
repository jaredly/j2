import { FullContext } from '../ctx';
import { getLocals } from '../elements/pattern';
import { typeForPattern } from '../elements/patterns/typeForPattern';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx as TMCtx } from './typeMatches';
import { typeToString } from './__test__/typeToString';
import { Ctx } from './analyze';

export const localTrackingVisitor: Visitor<LTCtx> = {
    Lambda(node, ctx) {
        const locals: t.Locals = [];

        node.args.forEach((arg) => getLocals(arg.pat, arg.typ, locals, ctx));
        return [null, ctx.withLocals(tee(locals, ctx)) as Ctx];
    },
    Block(node, ctx) {
        return [
            null,
            ctx.withLocals(tee(blockLocals(node, ctx as Ctx), ctx)) as Ctx,
        ];
    },
    IfYes(node, ctx) {
        return [
            null,
            ctx.withLocals(tee(ifLocals(node, ctx as Ctx), ctx)) as Ctx,
        ];
    },
    Switch(node, ctx) {
        const res = ctx.getType(node.target);
        if (!res) {
            console.error(`Unable to get type for switch!`);
        }
        return [null, { ...ctx, switchType: res ?? undefined }];
    },
    TVars(node, ctx) {
        return [null, ctx.withLocalTypes(node.args)];
    },
    TypeAbstraction(node, ctx) {
        return [null, ctx.withLocalTypes(node.items)];
    },
    Case(node, ctx) {
        if (!ctx.switchType) {
            console.error('no switch type');
            return null;
        }

        return [
            null,
            ctx.withLocals(
                tee(caseLocals(ctx.switchType, node, ctx as Ctx), ctx),
            ) as Ctx,
        ];
    },
};
export const blockLocals = (node: t.Block, ctx: TMCtx) => {
    const locals: t.Locals = [];
    node.stmts.forEach((stmt) => {
        if (stmt.type === 'Let') {
            const typ = ctx.getType(stmt.expr) ?? typeForPattern(stmt.pat, ctx);
            getLocals(stmt.pat, typ, locals, ctx);
        }
    });
    return locals;
};

export const letLocals = (node: t.Let, ctx: TMCtx) => {
    const locals: t.Locals = [];
    const typ = ctx.getType(node.expr) ?? typeForPattern(node.pat, ctx);
    getLocals(node.pat, typ, locals, ctx);
    return locals;
};

export const ifLocals = (node: t.IfYes, ctx: TMCtx) => {
    const locals: t.Locals = [];
    node.conds.map((cond) => {
        if (cond.type === 'Let') {
            getLocals(
                cond.pat,
                ctx.getType(cond.expr) ?? typeForPattern(cond.pat, ctx),
                locals,
                ctx,
            );
        }
        return cond;
    });
    return locals;
};

export const caseLocals = (switchType: t.Type, node: t.Case, ctx: TMCtx) => {
    const locals: t.Locals = [];
    getLocals(node.pat, switchType, locals, ctx);
    return locals;
};

export type AllLocals = { loc: t.Loc; text: string }[];
const tee = (locals: t.Locals, ctx: TMCtx & { allLocals?: AllLocals }) => {
    if (ctx.allLocals) {
        ctx.allLocals.push(
            ...locals.map(({ sym, type }) => ({
                loc: sym.loc,
                text: typeToString(type, ctx as FullContext),
            })),
        );
    }
    return locals;
};

export type LTCtx = TMCtx & { switchType?: t.Type; allLocals?: AllLocals };
