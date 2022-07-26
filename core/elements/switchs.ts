import { Visitor } from '../transform-tast';
import { decorate, pdecorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';
import { Ctx as ICtx } from '../ir/ir';
import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { getLocals, typeForPattern, typeMatchesPattern } from './pattern';
import { iife } from './lets';

export const grammar = `
Switch = "switch" _ target:Expression _ "{" _ cases:Case* _ "}"
Case = _ pat:Pattern _ "=>" _ expr:Expression ";"?
`;

export type Switch = {
    type: 'Switch';
    target: t.Expression;
    cases: Case[];
    loc: t.Loc;
};
export type Case = {
    type: 'Case';
    pat: t.Pattern;
    expr: t.Expression;
    loc: t.Loc;
};

export type ISwitch = {
    type: 'Switch';
    target: t.IExpression;
    cases: ICase[];
    loc: t.Loc;
};
export type ICase = {
    type: 'Case';
    pat: t.Pattern;
    expr: t.IBlock;
    loc: t.Loc;
};

export const ToTast = {
    Switch(ast: p.Switch, ctx: TCtx): Switch {
        const target = ctx.ToTast.Expression(ast.target, ctx);
        return {
            type: 'Switch',
            target,
            cases: ast.cases.map((c) => {
                const pat = ctx.ToTast.Pattern(c.pat, ctx);
                const typ = ctx.getType(target) ?? typeForPattern(pat, ctx);
                const locals: t.Locals = [];
                getLocals(pat, typ, locals, ctx);
                return {
                    type: 'Case',
                    pat: pat,
                    expr: ctx.ToTast.Expression(
                        c.expr,
                        ctx.withLocals(locals) as TCtx,
                    ),
                    loc: c.loc,
                };
            }),
            loc: ast.loc,
        };
    },
};

export const ToAst = {
    Switch(tast: Switch, ctx: TACtx): p.Switch {
        return {
            type: 'Switch',
            target: ctx.ToAst.Expression(tast.target, ctx),
            cases: tast.cases.map((c) => {
                return {
                    type: 'Case',
                    pat: ctx.ToAst.Pattern(c.pat, ctx),
                    expr: ctx.ToAst.Expression(c.expr, ctx),
                    loc: c.loc,
                };
            }),
            loc: tast.loc,
        };
    },
};

export const ToPP = {
    Switch(tast: p.Switch, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.items(
                    [
                        pp.text('switch ', tast.loc),
                        ctx.ToPP.Expression(tast.target, ctx),
                        pp.text(' {', tast.loc),
                    ],
                    tast.loc,
                ),
                ...tast.cases.map((c) => {
                    return pp.items(
                        [
                            pp.text('  ', c.loc),
                            ctx.ToPP.Pattern(c.pat, ctx),
                            pp.text(' => ', c.loc),
                            ctx.ToPP.Expression(c.expr, ctx),
                        ],
                        c.loc,
                    );
                }),
                pp.text('}', tast.loc),
            ],
            tast.loc,
            'always',
        );
    },
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const ToIR = {
    Switch(tast: Switch, ctx: ICtx): t.IExpression {
        return iife(ctx.ToIR.SwitchSt(tast, ctx), ctx);
    },
    SwitchSt(tast: Switch, ctx: ICtx): ISwitch {
        return {
            type: 'Switch',
            target: ctx.ToIR.Expression(tast.target, ctx),
            cases: tast.cases.map((c) => {
                return {
                    type: 'Case',
                    pat: c.pat,
                    expr: ctx.ToIR.BlockSt(c.expr, ctx),
                    loc: c.loc,
                };
            }),
            loc: tast.loc,
        };
    },
};

export const ToJS = {
    Switch(node: ISwitch, ctx: JCtx): b.Statement {
        return b.switchStatement(ctx.ToJS.IExpression(node.target, ctx), []);
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    Switch(node, { ctx, hit }) {
        const target = ctx.getType(node.target);
        if (!target) {
            return null;
        }
        let changed = false;
        const cases = node.cases.map((c) => {
            const matches = typeMatchesPattern(c.pat, target, ctx);
            if (!matches) {
                changed = true;
                return {
                    ...c,
                    pat: pdecorate(c.pat, 'patternMismatch', { ctx, hit }),
                };
            }
            return c;
        });
        return changed ? { ...node, cases } : null;
    },
};
