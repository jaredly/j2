import { FullContext, noloc } from '../ctx';
import { transformExpression, transformStmt, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { errorCount, initVerify, verifyVisitor } from '../typing/analyze';
import { analyzeVisitor } from '../typing/analyze.gen';
import { typeMatches } from '../typing/typeMatches';
import * as b from '@babel/types';
import { allRecordItems } from '../elements/records';
import { reduceAwaits } from '../elements/awaits';

type SCtx = FullContext & { tmpSym: number };

const makeSuper = (
    vtype: t.Type,
    etype: t.Type,
    target: t.Expression,
    ctx: FullContext,
): null | t.Expression => {
    vtype = ctx.resolveAnalyzeType(vtype) ?? vtype;
    etype = ctx.resolveAnalyzeType(etype) ?? etype;
    if (vtype.type !== 'TRecord' || etype.type !== 'TRecord') {
        return null;
    }

    const vitems = allRecordItems(vtype, ctx);
    const eitems = allRecordItems(etype, ctx);
    if (!vitems || !eitems) {
        return null;
    }

    const thems: t.Record['items'] = [];
    for (const [k, v] of Object.entries(eitems)) {
        if (!vitems[k]) {
            if (v.default_) {
                thems.push({
                    key: k,
                    loc: v.default_.loc,
                    type: 'RecordKeyValue',
                    value: v.default_,
                });
            }
        } else {
            // const sup = makeSuper(
            // 	vitems[k].value,
            // 	eitems[k].value,
            // 	// TODO: um lol I need to make member expressions work
            // 	)
        }
    }

    if (!thems.length) {
        return null;
    }

    return {
        type: 'Record',
        spreads: [target],
        loc: target.loc,
        items: thems,
    };
    // return b.objectExpression([
    // 	b.spreadElement(target),
    // ])
};

const superify: Visitor<SCtx> = {
    Apply(node, ctx) {
        let changed = false;
        const t = ctx.getType(node.target);
        if (!t || t.type !== 'TLambda') {
            return null;
        }
        const args = node.args.map((arg, i) => {
            const argt = ctx.getType(arg);
            if (!argt) {
                return arg;
            }
            // One way, but not the other
            const superr = makeSuper(argt, t.args[i].typ, arg, ctx);
            if (superr) {
                changed = true;
                arg = superr;
            }
            // if (
            //     typeMatches(argt, t.args[i].typ, ctx) &&
            //     !typeMatches(t.args[i].typ, argt, ctx)
            // ) {
            //     console.log('GOUDN', argt, t.args[i]);
            //     // changed = true
            //     // return tdecorate(arg, 'argWrongType', ctx)
            // }
            return arg;
        });
        return changed ? { ...node, args } : null;
    },
};

const reduceAwaitVisitor: Visitor<SCtx> = {
    Lambda(node, ctx) {
        const changed = reduceAwaits(node, ctx);
        // do your thing
        return changed !== node ? changed : null;
    },
};

const liftStmts: Visitor<SCtx> = {
    Block(node, ctx) {
        const stmts: t.Stmt[] = [];
        let changed = false;
        const lift = (stmt: t.Expression, prefix = 'tmp'): t.Expression => {
            changed = true;
            const sym = ctx.tmpSym++;
            stmts.push({
                type: 'Let',
                pat: {
                    type: 'PName',
                    sym: { id: sym, name: `${prefix}${sym}` },
                    loc: noloc,
                },
                expr: stmt,
                loc: noloc,
            });
            return { type: 'Ref', kind: { type: 'Local', sym }, loc: stmt.loc };
        };
        for (let stmt of node.stmts) {
            stmts.push(
                transformStmt(
                    stmt,
                    {
                        Expression_Block(node, path) {
                            return path[path.length - 2] === 'Let' ||
                                node === stmt
                                ? null
                                : lift(node);
                        },
                        Expression_Switch(node, path) {
                            return path[path.length - 2] === 'Let' ||
                                node === stmt
                                ? null
                                : lift(node);
                        },
                        Expression_If(node, path) {
                            return path[path.length - 2] === 'Let' ||
                                node === stmt
                                ? null
                                : lift(node);
                        },
                        // TODO: allow processing of lambda ... default args?
                        // or am I not going to make that a thing?
                        Lambda(node, ctx) {
                            return false;
                        },
                        Let(node, ctx) {
                            return [null, ['Let']];
                        },
                        Block(node, ctx) {
                            return false;
                        },
                        Expression(node, path) {
                            return [null, path.concat([node.type])];
                        },
                    },
                    [] as string[],
                ),
            );
        }
        return changed ? { ...node, stmts } : null;
    },
};

const visitors: Visitor<SCtx>[] = [liftStmts, superify, reduceAwaitVisitor];

export const simplify = (expr: t.Expression, ctx: FullContext) => {
    visitors.forEach((visitor) => {
        const changed = transformExpression(
            transformExpression(expr, visitor, { ...ctx, tmpSym: 1000 }),
            analyzeVisitor(),
            { ctx, hit: {} },
        );
        const v = initVerify();
        transformExpression(changed, verifyVisitor(v, ctx), ctx);
        if (errorCount(v)) {
            console.error(`Visitor produced errors`);
            console.log(v);
            // return;
        }
        expr = changed;
    });
    return expr;
};
