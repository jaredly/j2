import { refsEqual } from '../refsEqual';
import { noloc } from '../consts';
import {
    enumTypeMatches,
    isValidEnumCase,
    isWrappedEnum,
} from '../elements/enums';
import { recordMatches } from '../elements/records';
import { TVar, tvarsMatches } from '../elements/type-vbls';
import { Id } from '../ids';
import {
    EnumCase,
    Expression,
    GlobalRef,
    refHash,
    RefKind,
    Sym,
    TApply,
    TEnum,
    TLambda,
    TOps,
    TRef,
    Type,
} from '../typed-ast';
import { hasFunctions } from './hasFunctions';
import {
    collapseOps,
    eopsMatch,
    justAdds,
    justStringAdds,
    numOps,
    stringAddsMatch,
    stringOps,
} from './ops';
import { expandTask, isTaskable, matchesTask, maybeExpandTask } from './tasks';
import { unifyTypes } from './unifyTypes';
import { TopTypeKind } from './to-tast';

export const trefsEqual = (a: TRef['ref'], b: TRef['ref']): boolean => {
    if (a.type === 'Unresolved' || b.type === 'Unresolved') {
        return false;
    }
    return refsEqual(a, b);
};

export type Ctx = {
    getType(expr: Expression): Type | null;
    isBuiltinType(t: Type, name: string): boolean;
    getBuiltinRef(name: string): GlobalRef | null;
    resolveRefsAndApplies(t: Type, path?: string[]): Type | null;
    getValueType(id: Id): Type | null;
    localType(sym: number): Type | null;
    getBound(sym: number): Type | null;
    log(...args: any[]): void;
    /** Only triggers the devtools debugger if the fixture is pinned. */
    debugger(): void;
    withBounds(bounds: {
        [sym: number]: { bound: Type | null; name: string };
    }): Ctx;
    withLocals: (locals: { sym: Sym; type: Type }[], better?: boolean) => Ctx;
    withLocalTypes: (locals: { sym: Sym; bound: Type | null }[]) => Ctx;
    typeForRecur: (idx: number) => Type | null;
    getTypeArgs(ref: RefKind): TVar[] | null;
    getTopKind(idx: number): TopTypeKind | null;
    resolveAnalyzeType(type: Type): Type | null;
};

export const unifyPayloads = (
    one: undefined | Type,
    two: undefined | Type,
    ctx: Ctx,
): false | null | Type => {
    if (!one || !two) {
        return one || two ? false : null;
    }
    return unifyTypes(one, two, ctx);
};

export const payloadsEqual = (
    one: undefined | Type,
    two: undefined | Type,
    ctx: Ctx,
    bidirectional: boolean,
) => {
    if ((one != null) != (two != null)) {
        return false;
    }
    if (!one || !two) {
        return true;
    }
    // Need bidirectional equality in this case
    return (
        typeMatches(one, two, ctx) &&
        (!bidirectional || typeMatches(two, one, ctx))
    );
};

