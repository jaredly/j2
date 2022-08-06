import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { collapseConstraints, Ctx as ACtx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TMCtx, expandEnumCases } from '../typing/typeMatches';

export const grammar = `
Pattern = PDecorated / PEnum / PName / PTuple / PRecord / PArray / PBlank / Number / String
PBlank = pseudo:"_"
PName = name:$IdText hash:($JustSym)?
PTuple = "(" _  items:PTupleItems? _ ")"
PTupleItems = first:Pattern rest:(_ "," _ Pattern)*

PArray = "[" _  items:PArrayItems? _ "]"
PArrayItems = first:PArrayItem rest:(_ "," _ PArrayItem)*
PArrayItem = Pattern / PSpread
PSpread = "..." _ inner:Pattern

PRecord = "{" _ fields:PRecordFields? _ ","? _ "}"
PRecordFields = first:PRecordField rest:(_ "," _ PRecordField)*
PRecordField = name:$IdText pat:PRecordValue?
PRecordValue = PRecordPattern / PHash
PRecordPattern = _ ":" _ just:Pattern
PHash = hash:$JustSym

PDecorated = decorators:(Decorator _)+ inner:Pattern
PEnum = "\`" text:$IdText payload:PTuple?
// PUnion
`;

export type PName = {
    type: 'PName';
    sym: t.Sym;
    loc: t.Loc;
};

export type PArray = {
    type: 'PArray';
    items: PArrayItem[];
    loc: t.Loc;
};
export type PArrayItem = Pattern | PSpread;
export type PSpread = {
    type: 'PSpread';
    inner: Pattern;
    loc: t.Loc;
};

export type PRecord = {
    type: 'PRecord';
    items: { name: string; pat: Pattern }[];
    loc: t.Loc;
};

export type PEnum = {
    type: 'PEnum';
    tag: string;
    payload: Pattern | null;
    loc: t.Loc;
};

export type Pattern =
    | PName
    | PRecord
    | PBlank
    | PEnum
    | PArray
    | t.Number
    | t.String
    | PDecorated;
export type PDecorated = {
    type: 'PDecorated';
    decorators: t.Decorator[];
    inner: Pattern;
    loc: t.Loc;
};
export type PBlank = { type: 'PBlank'; loc: t.Loc };

export type Locals = { sym: t.Sym; type: t.Type }[];

export const getLocals = (
    pat: Pattern,
    type: t.Type,
    locals: Locals,
    ctx: TMCtx,
): void => {
    switch (pat.type) {
        case 'PBlank':
        case 'Number':
        case 'String':
            return;
        case 'PDecorated':
            return getLocals(pat.inner, type, locals, ctx);
        case 'PName':
            locals.push({ sym: pat.sym, type });
            return;
        case 'PArray':
            const t = arrayType(type, ctx);
            if (!t) {
                return;
            }
            return pat.items.forEach((item) =>
                item.type === 'PSpread'
                    ? getLocals(item.inner, type, locals, ctx)
                    : getLocals(item, t[0], locals, ctx),
            );
        case 'PRecord':
            if (type.type === 'TVbl') {
                type = collapseConstraints(
                    ctx.currentConstraints(type.id),
                    ctx,
                );
            }
            type = ctx.resolveRefsAndApplies(type) ?? type;
            if (type.type !== 'TRecord') {
                return;
            }
            const eitems = allRecordItems(type, ctx);
            if (eitems) {
                pat.items.forEach(({ name, pat: item }) => {
                    if (eitems[name]) {
                        getLocals(item, eitems[name].value, locals, ctx);
                    }
                });
            }
            return;
        case 'PEnum': {
            if (type.type === 'TVbl') {
                type = collapseConstraints(
                    ctx.currentConstraints(type.id),
                    ctx,
                );
            }
            type = ctx.resolveRefsAndApplies(type) ?? type;
            type = maybeExpandTask(type, ctx) ?? type;
            if (type.type !== 'TEnum') {
                return;
            }
            const cases = expandEnumCases(type, ctx)?.cases ?? [];
            for (let kase of cases) {
                if (kase.tag === pat.tag) {
                    if (kase.payload && pat.payload) {
                        getLocals(pat.payload, kase.payload, locals, ctx);
                    }
                    return;
                }
            }
            return;
        }
        default:
            let _x: never = pat;
    }
};

