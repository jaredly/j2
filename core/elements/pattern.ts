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
import { Ctx as ICtx } from '../ir/ir';

export const grammar = `
Pattern = PName / PTuple / PRecord / PBlank
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
    items: [string, Pattern][];
    loc: t.Loc;
};

export type Pattern = PName | PRecord | PBlank;
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

export const typeMatchesPattern = (
    pat: Pattern,
    type: t.Type,
    ctx: TMCtx,
): boolean => {
    switch (pat.type) {
        case 'PName':
            return true;
        case 'PRecord': {
            if (type.type !== 'TRecord') {
                return false;
            }
            const items = allRecordItems(type, ctx);
            if (!items) {
                return false;
            }
            for (let [name, cpat] of pat.items) {
                if (!items[name]) {
                    return false;
                }
                if (!typeMatchesPattern(cpat, items[name].value, ctx)) {
                    return false;
                }
            }
            return true;
        }
        case 'PBlank':
            return true;
    }
};

export const typeForPattern = (pat: Pattern, ctx?: TCtx): t.Type => {
    switch (pat.type) {
        case 'PName':
            return ctx ? ctx.newTypeVar() : { type: 'TBlank', loc: pat.loc };
        case 'PRecord':
            return {
                type: 'TRecord',
                items: pat.items.map(([name, pat]) => ({
                    type: 'TRecordKeyValue',
                    key: name,
                    value: typeForPattern(pat, ctx),
                    loc: pat.loc,
                    default_: null,
                })),
                loc: pat.loc,
                open: true,
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
) => {
    switch (pat.type) {
        case 'PBlank':
            return;
        case 'PName':
            locals.push({ sym: pat.sym, type });
            return;
        case 'PRecord':
            if (type.type !== 'TRecord') {
                return;
            }
            const eitems = allRecordItems(type, ctx);
            if (eitems) {
                // for (const [name, item] of eitems) {
                //     locals.push({ sym: ctx.sym(name), type: item });
                // }
                pat.items.forEach(([name, item]) => {
                    if (eitems[name]) {
                        getLocals(item, eitems[name].value, locals, ctx);
                    }
                });
            }
            return;
    }
};

export const ToTast = {
    PBlank(pat: p.PBlank, ctx: TCtx): t.Pattern {
        return { type: 'PBlank', loc: pat.loc };
    },
    PName({ type, name, hash, loc }: p.PName, ctx: TCtx): PName {
        const sym = hash ? { name, id: +hash.slice(2, -1) } : ctx.sym(name);
        // locals.push({ sym, type: expected ?? ctx.newTypeVar() });
        return {
            type: 'PName',
            sym,
            loc,
        };
    },
    PTuple({ type, items, loc }: p.PTuple, ctx: TCtx): PRecord {
        return {
            type: 'PRecord',
            items:
                items?.items.map((item, i) => [
                    i.toString(),
                    ctx.ToTast.Pattern(item, ctx),
                ]) ?? [],
            loc,
        };
    },
    PRecord({ type, fields, loc }: p.PRecord, ctx: TCtx): PRecord {
        return {
            type: 'PRecord',
            items:
                fields?.items.map((item) => [
                    item.name,
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
                ]) ?? [],
            loc,
        };
    },
};

export const ToAst = {
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
        if (items.every((item, i) => item[0] === i.toString())) {
            return {
                type: 'PTuple',
                items: {
                    type: 'PTupleItems',
                    items: items.map((item) => ctx.ToAst.Pattern(item[1], ctx)),
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
                    const pat = ctx.ToAst.Pattern(item[1], ctx);
                    return {
                        type: 'PRecordField',
                        name: item[0],
                        pat:
                            pat.type === 'PName' && pat.name === item[0]
                                ? {
                                      type: 'PHash',
                                      hash: pat.hash ?? '',
                                      loc: pat.loc,
                                  }
                                : pat,
                        loc: item[1].loc,
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
import path from 'path';
import { allRecordItems } from './records';
export const ToJS = {
    Pattern(p: Pattern, ctx: JCtx): b.Pattern | b.Identifier {
        switch (p.type) {
            case 'PBlank':
                return b.identifier('_');
            case 'PName':
                return b.identifier(p.sym.name);
            case 'PRecord':
                if (p.items.every((item, i) => item[0] === i.toString())) {
                    return b.arrayPattern(
                        p.items.map((item) => ctx.ToJS.Pattern(item[1], ctx)),
                    );
                } else {
                    return b.objectPattern(
                        p.items.map((item) =>
                            b.objectProperty(
                                b.identifier(item[0]),
                                ctx.ToJS.Pattern(item[1], ctx),
                            ),
                        ),
                    );
                }
        }
    },
    // Pattern({}: ILambda, ctx: JCtx): b.Expression {
    //     return b.arrowFunctionExpression(
    //         args?.map((arg) => ctx.ToJS.Pattern(arg.pat, ctx)) ?? [],
    //         ctx.ToJS.IExpression(body, ctx),
    //     )
    // }
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
