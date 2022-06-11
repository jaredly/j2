import * as peggy from 'peggy';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { processExpression } from './process-peg-expression';

export type RuleTriple = [peggy.ast.Rule, t.TSType, t.Expression | null];

export const processRules = (rules: peggy.ast.Rule[]) => {
    const alls: Array<RuleTriple> = [];
    rules.forEach((rule, i) => {
        // try {
        const [type, expr] = processExpression(
            rule.expression,
            {
                type: 'top',
                ruleName: rule.name,
            },
            i === 0,
        );
        alls.push([rule, type, expr]);
        // } catch (err) {
        //     console.log(`### ${rule.name} ###`);
        //     console.log(
        //         raw.slice(
        //             rule.expression.location.start.offset,
        //             rule.expression.location.end.offset,
        //         ),
        //     );
        //     console.error(`Failed to process ${rule.name}`);
        //     console.error(err instanceof Error ? err.message : err);
        //     console.log();
        // }
    });

    return alls;
};

export const assembleRules = (rules: RuleTriple[], raw: string) => {
    const typesFile: Array<string> = [];
    const grammarFile: Array<string> = [];

    const getBasic = (
        rule: peggy.ast.Expression | peggy.ast.Named,
    ): peggy.ast.Expression => {
        if (rule.type === 'action' || rule.type === 'named') {
            return getBasic(rule.expression);
        }
        return rule;
    };

    rules.map(([rule, type, expr]) => {
        // extract out an _inner version.
        if (
            type.type === 'TSUnionType' &&
            type.types[0].type === 'TSTypeLiteral'
        ) {
            typesFile.push(
                generate(
                    t.exportNamedDeclaration(
                        t.tsTypeAliasDeclaration(
                            t.identifier(rule.name + '_inner'),
                            null,
                            type.types[0],
                        ),
                    ),
                ).code,
                generate(
                    t.exportNamedDeclaration(
                        t.tsTypeAliasDeclaration(
                            t.identifier(rule.name),
                            null,
                            t.tsUnionType([
                                t.tsTypeReference(
                                    t.identifier(rule.name + '_inner'),
                                ),
                                ...type.types.slice(1),
                            ]),
                        ),
                    ),
                ).code,
            );
        } else {
            typesFile.push(
                generate(
                    t.exportNamedDeclaration(
                        t.tsTypeAliasDeclaration(
                            t.identifier(rule.name),
                            null,
                            type,
                        ),
                    ),
                ).code,
            );
        }

        const ruleSource = getBasic(rule.expression);
        grammarFile.push(
            `${rule.name} = ${raw.slice(
                ruleSource.location.start.offset,
                ruleSource.location.end.offset,
            )}` +
                (expr
                    ? generate(t.blockStatement([t.returnStatement(expr)])).code
                    : rule.name.endsWith('Comment')
                    ? '{ allComments.push([location(), text()]); }'
                    : ''),
        );
    });

    return { typesFile, grammarFile };
};
