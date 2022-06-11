// switch it up

import {
    Pattern,
    Expression,
    Type,
    Check,
    getTypeOf,
    checkTypes,
    checkPattern,
    FromAst,
    Context,
} from '..';

export const grammar = `
Switch = "switch" __ expr:Expression __ "{" _ cases:SwitchCases _ "}" 
SwitchCases = first:SwitchCase rest:(_ "," _ @SwitchCase)* ","? 
SwitchCase = pattern:Pattern __ "=>" __ body:Expression 
`;

export type P_Switch = {
    type: 'Switch';
    expr: P_Expression;
    cases: Array<P_SwitchCase>;
};

export type SwitchCase = {
    type: 'SwitchCase';
    pattern: Pattern;
    body: Expression;
};

export type Switch = {
    type: 'Switch';
    expr: Expression;
    cases: Array<SwitchCase>;
};

export const typeOf = (node: Switch, recurse: Check<Type>) =>
    recurse.Expression(node.cases[0].body);
export const checkConsistency = (
    node: Switch,
    recurse: Check<Array<Error>>,
) => {
    const expr = getTypeOf(node.expr);
    const case0 = getTypeOf(node.cases[0].body);
    return node.cases
        .map(({ pattern, body }) => [
            ...checkPattern(pattern, expr),
            ...checkTypes(getTypeOf(body), case0),
        ])
        .flat()
        .concat(
            checkExhaustiveness(
                expr,
                node.cases.map((kase) => kase.pattern),
            ),
        );
};

export const fromAst = ({ expr, cases }: P_Switch, ctx: Context): Switch => ({
    type: 'Switch',
    expr: FromAst.Expression(expr, ctx),
    cases: cases.map((kase) => {
        // so transform.Pattern needs to not only return
        // the processed pattern, but also the scope modifiers.
        // Should all of these return something extra?
        // hmm expressions can't modify scope.
        // Patterns definitely might.
        // but other things not.
        const [pat, subctx] = FromAst.Pattern(kase.pattern, ctx);

        return {
            type: 'SwitchCase',
            // ohhhh hm I have to modify the local scope now.
            pattern: pat,
            body: FromAst.Expression(kase.body, subctx),
        };
    }),
});
