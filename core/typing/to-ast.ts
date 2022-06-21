import { refHash } from '..';
import { FullContext } from '../ctx';
import { ToAst as ConstantsToAst } from '../elements/constants';
import { ToAst as DecoratorsToAst } from '../elements/decorators';
import { ToAst as ApplyToAst } from '../elements/apply';
import * as p from '../grammar/base.parser';
import * as t from '../typed-ast';

export const makeToAst = (): ToAst => ({
    ...ConstantsToAst,
    ...GeneralToAst,
    ...DecoratorsToAst,
    ...ApplyToAst,
});

export type ToAst = typeof ConstantsToAst &
    typeof GeneralToAst &
    typeof DecoratorsToAst &
    typeof ApplyToAst;

export type Ctx = {
    printRef: (
        ref: t.RefKind,
        loc: p.Loc,
        kind: 'value' | 'type' | 'decorator',
    ) => p.Identifier;
    ToAst: ToAst;
};

export const printCtx = (ctx: FullContext): Ctx => {
    const reverse: { [key: string]: string } = {};
    Object.keys(ctx.values.names).forEach((name) => {
        ctx.values.names[name].forEach((ref) => {
            reverse[refHash(ref)] = name;
        });
    });
    const reverseType: { [key: string]: string } = {};
    Object.keys(ctx.types.names).forEach((name) => {
        reverseType[refHash(ctx.types.names[name])] = name;
    });
    return {
        printRef(ref, loc, kind) {
            const hash = refHash(ref);
            const name = kind === 'value' ? reverse[hash] : reverseType[hash];
            return {
                type: 'Identifier',
                text: name ?? 'unnamed',
                hash: `#[${hash}]`,
                loc,
            };
        },
        ToAst: makeToAst(),
    };
};

export const GeneralToAst = {
    File({ type, toplevels, loc, comments }: t.File, ctx: Ctx): p.File {
        // TOOD: Go through and find all hashes, right?
        // maybe when printing unresolved things, put `#[:unresolved:]` or something?
        return {
            type,
            toplevels: toplevels.map((t) => ctx.ToAst[t.type](t, ctx)),
            loc,
            comments,
        };
    },
    ToplevelExpression({ type, expr, loc }: t.Toplevel, ctx: Ctx): p.Toplevel {
        return ctx.ToAst[expr.type](expr as any, ctx);
    },
    TRef({ type, ref, loc }: t.TRef, ctx: Ctx): p.Type {
        const { text, hash } =
            ref.type === 'Unresolved' ? ref : ctx.printRef(ref, loc, 'type');
        return { type: 'Type', text, hash, loc };
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
            return ctx.printRef(kind, loc, 'value');
        }
    },
};
