// Printing I hope
import { injectComments } from '../elements/comments';
import * as p from '../grammar/base.parser';
import * as pp from './pp';
import { makeToPP, ToPP } from './to-pp.gen';
export { makeToPP, type ToPP } from './to-pp.gen';

export type Ctx = {
    // hideIds: boolean;
    ToPP: ToPP;
};

export const newPPCtx = (hideIds?: boolean): Ctx => ({
    // hideIds,
    ToPP: makeToPP(),
});

export const pegPrinter = (
    ast: p.File,
    // past: peggy.ast.Grammar,
    ctx: Ctx,
): pp.PP => {
    return injectComments(ctx.ToPP.File(ast, ctx), ast.comments.slice());
};
