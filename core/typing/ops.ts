import { noloc } from '../consts';
import { idsEqual } from '../ids';
import { Number, String, TOps, TRef, Type } from '../typed-ast';
import { Ctx } from './typeMatches';

export const stringAddsMatch = (
    candidate: (string | true)[],
    expected: (string | true)[],
): boolean => {
    // TODO: Be clever about this
    // so that 'he' + string matches 'h' + string
    return (
        candidate.length === expected.length &&
        candidate.every((c, i) => c === expected[i])
    );
};

export const justStringAdds = (t: TOps, ctx: Ctx): (string | true)[] | null => {
    const adds = justAdds(t);
    if (!adds) {
        return null;
    }
    const results: (string | true)[] = [];
    for (let item of adds) {
        if (item.type === 'String') {
            results.push(item.text);
        } else if (ctx.isBuiltinType(item, 'string')) {
            results.push(true);
        } else {
            return null;
        }
    }
    return results;
};

export const justAdds = (t: TOps): Type[] | null => {
    const results = [t.left];
    for (let { top, right } of t.right) {
        if (top === '+') {
            results.push(right);
        } else {
            return null;
        }
    }
    return results;
};
type EOps = {
    num: number;
    mm: { upperLimit: boolean; lowerLimit: boolean };
    kind: Number['kind'];
};

export const unifyOps = (one: EOps, two: EOps, ctx: Ctx): Type | null => {
    if (one.kind !== two.kind) {
        return null;
    }
    const ref = ctx.getBuiltinRef(one.kind.toLowerCase());
    if (!ref) {
        return null;
    }

    // TODO: unify better
    return { type: 'TRef', ref, loc: noloc };
};

export const numOps = (
    expected: TOps | Number | TRef,
    // kind: Number['kind'],
    ctx: Ctx,
): EOps | false => {
    if (expected.type === 'Number') {
        return {
            num: expected.value,
            mm: { upperLimit: true, lowerLimit: true },
            kind: expected.kind,
        };
    }
    let int = ctx.getBuiltinRef('int')!.id;
    let uint = ctx.getBuiltinRef('uint')!.id;
    let float = ctx.getBuiltinRef('float')!.id;
    if (expected.type === 'TRef') {
        if (expected.ref.type === 'Global') {
            let kind: Number['kind'];
            if (idsEqual(expected.ref.id, int)) {
                kind = 'Int';
            } else if (idsEqual(expected.ref.id, uint)) {
                kind = 'UInt';
            } else if (idsEqual(expected.ref.id, float)) {
                kind = 'Float';
            } else {
                return false;
            }

            return {
                num: 0,
                mm: { upperLimit: false, lowerLimit: false },
                kind,
            };
        }
        return false;
    }
    let num = 0;
    const mm = { upperLimit: true, lowerLimit: true };
    // let ismax = false;
    const elements = [
        {
            op: '+',
            right: ctx.resolveRefsAndApplies(expected.left) ?? expected.left,
        },
    ].concat(
        expected.right.map(({ top, right }) => ({
            op: top,
            right: ctx.resolveRefsAndApplies(right) ?? right,
        })),
    );
    let kind: Number['kind'] | null = null;

    for (let i = 0; i < elements.length; i++) {
        const { op, right: el } = elements[i];
        if (el.type === 'Number') {
            if (kind != null && el.kind !== kind) {
                return false;
            }
            kind = el.kind;
            if (op === '+') {
                num += el.value;
            } else {
                num -= el.value;
            }
            continue;
        }
        if (el.type === 'TRef' && el.ref.type === 'Global') {
            if (idsEqual(el.ref.id, int)) {
                kind = 'Int';
            } else if (idsEqual(el.ref.id, uint)) {
                kind = 'UInt';
            } else if (idsEqual(el.ref.id, float)) {
                kind = 'Float';
            } else {
                return false;
            }
            mm[op === '+' ? 'upperLimit' : 'lowerLimit'] = false;
            continue;
        }
        if (el.type === 'TOps') {
            const inner = numOps(el, ctx);
            if (!inner || (kind != null && inner.kind !== kind)) {
                return false;
            }
            kind = inner.kind;
            if (op === '+') {
                num += inner.num;
                if (!inner.mm.upperLimit) {
                    mm.upperLimit = false;
                }
                if (!inner.mm.lowerLimit) {
                    mm.lowerLimit = false;
                }
            } else {
                num -= inner.num;
                if (!inner.mm.upperLimit) {
                    mm.lowerLimit = false;
                }
                if (!inner.mm.lowerLimit) {
                    mm.upperLimit = false;
                }
            }
            continue;
        }
        return false;
    }
    return { num, mm, kind: kind! };
};

