import * as p from '../../grammar/base.parser';
import * as pp from '../../printer/pp';
import { Ctx as PCtx } from '../../printer/to-pp';

export const ToPP = {
    Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
        return pp.items(
            [
                ctx.ToPP.Expression(apply.target, ctx),
                ...apply.suffixes.map((s) => ctx.ToPP.Suffix(s, ctx)),
            ],
            apply.loc,
            'never',
        );
    },
    ArrowSuffix(suffix: p.ArrowSuffix, ctx: PCtx): pp.PP {
        return pp.items(
            [
                pp.text('->', suffix.loc),
                ctx.ToPP.Identifier(suffix.name, ctx),
                suffix.types
                    ? ctx.ToPP.TypeApplicationSuffix(suffix.types, ctx)
                    : null,
                suffix.args ? ctx.ToPP.CallSuffix(suffix.args, ctx) : null,
            ],
            suffix.loc,
        );
    },
    CallSuffix(parens: p.CallSuffix, ctx: PCtx): pp.PP {
        return pp.args(
            (parens.args?.items ?? []).map((a) => ctx.ToPP.Expression(a, ctx)),
            parens.loc,
        );
    },
};