export const ToTast = {
    PBlank(pat: p.PBlank, ctx: TCtx): t.Pattern {
        return { type: 'PBlank', loc: pat.loc };
    },
    PName({ type, name, hash, loc }: p.PName, ctx: TCtx): PName | PBlank {
        if (name === '_' && !hash) {
            return { type: 'PBlank', loc };
        }
        const sym = hash
            ? { name, id: +hash.slice(2, -1), loc }
            : ctx.sym(name, loc);
        // locals.push({ sym, type: expected ?? ctx.newTypeVar() });
        return {
            type: 'PName',
            sym,
            loc,
        };
    },
    PArray({ items, loc }: p.PArray, ctx: TCtx): PArray {
        return {
            type: 'PArray',
            items:
                items?.items.map((item) => ctx.ToTast.PArrayItem(item, ctx)) ??
                [],
            loc,
        };
    },
    PSpread({ inner, loc }: p.PSpread, ctx: TCtx): PSpread {
        return {
            type: 'PSpread',
            inner: ctx.ToTast.Pattern(inner, ctx),
            loc,
        };
    },
    PEnum({ text, payload, loc }: p.PEnum, ctx: TCtx): PEnum {
        return {
            type: 'PEnum',
            tag: text,
            payload: payload ? ctx.ToTast.PTuple(payload, ctx) : null,
            loc,
        };
    },
    PTuple({ type, items, loc }: p.PTuple, ctx: TCtx): Pattern {
        if (items?.items.length === 1) {
            return ctx.ToTast.Pattern(items.items[0], ctx);
        }
        return {
            type: 'PRecord',
            items:
                items?.items.map((item, i) => ({
                    name: i.toString(),
                    pat: ctx.ToTast.Pattern(item, ctx),
                })) ?? [],
            loc,
        };
    },
    PDecorated(
        { type, decorators, inner, loc }: p.PDecorated,
        ctx: TCtx,
    ): PDecorated {
        return {
            type: 'PDecorated',
            decorators: decorators.map((dec) => ctx.ToTast.Decorator(dec, ctx)),
            inner: ctx.ToTast.Pattern(inner, ctx),
            loc,
        };
    },
    PRecord({ type, fields, loc }: p.PRecord, ctx: TCtx): PRecord {
        return {
            type: 'PRecord',
            items:
                fields?.items.map((item) => ({
                    name: item.name,
                    pat:
                        item.pat && item.pat.type !== 'PHash'
                            ? ctx.ToTast.Pattern(item.pat, ctx)
                            : ctx.ToTast.PName(
                                  {
                                      type: 'PName',
                                      name: item.name,
                                      hash: item.pat ? item.pat.hash : '',
                                      loc,
                                  },
                                  ctx,
                              ),
                })) ?? [],
            loc,
        };
    },
};