export const eopsMatch = (candidate: EOps, expected: EOps): boolean => {
    if (candidate.kind !== expected.kind) {
        return false;
    }
    if (expected.mm.upperLimit && candidate.num > expected.num) {
        return false;
    }
    if (expected.mm.lowerLimit && candidate.num < expected.num) {
        return false;
    }
    // if (candidate.mm.upperLimit && )
    if (!candidate.mm.upperLimit && expected.mm.upperLimit) {
        return false;
    }
    if (!candidate.mm.lowerLimit && expected.mm.lowerLimit) {
        return false;
    }
    // +num
    return true;
};
const opKind = (
    t: Type,
    ctx: Ctx,
): 'String' | 'Int' | 'Float' | 'UInt' | null => {
    switch (t.type) {
        case 'Number':
            return t.kind;
        case 'String':
            return 'String';
        case 'TRef':
            if (ctx.isBuiltinType(t, 'string')) {
                return 'String';
            }
            if (ctx.isBuiltinType(t, 'int')) {
                return 'Int';
            }
            if (ctx.isBuiltinType(t, 'float')) {
                return 'Float';
            }
            if (ctx.isBuiltinType(t, 'uint')) {
                return 'UInt';
            }
    }
    return null;
};
type vkind = 'String' | 'Int' | 'Float' | 'UInt';
export const collapseOps = (t: TOps, ctx: Ctx): Type => {
    let kinds: vkind[] = [];
    let elements = [{ plus: true, val: t.left }].concat(
        t.right.map(({ top, right }) => ({
            plus: top === '+',
            val: right,
        })),
    );
    for (let el of elements) {
        let k = opKind(el.val, ctx);
        if (!k) {
            return t;
        }
        if (!kinds.includes(k)) {
            kinds.push(k);
        }
    }

    if (!kinds.length) {
        return t;
    }

    if (kinds.includes('String')) {
        if (kinds.length !== 1) {
            return t;
        }
        // Can't do string subtraction
        if (elements.some((op) => !op.plus)) {
            return t;
        }
        let condensed: typeof elements = [];
        while (elements.length) {
            const next = elements.shift()!;
            let lid = condensed.length - 1;
            if (next.val.type !== 'String') {
                if (!condensed.length || condensed[lid].val.type === 'String') {
                    condensed.push(next);
                }
                // Otherwise, the last one is already a full 'string' ref
                continue;
            }
            if (!condensed.length || condensed[lid].val.type !== 'String') {
                condensed.push(next);
            } else {
                const last = condensed[lid].val as String;
                condensed[lid].val = {
                    ...last,
                    text: last.text + next.val.text,
                };
            }
        }
        if (!condensed[0].plus) {
            console.warn('WAHT first is not plus');
            return t;
        }
        if (condensed.length === 1) {
            return condensed[0].val;
        }
        return {
            ...t,
            left: condensed[0].val,
            right: condensed
                .slice(1)
                .map((el) => ({ top: el.plus ? '+' : '-', right: el.val })),
        };
    }

    if (kinds.length !== 1) {
        // console.log('multiples, not dealing with right now');
        return t;
    }

    let condensed: typeof elements = [];
    while (elements.length) {
        const next = elements.shift()!;
        let lid = condensed.length - 1;
        if (next.val.type === 'TRef') {
            condensed.push(next);
        } else if (!condensed.length || condensed[lid].val.type === 'TRef') {
            condensed.push(next);
        } else {
            const last = condensed[lid].val as Number;
            const num = next.val as Number;
            if (last.kind !== num.kind) {
                condensed.push(next);
            } else {
                condensed[lid].val = {
                    ...last,
                    value: last.value + num.value * (next.plus ? 1 : -1),
                };
            }
        }
    }
    if (!condensed[0].plus) {
        console.warn('WAHT first is not plus');
        return t;
    }
    if (condensed.length === 1) {
        return condensed[0].val;
    }
    return {
        ...t,
        left: condensed[0].val,
        right: condensed
            .slice(1)
            .map((el) => ({ top: el.plus ? '+' : '-', right: el.val })),
    };
};

export const stringOps = (
    elements: Type[],
    text: string,
    pos: number,
    exact: boolean,
    ctx: Ctx,
) => {
    for (let ex of elements) {
        if (ex.type === 'String') {
            const idx = text.indexOf(ex.text, pos);
            if (idx === -1 || (exact && idx !== 0)) {
                return false;
            }
            pos = idx + ex.text.length;
        } else if (ctx.isBuiltinType(ex, 'string')) {
            exact = false;
        } else {
            return false;
        }
    }
    if (exact && pos !== text.length - 1) {
        return false; // extra trailing
    }
    return true;
};

// export const isBuiltinType = (t: Type, name: string, ctx: FullContext) =>
//     t.type === 'TRef' &&
//     t.ref.type === 'Global' &&
//     refsEqual(t.ref, ctx.types.names[name]);

// export const reduceConstant = (t: Type): Type => {
//     if (t.type === 'TAdd') {
//         if (t.elements[0].type === 'String') {
//             let v = '';
//             for (let el of t.elements) {
//                 if (el.type !== 'String') {
//                     return t;
//                 }
//                 v += el.text;
//             }
//             return { ...t, type: 'String', text: v };
//         }
//         if (t.elements[0].type === 'Number') {
//             let v = 0;
//             let k = t.elements[0].kind;
//             for (let el of t.elements) {
//                 if (el.type !== 'Number' || el.kind !== k) {
//                     return t;
//                 }
//                 v += el.value;
//             }
//             return { ...t, type: 'Number', kind: k, value: v };
//         }
//     }
//     if (t.type === 'TSub') {
//         if (t.elements[0].type === 'Number') {
//             let v = t.elements[0].value;
//             let k = t.elements[0].kind;
//             for (let i = 1; i < t.elements.length; i++) {
//                 const el = t.elements[i];
//                 if (el.type !== 'Number' || el.kind !== k) {
//                     return t;
//                 }
//                 v -= el.value;
//             }
//             return { ...t, type: 'Number', kind: k, value: v };
//         }
//     }
//     return t;
// };

// export const resolveRefs = (
//     t: Type,
//     ctx: FullContext,
// ): Type => {
//     while (t.type === 'TRef' && t.ref.type === 'Global') {
//         const resolved = ctx.typeForId(t.ref.id)
//         if (resolved)
//     }
//     return t
// }
