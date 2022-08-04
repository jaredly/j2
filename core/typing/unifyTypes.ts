import { unifyEnums } from '../elements/enums';
import { unifyRecords } from '../elements/records';
import { Type } from '../typed-ast';
import { addNewConstraint, collapseConstraints } from './analyze';
import { numOps, unifyOps } from './ops';
import { maybeExpandTask } from './tasks';
import { ConstraintMap, Ctx, typeMatches } from './typeMatches';

// For now, just take the greater of the two.
// To do this right, we need to allow enums to unify. [`A] [`B] -> [`A | `B]

export const unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    constraints?: ConstraintMap,
): false | Type => {
    const c2 = ctx.resolveRefsAndApplies(one)!;
    const e2 = ctx.resolveRefsAndApplies(two);
    if (c2 != null) {
        one = c2;
    }
    if (e2 != null) {
        two = e2;
    }

    while (two.type === 'TDecorated') {
        two = two.inner;
    }
    while (one.type === 'TDecorated') {
        one = one.inner;
    }

    if (one.type === 'TBlank') {
        return two;
    }
    if (two.type === 'TBlank') {
        return one;
    }

    if (one.type === 'TEnum') {
        two = maybeExpandTask(two, ctx) ?? two;
        return unifyEnums(one, two, ctx);
    }
    if (two.type === 'TEnum') {
        one = maybeExpandTask(one, ctx) ?? one;
        return unifyEnums(two, one, ctx);
    }
    if (one.type === 'TRecord') {
        return unifyRecords(one, two, ctx);
    }

    // What do we delve into?
    // Lambdas
    // Enums
    // Records
    if (typeMatches(one, two, ctx)) {
        return two;
    }
    if (typeMatches(two, one, ctx)) {
        return one;
    }

    // This ... isn't correct?
    if (one.type === 'TVbl') {
        if (constraints) {
            const current = addNewConstraint(
                one.id,
                { outer: two },
                constraints,
                ctx,
            );
            if (current) {
                constraints[one.id] = current;
                return two;
            }
        } else {
            const current = collapseConstraints(
                ctx.currentConstraints(one.id),
                ctx,
            );
            return unifyTypes(current, two, ctx);
        }
    }
    if (two.type === 'TVbl') {
        if (constraints) {
            const current = addNewConstraint(
                two.id,
                { outer: one },
                constraints,
                ctx,
            );
            if (current) {
                constraints[two.id] = current;
                return one;
            }
        } else {
            const current = collapseConstraints(
                ctx.currentConstraints(two.id),
                ctx,
            );
            return unifyTypes(one, current, ctx);
        }
    }

    if (
        one.type === 'TLambda' &&
        two.type === 'TLambda' &&
        one.args.length === two.args.length
    ) {
        const res = unifyTypes(one.result, two.result, ctx, constraints);
        if (!res) {
            return false;
        }
        const oargs = one.args;
        const targs = two.args;
        const args = one.args.map((arg, i) =>
            constrainTypes(arg.typ, targs[i].typ, ctx, constraints),
        );
        if (!args.every(Boolean)) {
            return false;
        }
        return {
            ...one,
            args: args.map((t, i) => ({
                label:
                    oargs[i].label === targs[i].label ? oargs[i].label : null,
                typ: t as Type,
                loc: oargs[i].loc,
            })),
            result: res,
        };
    }

    // So, there's a lot we could do here, with
    // unifying ops. But I'm going to bail for now.
    if (
        (one.type === 'TOps' || one.type === 'Number' || one.type === 'TRef') &&
        (two.type === 'TOps' || two.type === 'Number' || two.type === 'TRef')
    ) {
        const oops = numOps(one, ctx);
        const tops = numOps(two, ctx);
        const res = oops && tops ? unifyOps(oops, tops, ctx) : null;
        if (res) {
            return res;
        }
    }

    if (one.type === 'String' && two.type === 'String') {
        return {
            type: 'TRef',
            ref: ctx.getBuiltinRef('string')!,
            loc: one.loc,
        };
    }

    if (
        one.type === 'Number' &&
        two.type === 'Number' &&
        one.kind === two.kind
    ) {
        const ref = ctx.getBuiltinRef(one.kind.toLowerCase());
        if (ref) {
            return {
                type: 'TRef',
                ref,
                loc: one.loc,
            };
        }
    }

    return false;
};

export const constrainTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    constraints?: ConstraintMap,
): false | Type => {
    const c2 = ctx.resolveRefsAndApplies(one)!;
    const e2 = ctx.resolveRefsAndApplies(two);
    if (c2 != null) {
        one = c2;
    }
    if (e2 != null) {
        two = e2;
    }

    while (two.type === 'TDecorated') {
        two = two.inner;
    }
    while (one.type === 'TDecorated') {
        one = one.inner;
    }

    // So we want 'constrainEnums' instead
    // if (one.type === 'TEnum') {
    //     return unifyEnums(one, two, ctx);
    // }
    // if (one.type === 'TRecord') {
    //     return unifyRecords(one, two, ctx);
    // }

    // This ... isn't correct?
    if (one.type === 'TVbl') {
        if (constraints) {
            const current = addNewConstraint(
                one.id,
                { inner: two },
                constraints,
                ctx,
            );
            if (current) {
                constraints[one.id] = current;
                return two;
            }
        } else {
            const current = collapseConstraints(
                ctx.currentConstraints(one.id),
                ctx,
            );
            return unifyTypes(current, two, ctx);
        }
    }
    if (two.type === 'TVbl') {
        if (constraints) {
            const current = addNewConstraint(
                two.id,
                { inner: one },
                constraints,
                ctx,
            );
            if (current) {
                constraints[two.id] = current;
                return one;
            }
        } else {
            const current = collapseConstraints(
                ctx.currentConstraints(two.id),
                ctx,
            );
            return unifyTypes(one, current, ctx);
        }
    }

    if (one.type === 'TBlank') {
        return two;
    }
    if (two.type === 'TBlank') {
        return one;
    }

    // What do we delve into?
    // Lambdas
    // Enums
    // Records
    if (typeMatches(one, two, ctx)) {
        return one;
    }
    if (typeMatches(two, one, ctx)) {
        return two;
    }

    return false;
};