export const ToAst = {
    PDecorated(pat: t.PDecorated, ctx: TACtx): p.PDecorated {
        return {
            type: 'PDecorated',
            decorators: pat.decorators.map((dec) =>
                ctx.ToAst.Decorator(dec, ctx),
            ),
            inner: ctx.ToAst.Pattern(pat.inner, ctx),
            loc: pat.loc,
        };
    },
    PEnum(pat: t.PEnum, ctx: TACtx): p.PEnum {
        let payload = pat.payload ? ctx.ToAst.Pattern(pat.payload, ctx) : null;
        return {
            type: 'PEnum',
            text: pat.tag,
            loc: pat.loc,
            payload:
                payload && payload.type !== 'PTuple'
                    ? {
                          type: 'PTuple',
                          items: {
                              type: 'PTupleItems',
                              items: [payload],
                              loc: pat.loc,
                          },
                          loc: pat.loc,
                      }
                    : payload,
        };
    },
    PBlank(pat: t.PBlank, ctx: TACtx): p.PBlank {
        return { type: 'PBlank', loc: pat.loc, pseudo: '_' };
    },
    PName({ type, sym, loc }: PName, ctx: TACtx): p.PName {
        ctx.recordSym(sym, 'value');
        return {
            type: 'PName',
            name: sym.name,
            hash: ctx.showIds ? `#[${sym.id}]` : null,
            loc,
        };
    },
    PArray({ type, items, loc }: PArray, ctx: TACtx): p.PArray {
        return {
            type: 'PArray',
            items: {
                type: 'PArrayItems',
                items: items.map((item) => ctx.ToAst.PArrayItem(item, ctx)),
                loc,
            },
            loc,
        };
    },
    PSpread({ inner, loc }: PSpread, ctx: TACtx): p.PSpread {
        return {
            type: 'PSpread',
            inner: ctx.ToAst.Pattern(inner, ctx),
            loc,
        };
    },
    PRecord({ type, items, loc }: PRecord, ctx: TACtx): p.Pattern {
        if (items.every((item, i) => item.name === i.toString())) {
            return {
                type: 'PTuple',
                items: {
                    type: 'PTupleItems',
                    items: items.map((item) =>
                        ctx.ToAst.Pattern(item.pat, ctx),
                    ),
                    loc,
                },
                loc,
            };
        }
        return {
            type: 'PRecord',
            fields: {
                type: 'PRecordFields',
                items: items.map((item) => {
                    const pat = ctx.ToAst.Pattern(item.pat, ctx);
                    return {
                        type: 'PRecordField',
                        name: item.name,
                        pat:
                            pat.type === 'PName' && pat.name === item.name
                                ? {
                                      type: 'PHash',
                                      hash: pat.hash ?? '',
                                      loc: pat.loc,
                                  }
                                : pat,
                        loc: item.pat.loc,
                    };
                }),
                loc,
            },
            loc,
        };
    },
    TVbl({ id, loc }: t.TVbl, ctx: TACtx): p.Type {
        // TODO: I think we just get the current unity of the constraints?
        // throw new Error(`Unresolved type variables cant be represented?`);
        debugger;
        return { type: 'String', text: 'tvbl:' + id, loc };
    },
};

