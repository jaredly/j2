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
Pattern = PName / PTuple
PName = name:$IdText hash:$JustSym?
PTuple = "(" _  items:PTupleItems? _ ")"
PTupleItems = first:Pattern rest:(_ "," _ Pattern)*
`;

export type PName = {
    type: 'PName';
    sym: t.Sym;
    loc: t.Loc;
};

export type PTuple = {
    type: 'PTuple';
    items: Pattern[];
    loc: t.Loc;
};

export type Pattern = PName | PTuple;

export type IPattern = PName;

export const ToTast = {
    PName({ type, name, hash, loc }: p.PName, ctx: TCtx): PName {
        return {
            type: 'PName',
            sym: hash ? { name, id: +hash.slice(2, -1) } : ctx.sym(name),
            loc,
        };
    },
    PTuple({ type, items, loc }: p.PTuple, ctx: TCtx): PTuple {
        return {
            type: 'PTuple',
            items:
                items?.items.map((item) => ctx.ToTast.Pattern(item, ctx)) ?? [],
            loc,
        };
    },
};

export const ToAst = {
    PName({ type, sym, loc }: PName, ctx: TACtx): p.PName {
        return {
            type: 'PName',
            name: sym.name,
            hash: `#[${sym.id}]`,
            loc,
        };
    },
    PTuple({ type, items, loc }: PTuple, ctx: TACtx): p.PTuple {
        return {
            type: 'PTuple',
            items: {
                type: 'PTupleItems',
                items: items.map((item) => ctx.ToAst.Pattern(item, ctx)),
                loc,
            },
            loc,
        };
    },
};

export const ToPP = {
    PName({ type, name, hash, loc }: p.PName, ctx: PCtx): pp.PP {
        return pp.text(name + (hash ? hash : ''), loc);
    },
    PTuple({ type, items, loc }: p.PTuple, ctx: PCtx): pp.PP {
        return pp.args(
            items?.items.map((item) => ctx.ToPP.Pattern(item, ctx)) ?? [],
            loc,
        );
    },
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const ToIR = {
    PName(p: PName, ctx: ICtx): t.IPattern {
        return p;
    },
    PTuple(p: PTuple, ctx: ICtx): t.IPattern {
        return { type: 'PName', loc: p.loc, sym: { id: 0, name: 'bad' } };
    },
};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
