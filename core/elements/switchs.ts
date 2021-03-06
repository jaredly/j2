import { Visitor } from '../transform-tast';
import { decorate, pdecorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { expandEnumCases, typeMatches } from '../typing/typeMatches';
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
import { unifyTypes } from '../typing/unifyTypes';
import { dtype } from './ifs';
import { patternIsExhaustive } from './exhaustive';

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
    ttype: t.Type;
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
                const typ =
                    ctx.actx.getType(tast.target) ?? typeForPattern(c.pat);
                const locals: t.Locals = [];
                getLocals(c.pat, typ, locals, ctx.actx);
                return {
                    type: 'Case',
                    pat: ctx.ToAst.Pattern(c.pat, ctx),
                    expr: ctx.ToAst.Expression(c.expr, {
                        ...ctx,
                        actx: ctx.actx.withLocals(locals) as ACtx,
                    }),
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
};

export const ToIR = {
    Switch(tast: Switch, ctx: ICtx): t.IExpression {
        return iife(ctx.ToIR.SwitchSt(tast, ctx), ctx);
    },
    SwitchSt(tast: Switch, ctx: ICtx): ISwitch {
        return {
            type: 'Switch',
            target: ctx.ToIR.Expression(tast.target, ctx),
            ttype: ctx.actx.getType(tast.target) ?? {
                type: 'TBlank',
                loc: tast.loc,
            },
            cases: tast.cases.map((c) => {
                const typ =
                    ctx.actx.getType(tast.target) ?? typeForPattern(c.pat);
                const locals: t.Locals = [];
                getLocals(c.pat, typ, locals, ctx.actx);
                return {
                    type: 'Case',
                    pat: c.pat,
                    expr: ctx.ToIR.BlockSt(c.expr, {
                        ...ctx,
                        actx: ctx.actx.withLocals(locals) as ACtx,
                    }),
                    loc: c.loc,
                };
            }),
            loc: tast.loc,
        };
    },
};

const asSimple = (pat: t.Pattern): b.Expression | null => {
    if (pat.type === 'Number') {
        return b.numericLiteral(pat.value);
    }
    if (pat.type === 'String') {
        return b.stringLiteral(pat.text);
    }
    if (pat.type === 'PDecorated') {
        return asSimple(pat.inner);
    }
    if (pat.type === 'PEnum' && pat.payload == null) {
        return b.stringLiteral(pat.tag);
    }
    return null;
};

export const allBare = (typ: t.TEnum, ctx: ACtx): boolean => {
    const cases = expandEnumCases(typ, ctx);
    return cases?.every((kase) => !kase.payload) ?? false;
};

export const ToJS = {
    Switch(node: ISwitch, ctx: JCtx): b.Statement {
        let cases: b.SwitchCase[] = [];
        for (let kase of node.cases) {
            if (patternIsExhaustive(kase.pat, node.ttype, ctx.actx)) {
                cases.push(
                    b.switchCase(
                        null,
                        ctx.ToJS.Block(
                            {
                                ...kase.expr,
                                stmts: [
                                    {
                                        type: 'Let',
                                        loc: kase.loc,
                                        pat: kase.pat,
                                        expr: node.target,
                                        typ: node.ttype,
                                    },
                                    ...kase.expr.stmts,
                                ],
                            },
                            ctx,
                        ).body,
                    ),
                );
                break;
            }
            const test = asSimple(kase.pat);
            if (!test) {
                return b.expressionStatement(
                    b.identifier(`switch too complex`),
                );
            }
            const typ = node.ttype;
            const locals: t.Locals = [];
            getLocals(kase.pat, typ, locals, ctx.actx);
            cases.push(
                b.switchCase(test, [
                    ctx.ToJS.Block(kase.expr, {
                        ...ctx,
                        actx: ctx.actx.withLocals(locals) as ACtx,
                    }),
                ]),
            );
        }
        let target = ctx.ToJS.IExpression(node.target, ctx);
        if (node.ttype.type === 'TBlank') {
            target = b.identifier(`_ blank type`);
        }
        if (node.ttype.type === 'TEnum') {
            const cases = expandEnumCases(node.ttype, ctx.actx);
            const allBare = cases?.every((kase) => !kase.payload) ?? false;
            if (!allBare) {
                if (cases?.length === 1) {
                    target = b.memberExpression(target, b.identifier('tag'));
                } else {
                    target = b.conditionalExpression(
                        b.binaryExpression(
                            '===',
                            b.unaryExpression('typeof', target),
                            b.stringLiteral('string'),
                        ),
                        target,
                        b.memberExpression(target, b.identifier('tag')),
                    );
                }
            }
        }
        return b.switchStatement(target, cases);
    },
};

export type AVCtx = {
    ctx: ACtx;
    hit: {};
    switchType?: t.Type | null;
};

export const Analyze: Visitor<AVCtx> = {
    Switch(node, { ctx, hit }) {
        const target = ctx.getType(node.target);
        if (!target) {
            return null;
        }
        let body: null | t.Type = null;
        let changed = false;
        const cases = node.cases.map((c) => {
            const matches = typeMatchesPattern(c.pat, target, ctx);
            let bt = ctx.getType(c.expr);
            if (body && bt) {
                let un = unifyTypes(body, bt, ctx);
                if (un == false) {
                    changed = true;
                    c = {
                        ...c,
                        expr: decorate(c.expr, 'caseMismatch', hit, ctx, [
                            dtype('expected', body, c.loc),
                        ]),
                    };
                } else {
                    body = un;
                }
            } else if (bt) {
                body = bt;
            }
            if (!matches) {
                changed = true;
                return {
                    ...c,
                    pat: pdecorate(c.pat, 'patternMismatch', { ctx, hit }),
                };
            }
            return c;
        });
        return [
            changed ? { ...node, cases } : null,
            { ctx, hit, switchType: target },
        ];
    },
    Case(node, ctx) {
        if (!ctx.switchType) {
            console.error('no switch type');
            return null;
        }

        const typ = ctx.switchType;
        const locals: t.Locals = [];
        getLocals(node.pat, typ, locals, ctx.ctx);

        return [null, { ...ctx, ctx: ctx.ctx.withLocals(locals) as ACtx }];
    },
};
