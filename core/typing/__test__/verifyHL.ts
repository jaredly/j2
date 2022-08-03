import { HL } from '../../../devui/HL';
import { refHash } from '../../typed-ast';
import { Verify } from '../analyze';

export const verifyHL = (v: Verify) => {
    const statuses: HL[] = [];
    v.errors.forEach((err) => {
        statuses.push({
            loc: err.loc,
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
