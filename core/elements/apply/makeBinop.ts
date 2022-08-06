import * as p from '../../grammar/base.parser';
import { opLevel } from '../binops';
import { maybeParenedBinop } from './apply';

export const makeBinop = (
    op: p.Identifier,
    left: p.Expression,
    right: p.Expression,
    loc: p.Loc,
    showIds: boolean,
): p.Expression => {
    const opp: p.BinOpRight['op'] = {
        op: op.text,
        loc: op.loc,
        hash: showIds ? op.hash : null,
        type: 'binopWithHash',
    };
    let level = opLevel(op.text);
    if (left.type === 'BinOp') {
        const levels = left.rest.map((r) => opLevel(r.op.op));
        let maxLevel = Math.max(...levels);
        if (maxLevel >= level) {
            let rest = left.rest.slice();
            if (right.type === 'BinOp') {
                const levels = right.rest.map((r) => opLevel(r.op.op));
                const maxLevel = Math.max(...levels);
                if (maxLevel >= level) {
                    rest.push(
                        {
                            type: 'BinOpRight',
                            op: opp,
                            right: right.first,
                            loc: right.loc,
                        },
                        ...right.rest,
                    );
                } else {
                    rest.push({
                        type: 'BinOpRight',
                        op: opp,
                        right: maybeParenedBinop(right),
                        loc: right.loc,
                    });
                }
            } else {
                rest.push({
                    type: 'BinOpRight',
                    op: opp,
                    right: maybeParenedBinop(right),
                    loc: right.loc,
                });
            }
            return {
                ...left,
                rest,
                loc,
            };
        }
    }
    if (right.type === 'BinOp') {
        const levels = right.rest.map((r) => opLevel(r.op.op));
        const maxLevel = Math.max(...levels);
        if (maxLevel >= level) {
            return {
                type: 'BinOp',
                first: maybeParenedBinop(left),
                rest: [
                    {
                        type: 'BinOpRight',
                        right: right.first,
                        loc: {
                            ...right.first.loc,
                            start: op.loc.start,
                        },
                        op: {
                            op: op.text,
                            loc: op.loc,
                            hash: showIds ? op.hash : null,
                            type: 'binopWithHash',
                        },
                    },
                    ...right.rest,
                ],
                loc,
            };
        }
    }
    return {
        type: 'BinOp',
        first: maybeParenedBinop(left),
        rest: [
            {
                type: 'BinOpRight',
                right: maybeParenedBinop(right),
                loc: {
                    ...right.loc,
                    start: op.loc.start,
                },
                op: {
                    op: op.text,
                    loc: op.loc,
                    hash: showIds ? op.hash : null,
                    type: 'binopWithHash',
                },
            },
        ],
        loc,
    };
};
