import * as t from '../../typed-ast';
import * as p from '../../grammar/base.parser';
import { Ctx as TCtx } from '../../typing/to-tast';
import { matchesBound, TypeAbstraction } from './generics';

// export type Apply = {
//     type: 'Apply';
//     target: t.Expression;
//     args: Array<t.Expression>;
//     loc: t.Loc;
// };

export const ToTast = {
    TypeApplicationSuffix(
        suffix: p.TypeApplicationSuffix,
        target: t.Expression,
        ctx: TCtx,
    ): t.Expression {
        const args = suffix.vbls.items.map((vbl) => ctx.ToTast.Type(vbl, ctx));
        if (target.type === 'Ref' && target.kind.type === 'Unresolved') {
            const resolved = ctx.resolve(target.kind.text, null);
            for (let res of resolved) {
                const t = ctx.getType({
                    type: 'Ref',
                    kind: res,
                    loc: target.loc,
                });
                if (t && t.type === 'TVars') {
                    if (t.args.length === args.length) {
                        if (
                            t.args.every((arg, i) =>
                                matchesBound(args[i], arg.bound, ctx),
                            )
                        ) {
                            target = {
                                type: 'Ref',
                                kind: res,
                                loc: target.loc,
                            };
                            break;
                        }
                    }
                }
            }
        }
        return {
            type: 'TypeApplication',
            target,
            inferred: false,
            args: args,
            loc: { ...suffix.loc, start: target.loc.start },
        };
    },
    TypeAbstraction(
        { args, loc, inner }: p.TypeAbstraction,
        ctx: TCtx,
    ): TypeAbstraction {
        const targs = args.items.map((arg) => {
            const targ = ctx.ToTast.TBArg(arg, ctx);
            ctx = ctx.withLocalTypes([targ]);
            return targ;
        });
        return {
            type: 'TypeAbstraction',
            items: targs,
            body: ctx.ToTast.Expression(inner, ctx),
            loc,
        };
    },
};