export const typeMatches = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path?: string[],
): boolean => {
    // Ok I need like a "resolve refs" function
    const c2 = ctx.resolveRefsAndApplies(candidate, path);
    const e2 = ctx.resolveRefsAndApplies(expected, path);
    if (c2 != null) {
        candidate = c2;
    }
    if (e2 != null) {
        expected = e2;
    }

    while (expected.type === 'TDecorated') {
        expected = expected.inner;
    }
    while (candidate.type === 'TDecorated') {
        candidate = candidate.inner;
    }

    if (expected.type === 'TOps') {
        expected = collapseOps(expected, ctx);
    }
    if (candidate.type === 'TOps') {
        candidate = collapseOps(candidate, ctx);
    }

    if (ctx.isBuiltinType(expected, 'task')) {
        return isTaskable(candidate, ctx);
    }
    if (
        expected.type === 'TApply' &&
        candidate.type === 'TEnum' &&
        ctx.isBuiltinType(expected.target, 'Task')
    ) {
        expected = expandTask(expected.loc, expected.args, ctx) ?? expected;
    }
    if (
        candidate.type === 'TApply' &&
        expected.type === 'TEnum' &&
        ctx.isBuiltinType(candidate.target, 'Task')
    ) {
        candidate = expandTask(candidate.loc, candidate.args, ctx) ?? candidate;
    }

    if (ctx.isBuiltinType(expected, 'eq')) {
        return !hasFunctions(candidate, ctx);
    }

    if (candidate.type === 'TBlank' || expected.type === 'TBlank') {
        return false;
    }

    switch (candidate.type) {
        case 'TVbl':
            return false;
        case 'TRecord':
            return recordMatches(candidate, expected, ctx);
        case 'TEnum':
            return enumTypeMatches(candidate, expected, ctx, path);
        case 'TDecorated':
            return typeMatches(candidate.inner, expected, ctx);
        case 'TVars': {
            return tvarsMatches(candidate, expected, ctx);
        }
        case 'TLambda':
            return (
                expected.type === 'TLambda' &&
                typeMatches(candidate.result, expected.result, ctx) &&
                candidate.args.length === expected.args.length &&
                candidate.args.every((arg, i) =>
                    typeMatches(
                        (expected as TLambda).args[i].typ,
                        arg.typ,
                        ctx,
                    ),
                )
            );
        case 'TOps': {
            const adds = justStringAdds(candidate, ctx);
            if (adds) {
                if (ctx.isBuiltinType(expected, 'string')) {
                    return true;
                }
                if (expected.type === 'TOps') {
                    const exadds = justStringAdds(expected, ctx);
                    return exadds ? stringAddsMatch(adds, exadds) : false;
                }
            }
            const ops = numOps(candidate, ctx);
            if (
                expected.type === 'TOps' ||
                expected.type === 'Number' ||
                expected.type === 'TRef'
            ) {
                const eops = numOps(expected, ctx);
                if (ops && eops) {
                    return eopsMatch(ops, eops);
                }
            }
            // Probably need to "condense"?
            return (
                expected.type === 'TOps' &&
                candidate.right.length === expected.right.length &&
                typeMatches(candidate.left, expected.left, ctx) &&
                candidate.right.every(
                    (arg, i) =>
                        arg.top === (expected as TOps).right[i].top &&
                        typeMatches(
                            arg.right,
                            (expected as TOps).right[i].right,
                            ctx,
                        ),
                )
            );
        }
        // A string literal type matches either that lateral type, or the full string type.
        // OR I guess a prefix or suffix 🤔
        case 'String':
            switch (expected.type) {
                case 'String':
                    return candidate.text === expected.text;
                case 'TOps': {
                    let { text } = candidate;
                    let pos = 0;
                    let exact = true;
                    const elements = justAdds(expected);
                    if (!elements) {
                        return false;
                    }
                    return stringOps(elements, text, pos, exact, ctx);
                }
                default:
                    return ctx.isBuiltinType(expected, 'string');
            }
        // Ooh if this is an alias, I need to resolve it?
        case 'TApply':
            return (
                expected.type === 'TApply' &&
                typeMatches(candidate.target, expected.target, ctx) &&
                candidate.args.length === expected.args.length &&
                candidate.args.every((arg, i) =>
                    typeMatches(arg, (expected as TApply).args[i], ctx),
                )
            );
        case 'TRef':
            if (
                expected.type === 'TRef' &&
                trefsEqual(candidate.ref, expected.ref)
            ) {
                return true;
            }
            if (
                expected.type === 'TEnum' &&
                isWrappedEnum(candidate, expected, ctx)
            ) {
                return true;
            }
            // console.log('tref', candidate);
            // If this is a local ref, and it has a bound, then we can use the bound.
            if (candidate.ref.type === 'Local') {
                //     // TOHHH.
                //     // If we've finished our 'transform' path,
                //     // now we need a mapping of syms to ... bounds
                //     // instaed of using the list of scopes.
                const ref = candidate.ref;
                const bound = ctx.getBound(candidate.ref.sym);
                if (bound && isValidEnumCase(bound, ctx)) {
                    if (expected.type === 'TEnum') {
                        const got = expandEnumCases(expected, ctx);
                        return (
                            got?.bounded.some(
                                (b) =>
                                    b.type === 'local' &&
                                    refsEqual(b.local.ref, ref),
                            ) ?? false
                        );
                    }
                }
                //     if (bound) {
                //         // console.log('got a bound', candidate, bound, expected);
                //         return typeMatches(bound, expected, ctx);
                //     }
            }
            return false;
        // case 'TApply':
        //     // So TApply should get "worked out" by this point, right?
        //     // idk seems like it should.
        //     return (
        //         expected.type === 'TApply' &&
        //         typeMatches(candidate.target, expected.target, ctx) &&
        //         candidate.args.length === expected.args.length &&
        //         candidate.args.every((arg, i) =>
        //             typeMatches(arg, (expected as TApply).args[i], ctx),
        //         )
        //     );
        // case 'TVars':
        //     // TODO: Come back to this
        //     throw new Error('Not sure about this one');
        // // return b.type === 'TVars' && typesEqual(a.inner, b.inner) && a.args.length === b.args.length && a.args.every((arg, i) => (
        // // 	arg.id === (b as TVars).args[i].id
        // // )
        // case 'TSub': {
        //     // TODO make this more flexible, maybe
        //     const { elements } = candidate;
        //     return (
        //         expected.type === 'TSub' &&
        //         expected.elements.length === elements.length &&
        //         expected.elements.every((el, i) =>
        //             typeMatches(elements[i], el, ctx),
        //         )
        //     );
        // }
        // case 'TAdd':
        //     // TODO make this more flexible
        //     // OH for example, if this can reduce down to a constant, do that.
        //     // That can be a preprocess run
        //     const { elements } = candidate;
        //     return (
        //         expected.type === 'TAdd' &&
        //         expected.elements.length === elements.length &&
        //         expected.elements.every((el, i) =>
        //             typeMatches(elements[i], el, ctx),
        //         )
        //     );
        // hmm if this is a number-kind of add ... it could get swallowed up into ... a full string
        // ... or things rather more complicated.
        case 'Number':
            const ops = numOps(candidate, ctx);
            if (
                expected.type === 'TOps' ||
                expected.type === 'Number' ||
                expected.type === 'TRef'
            ) {
                const eops = numOps(expected, ctx);
                if (ops && eops) {
                    return eopsMatch(ops, eops);
                }
            }

            return false;
        // if (expected.type === 'Number') {
        //     return (
        //         expected.kind === candidate.kind &&
        //         expected.value === candidate.value
        //     );
        // } else if (expected.type === 'TOps') {
        //     const res = numOps(expected, ctx);
        //     if (!res || res.kind !== candidate.kind) {
        //         return false;
        //     }
        //     const { mm, num } = res;

        //     console.log(candidate.value, mm, num);
        //     if (candidate.value <= num && !mm.lowerLimit) {
        //         return true;
        //     }
        //     if (candidate.value >= num && !mm.upperLimit) {
        //         return true;
        //     }
        //     return candidate.value === num;
        // } else {
        //     if (
        //         candidate.kind === 'Int' &&
        //         candidate.value >= 0 &&
        //         ctx.isBuiltinType(expected, 'uint')
        //     ) {
        //         return true;
        //     }
        //     return ctx.isBuiltinType(
        //         expected,
        //         candidate.kind.toLowerCase(),
        //     );
        // }
    }
};

export type Unexpandable = { type: 'task'; inner: TApply } | LocalUnexpandable;
export type LocalUnexpandable = { type: 'local'; local: TRef; bound: Type };

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
                // console.log('ok next');
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
    // console.log('resolved', cases, path);
    return { cases, bounded };
};

export const getRef = (t: Type): TRef | null => {
    switch (t.type) {
        case 'TRef':
            return t;
        case 'TApply':
            return getRef(t.target);
        case 'TDecorated':
            return getRef(t.inner);
    }
    return null;
};
