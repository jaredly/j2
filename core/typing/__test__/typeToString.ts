import { FullContext } from '../../ctx';
import { printToString } from '../../printer/pp';
import { newPPCtx } from '../../printer/to-pp';
import { printCtx } from '../to-ast';
import * as t from '../../typed-ast';

export const typeToString = (t: t.Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    return printToString(pctx.ToPP.Type(ast, pctx), 100);
};
