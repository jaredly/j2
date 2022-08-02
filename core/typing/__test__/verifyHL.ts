import { HL } from '../../../devui/HL';
import { Verify } from '../analyze';

export const verifyHL = (v: Verify) => {
    const statuses: HL[] = [];
    v.errors.forEach((loc) => {
        statuses.push({
            loc: loc,
            type: 'Error',
            prefix: {
                text: '🙁',
                message: `Error?`,
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
