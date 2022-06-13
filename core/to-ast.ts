import { refHash } from '.';
import { FullContext } from './ctx';
import * as p from './grammar/base.parser';
import * as t from './typed-ast';

export type Ctx = {
    printRef: (ref: t.RefKind, loc: p.Loc) => p.Identifier;
};

export const printCtx = (ctx: FullContext): Ctx => {
    const reverse: { [key: string]: string } = {};
    Object.keys(ctx.values.names).forEach((name) => {
        ctx.values.names[name].forEach((ref) => {
            reverse[refHash(ref)] = name;
        });
    });
    return {
        printRef(ref, loc) {
            const hash = refHash(ref);
            if (reverse[hash]) {
                return { type: 'Identifier', text: reverse[hash], hash, loc };
            }
            return { type: 'Identifier', text: 'unnamed', hash, loc };
        },
    };
};

export const ToAst = {
    File({ type, toplevels, loc, comments }: t.File, ctx: Ctx): p.File {
        // TOOD: Go through and find all hashes, right?
        // maybe when printing unresolved things, put `#[:unresolved:]` or something?
        return {
            type,
            toplevels: toplevels.map((t) => ToAst[t.type](t, ctx)),
            loc,
            comments,
        };
    },
    ToplevelExpression({ type, expr, loc }: t.Toplevel, ctx: Ctx): p.Toplevel {
        return ToAst[expr.type](expr as any, ctx);
    },
    Apply({ type, target, args, loc }: t.Apply, ctx: Ctx): p.Apply {
        const inner = ToAst[target.type](target as any, ctx);
        const parens: p.Parens = {
            loc,
            type: 'Parens',
            args: {
                type: 'CommaExpr',
                items: args.map((a) => ToAst[a.type](a as any, ctx)),
                loc,
            },
        };
        if (inner.type === 'Apply') {
            return { ...inner, suffixes: inner.suffixes.concat([parens]) };
        }
        return { type, target: inner, suffixes: [parens], loc };
    },
    Int({ type, value, loc }: t.Int, ctx: Ctx): p.Int {
        return {
            type,
            contents: '' + value,
            loc,
        };
    },
    Ref({ type, kind, loc }: t.Ref, ctx: Ctx): p.Identifier {
        if (kind.type === 'Unresolved') {
            return {
                type: 'Identifier',
                text: kind.text,
                hash: '#[:unresolved:]',
                loc,
            };
        } else {
            return ctx.printRef(kind, loc);
        }
    },
};
