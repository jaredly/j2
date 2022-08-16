import { EnumCase, refHash, TApply, TEnum, TRef, Type } from '../typed-ast';
import { expandTask } from './tasks';
import { Ctx, getRef } from './typeMatches';

// ok so recursion checking ... right
// like, if we pass through the same 'recur' thing multiple times...

export const expandEnumCases = (
    type: TEnum,
    ctx: Ctx,
    path: string[] = [],
): null | { cases: EnumCase[]; bounded: Unexpandable[] } => {
    const cases: EnumCase[] = [];
    const bounded: Unexpandable[] = [];
    for (let kase of type.cases) {
        if (kase.type === 'EnumCase') {
            cases.push(kase);
        } else {
            let inner = path;
            const r = getRef(kase);
            if (r) {
                const k = refHash(r.ref);
                if (path.includes(k)) {
                    return null;
                }
                inner = path.concat([k]);
            }
            const res = ctx.resolveRefsAndApplies(kase, inner);
            if (res?.type === 'TRef' && res.ref.type === 'Local') {
                const bound = ctx.getBound(res.ref.sym);
                if (bound) {
                    bounded.push({ type: 'local', bound, local: res });
                } else {
                    return null;
                }
            } else if (res?.type === 'TEnum') {
                const expanded = expandEnumCases(res, ctx, inner);
                if (!expanded) {
                    return null;
                }
                cases.push(...expanded.cases);
                bounded.push(...expanded.bounded);
            } else {
                if (
                    kase.type === 'TApply' &&
                    ctx.isBuiltinType(kase.target, 'Task')
                ) {
                    const task = expandTask(kase.loc, kase.args, ctx);
                    if (task) {
                        task.cases.forEach((item) => {
                            if (item.type === 'EnumCase') {
                                cases.push(item);
                            } else {
                                // STOPSHIP: I think `bounded` needs to become `misc`?
                                // like ... things we're not going to expand just now?
                                // hmm maybe it'll only be `Task<xyz>` .. so maybe
                                // we also want a `Tasks`? or something.
                                // or maybeeee bounded needs a flag that's like "this
                                // one is wrapped in a task"? that might be it.
                                // bounded.push()
                                if (item.type === 'TApply') {
                                    bounded.push({
                                        type: 'task',
                                        inner: item as TApply,
                                    });
                                } else {
                                    throw new Error(
                                        `Got ${item.type}, expected a task`,
                                    );
                                }
                            }
                        });
                        continue;
                    }
                }
                return null;
            }
        }
    }
    return { cases, bounded };
};

export type Unexpandable = { type: 'task'; inner: TApply } | LocalUnexpandable;
export type LocalUnexpandable = { type: 'local'; local: TRef; bound: Type };
