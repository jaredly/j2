import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typesEqual';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx, filterUnresolved } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';

export const grammar = `

// Type = TRef / Number / String
// TRef = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?
Type = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?

`;

export const ToTast = {
    // Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
    // },
    Type(type: p.Type, ctx: TCtx): t.Type {
        const hash = filterUnresolved(type.hash?.slice(2, -1));
        const resolved = ctx.resolveType(type.text, hash);
        return {
            type: 'TRef',
            ref: resolved ?? {
                type: 'Unresolved',
                text: type.text,
                hash,
            },
            loc: type.loc,
        };
    },
};

export const ToAst = {
    TRef({ type, ref, loc }: t.TRef, ctx: TACtx): p.Type {
        const { text, hash } =
            ref.type === 'Unresolved' ? ref : ctx.printRef(ref, loc, 'type');
        return { type: 'Type', text, hash, loc };
    },
};

export const ToPP = {
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
    Type(type: p.Type, ctx: PCtx): pp.PP {
        if (ctx.hideIds) {
            return pp.atom(type.text, type.loc);
        }
        return pp.atom(type.text + (type.hash ?? ''), type.loc);
    },
};

export const analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
