import * as t from '../../typed-ast';
import { Ctx as TMCtx } from '../../typing/typeMatches';
import { collapseOps } from '../../typing/ops';
import { arrayType } from '../../typing/getType';
import { unifyTypes } from '../../typing/unifyTypes';
import { Pattern } from '../pattern';

export const typeForPattern = (
    pat: Pattern,
    ctx: TMCtx,
    newTypeVar?: (l: t.Loc) => t.TVbl,
): t.Type => {
    switch (pat.type) {
        case 'Number':
        case 'String':
            return pat;
        case 'PEnum':
            return {
                type: 'TEnum',
                open: false,
                loc: pat.loc,
                cases: [
                    {
                        type: 'EnumCase',
                        tag: pat.tag,
                        loc: pat.loc,
                        payload: pat.payload
                            ? typeForPattern(pat.payload, ctx, newTypeVar)
                            : undefined,
                        decorators: [],
                    },
                ],
            };
        case 'PArray': {
            let el: t.Type = { type: 'TBlank', loc: pat.loc };
            let size: t.Type = {
                type: 'Number',
                value: 0,
                kind: 'UInt',
                loc: pat.loc,
            };
            pat.items.forEach((item) => {
                if (item.type === 'PSpread') {
                    const inner = typeForPattern(item.inner, ctx, newTypeVar);
                    const t = arrayType(inner, ctx);
                    if (!t) {
                        return;
                    }
                    const un = unifyTypes(el, t[0], ctx);
                    if (!un) {
                        return;
                    }
                    el = un;
                    size = collapseOps(
                        {
                            type: 'TOps',
                            loc: pat.loc,
                            left: el,
                            right: [{ top: '+', right: t[1] }],
                        },
                        ctx,
                    );
                } else {
                    const inner = typeForPattern(item, ctx, newTypeVar);
                    const un = unifyTypes(el, inner, ctx);
                    if (!un) {
                        return;
                    }
                    el = un;
                    size = collapseOps(
                        {
                            type: 'TOps',
                            loc: pat.loc,
                            left: el,
                            right: [
                                {
                                    top: '+',
                                    right: {
                                        type: 'Number',
                                        value: 1,
                                        kind: 'UInt',
                                        loc: pat.loc,
                                    },
                                },
                            ],
                        },
                        ctx,
                    );
                }
            });
            return {
                type: 'TApply',
                loc: pat.loc,
                args: [el, size],
                target: {
                    type: 'TRef',
                    ref: ctx.getBuiltinRef('Array')!,
                    loc: pat.loc,
                },
            };
        }
        case 'PName':
            return newTypeVar
                ? newTypeVar(pat.loc)
                : { type: 'TBlank', loc: pat.loc };
        case 'PDecorated':
            return typeForPattern(pat.inner, ctx, newTypeVar);
        case 'PRecord':
            return {
                type: 'TRecord',
                items: pat.items.map(({ name, pat }) => ({
                    type: 'TRecordKeyValue',
                    key: name,
                    value: typeForPattern(pat, ctx, newTypeVar),
                    loc: pat.loc,
                    default_: null,
                })),
                loc: pat.loc,
                open: pat.items.length > 0,
                spreads: [],
            };
        case 'PBlank':
            return { type: 'TBlank', loc: pat.loc };
    }
};
