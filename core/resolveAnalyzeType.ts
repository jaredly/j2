import { extract, idToString, toId } from './ids';
import { transformType } from './transform-tast';
import { Type } from './typed-ast';
import { applyType } from './typing/getType';
import { FullContext, opaque } from './ctx';
import { expandTask } from './typing/tasks';
import { ConstraintMap } from './typing/typeMatches';

// ugh ok so because
// i've tied application to TRef, it makes things
// less flexible. Can't do Some<X><Y> even though you can
// do let Some = <X><Y>int;
// OK BACKUP.

export const resolveAnalyzeType = (
    type: Type,
    ctx: FullContext,
    path: string[] = [],
    constraints?: ConstraintMap,
): Type | null => {
    if (type.type === 'TVbl') {
        // return ctx.currentConstraints(type.id);
        return null;
    }
    if (type.type === 'TDecorated') {
        return resolveAnalyzeType(type.inner, ctx, path, constraints);
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
                    constraints,
                );
            }
        }
        // if (type.ref.type === 'Local') {
        //     const bound = ctx.getBound(type.ref.sym);
        //     return bound;
        // }
        if (type.ref.type === 'Recur') {
            const k = ':recur:' + type.ref.idx;
            if (path.includes(k)) {
                return null;
            }
            const id = ctx.resolveTypeRecur(type.ref.idx);
            if (id) {
                return resolveAnalyzeType(
                    id,
                    ctx,
                    path.concat([k]),
                    constraints,
                );
            }
        }
    }
    if (type.type === 'TApply') {
        // if (ctx.isBuiltinType(type.target, 'Task')) {
        //     return expandTask(type.loc, type.args, ctx);
        // }

        const target = resolveAnalyzeType(type.target, ctx, path, constraints);
        if (!target || target.type !== 'TVars') {
            return null;
        }
        const applied = applyType(type.args, target, ctx, constraints, path);
        return applied
            ? resolveAnalyzeType(applied, ctx, path, constraints)
            : null;
    }
    return type;
};
