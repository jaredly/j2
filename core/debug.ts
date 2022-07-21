import { FullContext } from './ctx';
import * as pp from './printer/pp';
import { newPPCtx, pegPrinter } from './printer/to-pp';
import { Toplevel } from './typed-ast';
import { printCtx } from './typing/to-ast';
import { Ctx } from './typing/to-tast';

export const printTopLevel = (tctx: FullContext, checked: Toplevel) => {
    const actx = printCtx(tctx);
    const ctx = newPPCtx(false);
    return pp.printToString(
        ctx.ToPP.Toplevel(actx.ToAst.Toplevel(checked, actx), ctx),
        100,
    );
};
