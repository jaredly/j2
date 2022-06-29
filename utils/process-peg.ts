import * as peggy from 'peggy';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { processExpression, ruleToType } from './process-peg-expression';

export type RuleTriple = [peggy.ast.Rule, t.TSType, t.Expression | null];

export const processRules = (rules: peggy.ast.Rule[]) => {
    const alls: Array<RuleTriple> = [];
    const ruleTags: Array<string> = [];
    rules.forEach((rule, i) => {
        // let um: string[] = [];
        // try {
        const [type, expr] = processExpression(
            rule.expression,
            {
                type: 'top',
                ruleName: rule.name,
            },
            ruleTags,
            i === 0,
        );
        alls.push([rule, type, expr]);
        // if (um.length) {
        //     ruleTags.push(rule.name);
        // }
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

    return { rules: alls, ruleTags };
};

export const assembleRules = (
    { rules, ruleTags }: { rules: RuleTriple[]; ruleTags: Array<string> },
    raw: string,
) => {
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

    const ruleTagNames: string[] = [];
    const emptyNames: string[] = [];

    rules.map(([rule, type, expr]) => {
        // extract out an _inner version, if the first of the union is a literal
        if (
            type.type === 'TSUnionType' &&
            type.types[0].type === 'TSTypeLiteral'
        ) {
            if (ruleTags.includes(rule.name)) {
                ruleTagNames.push(rule.name + '_inner');
            }
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
                            ruleToType(rule.name),
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
            const isEmpty =
                type.type === 'TSTypeLiteral' && type.members.length === 2;
            if (isEmpty) {
                typesFile.push(`// No data on ${rule.name}`);
                emptyNames.push(rule.name);
            } else {
                if (ruleTags.includes(rule.name)) {
                    ruleTagNames.push(rule.name);
                }
                typesFile.push(
                    generate(
                        t.exportNamedDeclaration(
                            t.tsTypeAliasDeclaration(
                                ruleToType(rule.name),
                                null,
                                type,
                            ),
                        ),
                    ).code,
                );
            }
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

    typesFile.push(
        generate(
            t.exportNamedDeclaration(
                t.tsTypeAliasDeclaration(
                    t.identifier(`AllTaggedTypes`),
                    null,
                    t.tsUnionType(
                        ruleTagNames.map((name) =>
                            t.tsTypeReference(t.identifier(name)),
                        ),
                    ),
                ),
            ),
        ).code,
    );

    typesFile.push(
        generate(
            t.exportNamedDeclaration(
                t.variableDeclaration('const', [
                    t.variableDeclarator(
                        {
                            ...t.identifier(`AllTaggedTypeNames`),
                            typeAnnotation: t.tsTypeAnnotation(
                                t.tsArrayType(
                                    t.tsIndexedAccessType(
                                        t.tsTypeReference(
                                            t.identifier('AllTaggedTypes'),
                                        ),
                                        t.tsLiteralType(
                                            t.stringLiteral('type'),
                                        ),
                                    ),
                                ),
                            ),
                        },
                        t.arrayExpression(
                            ruleTags
                                .filter((x) => !emptyNames.includes(x))
                                .map((name) => t.stringLiteral(name)),
                        ),
                    ),
                ]),
            ),
        ).code,
    );

    return { typesFile, grammarFile };
};
