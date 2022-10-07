import { HL } from '../../../devui/HL';
import { Loc, refHash } from '../../typed-ast';
import { Verify } from '../analyze';

export const locWithin = (outer: Loc, inner: Loc) => {
    return (
        outer.start.offset <= inner.start.offset &&
        outer.end.offset >= inner.end.offset
    );
};

export const verifyHL = (v: Verify) => {
    const statuses: HL[] = [];
    const loc0: Loc = {
        idx: 0,
        start: { column: 0, line: 0, offset: 0 },
        end: { column: 50, line: 0, offset: 50 },
    };
    const matched: Verify['expected'] = [];
    Object.keys(v.cache.types).forEach((k) => {
        v.cache.types[+k].failures.forEach((failure) => {
            const status: HL = {
                loc: failure.loc,
                type: 'Error',
                message: `${failure.error}`,
            };
            statuses.push(status);
        });
    });
    v.errors.forEach((err) => {
        if (err.loc.end.offset === -1) {
            debugger;
            console.error(err);
        }
        // if (err.type === 'Dec') {
        //     if (
        //         v.expected.find((expected) =>
        //             err.name === expected.text &&
        //             locWithin(expected.loc, err.loc)
        //                 ? (matched.push(expected), true)
        //                 : false,
        //         )
        //     ) {
        //         return;
        //     }
        // }
        statuses.push({
            loc: err.loc.end.offset === -1 ? loc0 : err.loc,
            type: 'Error',
            prefix: {
                text: '🙁',
                message:
                    err.type === 'Blank'
                        ? 'Blank'
                        : err.type === 'TVbl'
                        ? 'Type variable, unresolved'
                        : refHash(err.dec.id.ref),
            },
        });
    });
    // v.expected.forEach((expected) => {
    //     if (!matched.includes(expected)) {
    //         statuses.push({
    //             loc: expected.loc,
    //             type: 'Error',
    //             prefix: {
    //                 text: '🙁',
    //                 message: 'Expected an error, but didnt find one',
    //             },
    //         });
    //     }
    // });
    v.untypedExpression.forEach((loc) => {
        statuses.push({
            loc: loc,
            type: 'Error',
            prefix: {
                text: '🖥',
                message: `Unable to type expression`,
            },
        });
    });
    return statuses;
};
