import { extract, idToString, toId } from './ids';
import { transformType } from './transform-tast';
import { Type } from './typed-ast';
import { applyType } from './typing/getType';
import { FullContext, opaque } from './ctx';

// ugh ok so because
// i've tied application to TRef, it makes things
// less flexible. Can't do Some<X><Y> even though you can
// do let Some = <X><Y>int;
// OK BACKUP.

export const resolveAnalyzeType = (
    type: Type,
    ctx: FullContext,
    path: string[] = [],
): Type | null => {
    if (type.type === 'TDecorated') {
        return resolveAnalyzeType(type.inner, ctx, path);
    }
    if (type.type === 'TRef') {
        if (type.ref.type === 'Global') {
            const k = idToString(type.ref.id);
            if (path.includes(k)) {
                return null;
            }
            const { idx, hash } = extract(type.ref.id);
            if (!ctx[opaque].types.hashed[hash]) {
                return null;
            }
            const t = ctx[opaque].types.hashed[hash][idx];
            if (!t) {
                return null;
            }
            if (t.type === 'user') {
                return resolveAnalyzeType(
                    transformType<null>(
                        t.typ,
                        {
                            TRef(node, ctx) {
                                if (node.ref.type === 'Recur') {
                                    return {
                                        ...node,
                                        ref: {
                                            type: 'Global',
                                            id: toId(hash, node.ref.idx),
                                        },
                                    };
                                }
                                return null;
                            },
                        },
                        null,
                    ),
                    ctx,
                    path.concat(idToString(type.ref.id)),
                );
            }
        }
        if (type.ref.type === 'Local') {
            const bound = ctx.getBound(type.ref.sym);
            return bound;
        }
        if (type.ref.type === 'Recur') {
            const id = ctx.resolveRecur(type.ref.idx);
            if (id) {
                return resolveAnalyzeType(
                    { ...type, ref: { type: 'Global', id } },
                    ctx,
                    path,
                );
            }
            // ctx.getBound
        }
    }
    if (type.type === 'TApply') {
        const target = resolveAnalyzeType(type.target, ctx, path);
        if (!target || target.type !== 'TVars') {
            return null;
        }
        const applied = applyType(type.args, target, ctx);
        return applied ? resolveAnalyzeType(applied, ctx, path) : null;
    }
    return type;
};
