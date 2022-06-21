// Printing I hope
import * as p from '../grammar/base.parser';
import * as peggy from 'peggy';
import * as pp from './pp';
import { noloc } from '../ctx';
import { ToPP as ConstantsToPP } from '../elements/constants';
import { ToPP as DecoratorsToPP } from '../elements/decorators';
import { ToPP as ApplyToPP } from '../elements/apply';
import { injectComments } from '../elements/comments';

export type Ctx = {
    hideIds: boolean;
    ToPP: ToPP;
};

export type ToPP = typeof GeneralToPP &
    typeof ConstantsToPP &
    typeof DecoratorsToPP &
    typeof ApplyToPP;

export const makeToPP = (): ToPP => ({
    ...GeneralToPP,
    ...ConstantsToPP,
    ...DecoratorsToPP,
    ...ApplyToPP,
});

export const newPPCtx = (hideIds: boolean): Ctx => ({
    hideIds,
    ToPP: makeToPP(),
});

export const GeneralToPP = {
    File: (file: p.File, ctx: Ctx): pp.PP => {
        return pp.items(
            file.toplevels.map((t) => ctx.ToPP[t.type](t as any, ctx)),
            file.loc,
            'always',
        );
    },
    Type(type: p.Type, ctx: Ctx): pp.PP {
        if (ctx.hideIds) {
            return pp.atom(type.text, type.loc);
        }
        return pp.atom(type.text + (type.hash ?? ''), type.loc);
    },
    ParenedExpression({ loc, expr }: p.ParenedExpression, ctx: Ctx): pp.PP {
        return pp.items(
            [
                pp.atom('(', loc),
                ctx.ToPP[expr.type](expr as any, ctx),
                pp.atom(')', loc),
            ],
            loc,
        );
    },
    Identifier(identifier: p.Identifier, ctx: Ctx): pp.PP {
        return pp.atom(
            ctx.hideIds
                ? identifier.text
                : identifier.text + (identifier.hash ?? ''),
            identifier.loc,
        );
    },
};

export const pegPrinter = (
    ast: p.File,
    // past: peggy.ast.Grammar,
    ctx: Ctx,
): pp.PP => {
    return injectComments(ctx.ToPP.File(ast, ctx), ast.comments.slice());
};
