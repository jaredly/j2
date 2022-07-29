import { FullContext, noloc } from '../ctx';
import { transformExpression, transformStmt, Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { errorCount, initVerify, verifyVisitor } from '../typing/analyze';
import { analyzeVisitor } from '../typing/analyze.gen';

type SCtx = FullContext & { tmpSym: number };

const liftStmts: Visitor<SCtx> = {
    Block(node, ctx) {
        const stmts: t.Stmt[] = [];
        let changed = false;
        const lift = (stmt: t.Expression, prefix: string): t.Expression => {
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
                                : lift(node, 'result');
                        },
                        Expression_Switch(node, path) {
                            return path[path.length - 2] === 'Let' ||
                                node === stmt
                                ? null
                                : lift(node, 'target');
                        },
                        Expression_If(node, path) {
                            return path[path.length - 2] === 'Let' ||
                                node === stmt
                                ? null
                                : lift(node, 'cond');
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

const visitors: Visitor<SCtx>[] = [liftStmts];

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
            return;
        }
        expr = changed;
    });
    return expr;
};