export const ToPP = {
    PBlank({ type, loc }: p.PBlank, ctx: PCtx): pp.PP {
        return pp.atom('_', loc);
    },
    PName({ type, name, hash, loc }: p.PName, ctx: PCtx): pp.PP {
        return pp.text(name + (hash ? hash : ''), loc);
    },
    PTuple({ type, items, loc }: p.PTuple, ctx: PCtx): pp.PP {
        return pp.args(
            items?.items.map((item) => ctx.ToPP.Pattern(item, ctx)) ?? [],
            loc,
        );
    },
    PEnum({ type, text, payload, loc }: p.PEnum, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('`' + text, loc),
                payload ? ctx.ToPP.Pattern(payload, ctx) : null,
            ],
            loc,
        );
    },
    PDecorated(pat: p.PDecorated, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.items(
                    pat.decorators.map((d) => ctx.ToPP.Decorator(d, ctx)),
                    pat.loc,
                ),
                ctx.ToPP.Pattern(pat.inner, ctx),
            ],
            pat.loc,
        );
    },
    PArray({ items, loc }: p.PArray, ctx: PCtx): pp.PP {
        return pp.args(
            items?.items?.map((item) => ctx.ToPP.PArrayItem(item, ctx)) ?? [],
            loc,
            '[',
            ']',
        );
    },
    PSpread({ inner, loc }: p.PSpread, ctx: PCtx): pp.PP {
        return pp.items(
            [pp.text('...', loc), ctx.ToPP.Pattern(inner, ctx)],
            loc,
        );
    },
    PRecord({ type, fields, loc }: p.PRecord, ctx: PCtx): pp.PP {
        return pp.args(
            fields?.items.map((item) =>
                pp.items(
                    [
                        pp.text(item.name, loc),
                        item.pat && item.pat.type !== 'PHash'
                            ? pp.items(
                                  [
                                      pp.text(': ', loc),
                                      ctx.ToPP.Pattern(item.pat, ctx),
                                  ],
                                  item.pat.loc,
                              )
                            : item.pat
                            ? pp.text(item.pat.hash, item.pat.loc)
                            : null,
                    ],
                    loc,
                ),
            ) ?? [],
            loc,
            '{',
            '}',
        );
    },
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const ToIR = {
    // PName(p: PName, ctx: ICtx): t.IPattern {
    //     return p;
    // },
    // PTuple(p: PTuple, ctx: ICtx): t.IPattern {
    //     return { type: 'PName', loc: p.loc, sym: { id: 0, name: 'bad' } };
    // },
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { allRecordItems } from './records';
import { and } from './ifs';
import { maybeExpandTask } from '../typing/tasks';
import { arrayType } from '../typing/getType';
import { collapseOps } from '../typing/ops';
export const ToJS = {
    /**
     * An expression that evaluates to "true"
     * if the expression matches.
     */
    PatternCond(
        p: Pattern,
        target: b.Expression,
        type: t.Type,
        ctx: JCtx,
    ): b.Expression | null {
        type = ctx.actx.resolveAnalyzeType(type) ?? type;
        // ctx.actx.debugger();
        switch (p.type) {
            case 'PBlank':
                return null;
            case 'Number':
            case 'String':
                return b.binaryExpression(
                    '===',
                    target,
                    p.type === 'Number'
                        ? b.numericLiteral(p.value)
                        : b.stringLiteral(p.text),
                );
            case 'PEnum': {
                const etype = maybeExpandTask(type, ctx.actx) ?? type;
                if (etype.type !== 'TEnum') {
                    // TODO: make this an error
                    return null;
                }
                const cases = expandEnumCases(etype, ctx.actx);
                if (!cases) {
                    return null;
                }
                const allBare =
                    cases.cases.every((kase) => !kase.payload) &&
                    !cases.bounded.length;
                const anyBare =
                    cases.cases.some((kase) => !kase.payload) ||
                    cases.bounded.length;
                const targetCheck = allBare
                    ? target
                    : anyBare
                    ? b.conditionalExpression(
                          b.binaryExpression(
                              '===',
                              b.unaryExpression('typeof', target),
                              b.stringLiteral('string'),
                          ),
                          target,
                          b.memberExpression(target, b.identifier('tag')),
                      )
                    : b.memberExpression(target, b.identifier('tag'));
                const one =
                    cases.cases.length === 1 && !cases.bounded.length
                        ? null
                        : b.binaryExpression(
                              '===',
                              targetCheck,
                              b.stringLiteral(p.tag),
                          );
                if (!p.payload) {
                    return one;
                }
                const myCase = cases.cases.find((k) => k.tag === p.tag);
                if (!myCase) {
                    return b.logicalExpression(
                        '&&',
                        one || b.booleanLiteral(false),
                        b.identifier('invalid case ' + p.tag),
                    );
                }
                const inner = ctx.ToJS.PatternCond(
                    p.payload,
                    b.memberExpression(target, b.identifier('payload')),
                    myCase.payload ?? { type: 'TBlank', loc: p.loc },
                    ctx,
                );
                return inner && one
                    ? b.logicalExpression('&&', one, inner)
                    : one ?? inner;
            }
            case 'PName':
                return null;
            case 'PDecorated':
                return ctx.ToJS.PatternCond(p.inner, target, type, ctx);
            case 'PArray':
                const t = arrayType(type, ctx.actx);
                if (!t) {
                    return b.booleanLiteral(false);
                }
                let count = 0;
                const fulls = p.items.filter(
                    (item) => item.type !== 'PSpread',
                ).length;
                const items = p.items.map((item, i) => {
                    if (item.type === 'PSpread') {
                        const inner = ctx.ToJS.PatternCond(
                            item.inner,
                            b.callExpression(
                                b.memberExpression(
                                    target,
                                    b.identifier('slice'),
                                ),
                                [
                                    b.numericLiteral(count),
                                    b.numericLiteral(t.length),
                                ],
                            ),
                            {
                                type: 'TApply',
                                loc: p.loc,
                                args: [
                                    t[0],
                                    collapseOps(
                                        {
                                            left: t[1],
                                            loc: p.loc,
                                            type: 'TOps',
                                            right: [
                                                {
                                                    top: '-',
                                                    right: {
                                                        type: 'Number',
                                                        loc: p.loc,
                                                        value: fulls,
                                                        kind: 'UInt',
                                                    },
                                                },
                                            ],
                                        },
                                        ctx.actx,
                                    ),
                                ],
                                target: {
                                    type: 'TRef',
                                    ref: ctx.actx.getBuiltinRef('Array')!,
                                    loc: p.loc,
                                },
                            },
                            ctx,
                        );
                        return inner;
                    }
                    return ctx.ToJS.PatternCond(
                        item,
                        b.memberExpression(target, b.numericLiteral(i), true),
                        t[0],
                        ctx,
                    );
                });
                // return items.some(Boolean) ? b.arrayPattern(items) : null;
                return and([
                    b.binaryExpression(
                        '>=',
                        b.memberExpression(target, b.identifier('length')),
                        b.numericLiteral(fulls),
                    ),
                    ...(items.filter(Boolean) as b.Expression[]),
                ]);
            case 'PRecord':
                if (type.type !== 'TRecord' || p.items.length === 0) {
                    return null;
                }
                const trec = type;
                if (p.items.every((item, i) => item.name === i.toString())) {
                    const hello = p.items
                        .map((item, i) => {
                            return ctx.ToJS.PatternCond(
                                item.pat,
                                b.memberExpression(
                                    target,
                                    b.numericLiteral(i),
                                    true,
                                ),
                                trec.items[i].value,
                                ctx,
                            );
                        })
                        .filter(Boolean) as b.Expression[];
                    if (!hello.length) {
                        return null;
                    }
                    return and(hello);
                } else {
                    const hello = p.items
                        .map((item, i) => {
                            return ctx.ToJS.PatternCond(
                                item.pat,
                                b.memberExpression(
                                    target,
                                    b.identifier(item.name),
                                ),
                                trec.items[i].value,
                                ctx,
                            );
                        })
                        .filter(Boolean) as b.Expression[];
                    if (!hello.length) {
                        return null;
                    }
                    return and(hello);
                }
        }
    },
    Pattern(p: Pattern, ctx: JCtx): b.Pattern | b.Identifier | null {
        switch (p.type) {
            case 'Number':
            case 'String':
            case 'PBlank':
                return null;
            case 'PEnum':
                if (p.payload) {
                    const inner = ctx.ToJS.Pattern(p.payload, ctx);
                    return inner
                        ? b.objectPattern([
                              b.objectProperty(b.identifier('payload'), inner),
                          ])
                        : null;
                }
                return null;
            case 'PArray':
                const items = p.items.map((item) => {
                    if (item.type === 'PSpread') {
                        const inner = ctx.ToJS.Pattern(item.inner, ctx);
                        return inner ? b.restElement(inner) : null;
                    }

                    return ctx.ToJS.Pattern(item, ctx);
                });
                return items.some(Boolean) ? b.arrayPattern(items) : null;
            case 'PName':
                return b.identifier(p.sym.name);
            case 'PDecorated':
                return ctx.ToJS.Pattern(p.inner, ctx);
            case 'PRecord':
                if (p.items.length === 0) {
                    return null;
                }
                if (p.items.every((item, i) => item.name === i.toString())) {
                    return b.arrayPattern(
                        p.items.map((item) => ctx.ToJS.Pattern(item.pat, ctx)),
                    );
                } else {
                    return b.objectPattern(
                        p.items
                            .map((item) => {
                                const inner = ctx.ToJS.Pattern(item.pat, ctx);
                                return inner
                                    ? b.objectProperty(
                                          b.identifier(item.name),
                                          inner,
                                      )
                                    : null;
                            })
                            .filter(Boolean) as b.ObjectProperty[],
                    );
                }
        }
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
