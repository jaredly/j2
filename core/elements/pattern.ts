import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Visitor } from '../transform-tast';
import * as t from '../typed-ast';
import { Ctx as ACtx } from '../typing/analyze';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TMCtx, expandEnumCases } from '../typing/typeMatches';

export const grammar = `
Pattern = PDecorated / PEnum / PName / PTuple / PRecord / PBlank / Number / String
PBlank = pseudo:"_"
PName = name:$IdText hash:($JustSym)?
PTuple = "(" _  items:PTupleItems? _ ")"
PTupleItems = first:Pattern rest:(_ "," _ Pattern)*
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

// export type PTuple = {
//     type: 'PTuple';
//     items: Pattern[];
//     loc: t.Loc;
// };

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

// export type PPath =
//     | { type: 'Tuple'; idx: number }
//     | {
//           type: 'Enum';
//           tag: string;
//       };

/*

can we bring this back?

// the arg is a vbl, right?
// orr can we do like a `type from pattern`?
// hmm maybe I can do that.
((a, b)) => a + b

*/

// export const typeFromPattern = (pat: Pattern, ctx: TCtx): t.Type => {
//     switch (pat.type) {
//         case 'PName':
//             return ctx.symType(pat.sym);
//         // case 'PTuple':
//         //     return {
//         //         type: 'T'
//         //     }
//     }
// };

export const refineType = (
    pat: Pattern,
    type: t.Type,
    ctx: TMCtx,
): t.Type | null => {
    switch (pat.type) {
        case 'PBlank':
        case 'PName':
            return null;
        case 'PRecord': {
            if (type.type !== 'TRecord') {
                return type;
            }
            const items = allRecordItems(type, ctx);
            if (!items) {
                return type;
            }
            // let res: t.RecordKeyValue = [];
            // const byName: {[key: string]: Pattern} = {}
            // pat.items.forEach(({name, pat}) => byName[name] = pat)
            // for (let [name, value] of Object.entries(items)) {
            //     if (byName[name]) {
            //     }
            // }
            let remaining = false;

            for (let { name, pat: cpat } of pat.items) {
                if (!items[name]) {
                    return type;
                }
                const res = refineType(cpat, items[name].value, ctx);
                if (res != null) {
                    remaining = true;
                    items[name] = { ...items[name], value: res };
                }
            }
            return remaining
                ? {
                      ...type,
                      spreads: [],
                      items: Object.values(items),
                  }
                : null;
        }
        case 'PDecorated': {
            return refineType(pat.inner, type, ctx);
        }
        case 'PEnum': {
            type = maybeExpandTask(type, ctx) ?? type;
            if (type.type !== 'TEnum') {
                return type;
            }
            const cases = expandEnumCases(type, ctx);
            if (!cases) {
                return { ...type, cases: [] }; // all out of cases!
            }
            const res: t.EnumCase[] = [];
            for (let kase of cases) {
                if (kase.tag === pat.tag) {
                    if (!pat.payload) {
                        // return {
                        //     ...type,
                        //     cases: cases.filter(k => k.tag !== pat.tag)
                        // };
                        continue;
                    }
                    if (kase.payload) {
                        const inner = refineType(
                            pat.payload,
                            kase.payload,
                            ctx,
                        );
                        if (inner == null) {
                            continue;
                        }
                        res.push({ ...kase, payload: inner });
                    }
                    // return (
                    //     kase.payload != null &&
                    //     typeMatchesPattern(pat.payload, kase.payload, ctx)
                    // );
                } else {
                    res.push(kase);
                }
            }
            return { ...type, cases: res };
        }
        // TODO: Records and such
    }
    return type;
};

/**
 * Checks to see if the type of an arg or let is appropriate.
 */
export const typeMatchesPattern = (
    pat: Pattern,
    type: t.Type,
    ctx: TMCtx,
): boolean => {
    switch (pat.type) {
        case 'Number': {
            if (type.type === 'Number') {
                return type.kind === pat.kind && type.value === pat.value;
            }
            return ctx.isBuiltinType(type, pat.kind.toLowerCase());
        }
        case 'String': {
            if (type.type === 'String') {
                return type.text === pat.text;
            }
            return ctx.isBuiltinType(type, 'string');
        }
        case 'PDecorated': {
            return typeMatchesPattern(pat.inner, type, ctx);
        }
        case 'PEnum': {
            type = maybeExpandTask(type, ctx) ?? type;
            if (type.type !== 'TEnum') {
                return false;
            }
            const cases = expandEnumCases(type, ctx);
            if (!cases) {
                return true;
            }
            for (let kase of cases) {
                if (kase.tag === pat.tag) {
                    if (!pat.payload) {
                        return true;
                    }
                    return (
                        kase.payload != null &&
                        typeMatchesPattern(pat.payload, kase.payload, ctx)
                    );
                }
            }
            return false;
        }
        case 'PRecord': {
            if (type.type !== 'TRecord') {
                return false;
            }
            const items = allRecordItems(type, ctx);
            if (!items) {
                return false;
            }
            for (let { name, pat: cpat } of pat.items) {
                if (!items[name]) {
                    return false;
                }
                if (!typeMatchesPattern(cpat, items[name].value, ctx)) {
                    return false;
                }
            }
            return true;
        }
        case 'PName':
        case 'PBlank':
            return true;
    }
};

export const typeForPattern = (pat: Pattern, ctx?: TCtx): t.Type => {
    switch (pat.type) {
        case 'Number':
        case 'String':
            return pat;
        case 'PEnum':
            return {
                type: 'TEnum',
                open: false,
                loc: pat.loc,
                cases: [
                    {
                        type: 'EnumCase',
                        tag: pat.tag,
                        loc: pat.loc,
                        payload: pat.payload
                            ? typeForPattern(pat.payload, ctx)
                            : undefined,
                        decorators: [],
                    },
                ],
            };
        case 'PName':
            return ctx ? ctx.newTypeVar() : { type: 'TBlank', loc: pat.loc };
        case 'PDecorated':
            return typeForPattern(pat.inner, ctx);
        case 'PRecord':
            return {
                type: 'TRecord',
                items: pat.items.map(({ name, pat }) => ({
                    type: 'TRecordKeyValue',
                    key: name,
                    value: typeForPattern(pat, ctx),
                    loc: pat.loc,
                    default_: null,
                })),
                loc: pat.loc,
                open: pat.items.length > 0,
                spreads: [],
            };
        case 'PBlank':
            return { type: 'TBlank', loc: pat.loc };
    }
};

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
        case 'PRecord':
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
            type = ctx.resolveRefsAndApplies(type) ?? type;
            type = maybeExpandTask(type, ctx) ?? type;
            if (type.type !== 'TEnum') {
                return;
            }
            const cases = expandEnumCases(type, ctx) ?? [];
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
        const sym = hash ? { name, id: +hash.slice(2, -1) } : ctx.sym(name);
        // locals.push({ sym, type: expected ?? ctx.newTypeVar() });
        return {
            type: 'PName',
            sym,
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
            hash: `#[${sym.id}]`,
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
        return { type: 'String', text: 'tvbl:' + id, loc };
    },
};

export const ToPP = {
    PBlank({ type, loc }: PBlank, ctx: PCtx): pp.PP {
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
export const ToJS = {
    PatternCond(
        p: Pattern,
        target: b.Expression,
        type: t.Type,
        ctx: JCtx,
    ): b.Expression | null {
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
                const allBare = cases.every((kase) => !kase.payload);
                const anyBare = cases.some((kase) => !kase.payload);
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
                    cases.length === 1
                        ? null
                        : b.binaryExpression(
                              '===',
                              targetCheck,
                              b.stringLiteral(p.tag),
                          );
                if (!p.payload) {
                    return one;
                }
                const myCase = cases.find((k) => k.tag === p.tag);
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
            case 'PRecord':
                if (type.type !== 'TRecord' || p.items.length === 0) {
                    return null;
                }
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
                                type.items[i].value,
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
                                type.items[i].value,
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
