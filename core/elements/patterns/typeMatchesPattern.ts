import * as t from '../../typed-ast';
import {
    addNewConstraint,
    collapseConstraints,
    Ctx as ACtx,
} from '../../typing/analyze';
import { ConstraintMap } from '../../typing/typeMatches';
import { expandEnumCases } from '../../typing/expandEnumCases';
import { allRecordItems } from '../records/allRecordItems';
import { maybeExpandTask } from '../../typing/tasks';
import { eopsMatch, numOps } from '../../typing/ops';
import { arrayType } from '../../typing/getType';
import { Pattern } from '../pattern';
import { typeForPattern } from './typeForPattern';

/**
 * Checks to see if the type of an arg or let is appropriate.
 */

export const typeMatchesPattern = (
    pat: Pattern,
    type: t.Type,
    ctx: ACtx,
    constraints?: ConstraintMap,
): boolean => {
    if (type.type === 'TVbl') {
        if (constraints) {
            const pt = typeForPattern(pat, ctx, (loc) => ctx.newTypeVar(loc));
            const current = addNewConstraint(
                type.id,
                { inner: pt },
                constraints,
                ctx,
            );
            if (current) {
                constraints[type.id] = current;
                return true;
            }
        } else {
            type = collapseConstraints(ctx.currentConstraints(type.id), ctx);
        }
    }
    switch (pat.type) {
        case 'Number': {
            if (type.type === 'Number') {
                return type.kind === pat.kind && type.value === pat.value;
            }
            return ctx.isBuiltinType(type, pat.kind.toLowerCase());
        }
        case 'String': {
            if (type.type === 'String') {
                return type.text === pat.text;
            }
            return ctx.isBuiltinType(type, 'string');
        }
        case 'PDecorated': {
            return typeMatchesPattern(pat.inner, type, ctx, constraints);
        }
        case 'PEnum': {
            type = maybeExpandTask(type, ctx) ?? type;
            if (type.type !== 'TEnum') {
                return false;
            }
            const cases = expandEnumCases(type, ctx);
            if (!cases) {
                return true;
            }
            for (let kase of cases.cases) {
                if (kase.tag === pat.tag) {
                    if (!pat.payload) {
                        return true;
                    }
                    return (
                        kase.payload != null &&
                        typeMatchesPattern(
                            pat.payload,
                            kase.payload,
                            ctx,
                            constraints,
                        )
                    );
                }
            }
            return false;
        }
        case 'PArray': {
            const t = arrayType(type, ctx);
            if (!t) {
                return false;
            }

            // hmmmmm : how do I make sure this ... has the proper length, in the presense of spreads?
            // Basically, we need to keep track of the /minimum/ array length, and the /maximum/ for a given parray.
            // we could claim that spreads always have to be variable ..
            // seems fine to me?
            let hasSpreads = false;
            let count = 0;

            // let el: t.Type = {type: 'TBlank', loc: pat.loc};
            // let size : t.Type= {type: 'Number', value: 0, kind: 'UInt', loc: pat.loc};
            for (let item of pat.items) {
                if (item.type === 'PSpread') {
                    let it = item.inner;
                    while (it.type === 'PDecorated') {
                        it = it.inner;
                    }
                    if (it.type !== 'PBlank' && it.type !== 'PName') {
                        return false;
                    }
                    hasSpreads = true;
                } else {
                    const inner = typeMatchesPattern(item, t[0], ctx);
                    if (!inner) {
                        return false;
                    }
                    count += 1;
                }
            }
            return true;
            // if (
            //     t[1].type !== 'TRef' &&
            //     t[1].type !== 'Number' &&
            //     t[1].type !== 'TOps'
            // ) {
            //     return false;
            // }
            // const ops = numOps(t[1], ctx);
            // return (
            //     ops &&
            //     eopsMatch(ops, {
            //         kind: 'UInt',
            //         num: count,
            //         mm: { lowerLimit: true, upperLimit: !hasSpreads },
            //     })
            // );
        }
        case 'PRecord': {
            if (type.type !== 'TRecord') {
                return false;
            }
            const items = allRecordItems(type, ctx);
            if (!items) {
                return false;
            }
            for (let { name, pat: cpat } of pat.items) {
                if (!items[name]) {
                    return false;
                }
                if (
                    !typeMatchesPattern(
                        cpat,
                        items[name].value,
                        ctx,
                        constraints,
                    )
                ) {
                    return false;
                }
            }
            return true;
        }
        case 'PName':
        case 'PBlank':
            return true;
    }
};
