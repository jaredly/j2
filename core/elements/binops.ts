import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';

export const grammar = `
BinOp = first:WithUnary rest_drop:BinOpRight* 
BinOpRight = _ op:binopWithHash _ right:WithUnary
WithUnary = op_drop:UnaryOpWithHash? inner:DecoratedExpression
UnaryOpWithHash = op:UnaryOp hash:IdHash?
UnaryOp = "-" / "!"

binopWithHash = op:binop hash:IdHash?
binop = $(!"//" [+*^/<>=|&-]+)

ParenedOp = "(" _ inner:binopWithHash _ ")"

Binop = Expression

`;

export const ToTast = {
    ParenedOp(ast: p.ParenedOp, ctx: TCtx): t.Expression {
        return ctx.ToTast.Identifier(
            {
                ...ast.inner,
                text: ast.inner.op,
                type: 'Identifier',
            },
            ctx,
        );
    },
    WithUnary(ast: p.WithUnary_inner, ctx: TCtx): t.Expression {
        const inner = ctx.ToTast.Expression(ast.inner, ctx);
        // ast.op.op
        return inner;
    },
    BinOp(ast: p.BinOp_inner, ctx: TCtx): t.Expression {
        let first = ctx.ToTast.Expression(ast.first, ctx);
        let rest = ast.rest.map(({ op, right, loc }) => ({
            // op: op.op,
            level: opLevel(op.op),
            loc,
            right: ctx.ToTast.Expression(right, ctx),
            op: ctx.ToTast.Identifier(
                {
                    loc: op.loc,
                    hash: op.hash,
                    text: op.op,
                    type: 'Identifier',
                },
                ctx,
            ),
        }));

        const tree = arrangeIntoLevels(first, rest);
        return treeToExpr(tree);
    },
};

export const ToAst = {
    // Apply({ type, target, args, loc }: t.Apply, ctx: TACtx): p.Apply {
    // },
};

export const ToPP = {
    ParenedOp(ast: p.ParenedOp, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('(', ast.loc),
                pp.text(ast.inner.op + (ast.inner.hash ?? ''), ast.loc),
                // ctx.ToPP.Expression(ast.inner, ctx),
                pp.text(')', ast.loc),
            ],
            ast.loc,
        );
    },
    WithUnary(ast: p.WithUnary_inner, ctx: PCtx): pp.PP {
        const inner = ctx.ToPP.Expression(ast.inner, ctx);
        return inner;
    },
    BinOp(ast: p.BinOp_inner, ctx: PCtx): pp.PP {
        const inner = ctx.ToPP.Expression(ast.first, ctx);
        return pp.items(
            [
                inner,
                ...ast.rest.map(({ op, right, loc }) => {
                    return pp.items(
                        [
                            pp.atom(' ', loc),
                            pp.atom(op.op + (op.hash ?? ''), op.loc),
                            pp.atom(' ', loc),
                            ctx.ToPP.Expression(right, ctx),
                        ],
                        loc,
                    );
                }),
            ],
            ast.loc,
        );
    },
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};

// loosest at the top, tightest at the bottom
export const precedence = [
    ['&'],
    ['|'],
    ['='],
    ['>', '<'],
    ['+', '-'],
    ['/', '*'],
    ['^'],
];

let opLevel = (op: string) => {
    for (let i = 0; i < precedence.length; i++) {
        if (precedence[i].includes(op[0])) {
            return i;
        }
    }
    return precedence.length;
};

// OK SO
// we have {type: 'group', op, items}
// all things are left-associative I think
//
// Oh so what if, I start out with
// putting then just at the ~same level,
// and then I go through and rebalance?

/*

1
    + 2
        * 3
            + 4


1 + (2 * (3 + 4))

((1 + 2) * 3) + 4

*/

type Op = {
    type: 'op';
    left: Tree;
    op: t.Expression;
    right: Tree;
    level: number;
    loc: t.Loc;
};
type Single = { type: 'single'; expr: t.Expression };
type Tree = Op | Single;

const treeToExpr = (tree: Tree): t.Expression => {
    if (tree.type === 'single') {
        return tree.expr;
    }
    const left = treeToExpr(tree.left);
    const right = treeToExpr(tree.right);
    return {
        type: 'Apply',
        target: tree.op,
        args: [left, right],
        loc: {
            start: left.loc.start,
            end: right.loc.end,
            idx: tree.op.loc.idx,
        },
    };
};

const arrangeIntoLevels = (
    first: t.Expression,
    rest: {
        level: number;
        right: t.Expression;
        op: t.Expression;
        loc: t.Loc;
    }[],
) => {
    let current: Tree = {
        type: 'op',
        loc: rest[0].loc,
        level: rest[0].level,
        left: { type: 'single', expr: first },
        op: rest[0].op,
        right: { type: 'single', expr: rest[0].right },
    };
    rest.slice(1).forEach(({ loc, level, right, op }) => {
        current = {
            type: 'op',
            loc,
            level,
            left: current,
            op,
            right: { type: 'single', expr: right },
        };
    });
    let root: Tree = current;
    let count = 0;
    while (true) {
        const updated: Tree | null = rebalanceTree(root);
        if (updated == null) {
            break;
        }
        if (count++ > 1000) {
            throw new Error(`Too much churn rebalancing ops tree`);
        }
        root = updated;
    }
    return root;
};

/*

          A
        /   \
       B     C
      / \   / \
     D   E F   G

     if B needs to be higher than A

       B
      / \
     D   A
       /   \
      E     C
           / \
          F   G


LOWER "level number" should be "HIGHER" in the tree
*/

type BNode<Op, Leaf> = {
    type: 'op';
    left: BTree<Op, Leaf>;
    op: Op;
    loc: t.Loc;
    right: BTree<Op, Leaf>;
    level: number;
};
type BLeaf<T> = { type: 'single'; expr: T };
type BTree<Op, Leaf> = BNode<Op, Leaf> | BLeaf<Leaf>;

// Returns null if unchanged
export const rebalanceTree = <Op, Leaf>(
    tree: BTree<Op, Leaf>,
): BTree<Op, Leaf> | null => {
    if (tree.type === 'single') {
        return null;
    }
    const left = rebalanceTree(tree.left);
    const ll = left ?? tree.left;
    if (ll.type === 'op' && ll.level < tree.level) {
        return {
            ...ll,
            right: {
                ...tree,
                left: ll.right,
            },
        };
    }
    const right = rebalanceTree(tree.right);
    const rr = right ?? tree.right;
    if (rr.type === 'op' && rr.level <= tree.level) {
        return {
            ...rr,
            left: {
                ...tree,
                right: rr.left,
            },
        };
    }
    return left || right ? { ...tree, left: ll, right: rr } : null;
};
