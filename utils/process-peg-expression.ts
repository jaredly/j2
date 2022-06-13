import * as peggy from 'peggy';
import * as t from '@babel/types';

const orNull = (type: t.TSType) => t.tsUnionType([type, t.tsNullKeyword()]);

const typesEqual = (one: t.TSType, two: t.TSType) =>
    t.isNodesEquivalent(one, two);

export const ruleToType = (name: string) => t.identifier(name);

export const processExpression = (
    expr: peggy.ast.Expression | peggy.ast.Named,
    ctx:
        | { type: 'top'; ruleName: string }
        | { type: 'inner'; vbl: t.Expression },
    ruleTags: Array<string>,
    first = false,
): [t.TSType, null | t.Expression] => {
    if (ctx.type === 'top' && ctx.ruleName.match(/^_/)) {
        return [t.tsTypeReference(t.identifier('string')), null];
    }
    switch (expr.type) {
        case 'literal': {
            return [t.tsTypeReference(t.identifier('string')), null];
        }
        case 'named': {
            return processExpression(expr.expression, ctx, ruleTags, first);
        }
        case 'text':
            return [t.tsTypeReference(t.identifier('string')), null];
        case 'action': {
            if (ctx.type === 'inner') {
                throw new Error(`inner action`);
            }
            return processExpression(expr.expression, ctx, ruleTags, first);
        }
        case 'rule_ref': {
            return [t.tsTypeReference(ruleToType(expr.name)), null];
        }
        case 'choice': {
            const names = expr.alternatives.map((alt) => {
                if (alt.type === 'literal') {
                    return t.tsLiteralType(t.stringLiteral(alt.value));
                }
                if (alt.type === 'text') {
                    return t.tsTypeReference(t.identifier('string'));
                }
                if (alt.type !== 'rule_ref') {
                    throw new Error(`Choice with ${alt.type}`);
                }
                return t.tsTypeReference(ruleToType(alt.name));
            });
            return [t.tsUnionType(names), null];
        }
        case 'optional': {
            const [type, inner] = processExpression(
                expr.expression,
                ctx,
                ruleTags,
            );
            return [
                orNull(type),
                inner == null || ctx.type === 'top'
                    ? inner
                    : t.conditionalExpression(ctx.vbl, inner, ctx.vbl),
            ];
        }
        case 'zero_or_more':
        case 'one_or_more': {
            const [type, inner] = processExpression(
                expr.expression,
                {
                    type: 'inner',
                    vbl: t.identifier('element'),
                },
                ruleTags,
            );
            if (inner === null) {
                return [t.tsArrayType(type), null];
            }
            if (ctx.type === 'top') {
                throw new Error(`cant do this at tope`);
            }
            return [
                t.tsArrayType(type),
                t.callExpression(
                    t.memberExpression(ctx.vbl, t.identifier('map')),
                    [
                        t.arrowFunctionExpression(
                            [t.identifier('element')],
                            inner,
                        ),
                    ],
                ),
            ];
        }
        case 'group':
            if (ctx.type === 'inner' && expr.expression.type === 'sequence') {
                let found = null as null | [t.TSType, t.Expression];
                expr.expression.elements.forEach((el, i) => {
                    // skip it
                    if (el.type === 'rule_ref' && el.name.match(/^[^A-Z]/)) {
                        return;
                    }
                    if (found && el.type === 'literal') {
                        return;
                    }
                    if (
                        found &&
                        el.type === 'optional' &&
                        el.expression.type === 'literal'
                    ) {
                        return;
                    }
                    const vbl = t.memberExpression(
                        ctx.vbl,
                        t.numericLiteral(i),
                        true,
                    );
                    const [type, inner] = processExpression(
                        el,
                        {
                            type: 'inner',
                            vbl,
                        },
                        ruleTags,
                    );
                    found = [type, inner ? inner : vbl];
                });
                if (found == null) {
                    console.log(expr.expression.elements.map((m) => m.type));
                    throw new Error(
                        `nested group, should have one capitalized ref`,
                    );
                }
                return found;
            }
            console.log(expr);
            throw new Error(`toplevel group or something`);
        case 'labeled':
        case 'sequence': {
            const elements = expr.type === 'labeled' ? [expr] : expr.elements;
            if (ctx.type === 'inner') {
                console.log(expr);
                throw new Error(`sequence is only toplevel`);
            }
            let attributes: Array<[string, t.TSType, t.Expression]> = [];
            elements.forEach((element) => {
                if (element.type === 'labeled' && element.label != null) {
                    const [type, expr] = processExpression(
                        element.expression,
                        {
                            type: 'inner',
                            vbl: t.identifier(element.label),
                        },
                        ruleTags,
                    );
                    attributes.push([
                        element.label,
                        type,
                        expr ? expr : t.identifier(element.label),
                    ]);
                }
            });

            // TODO: if the type is | or null, and we're verifying that it exists, then
            // we can drop the orNull
            const isExpendable = ([name, t, _]: [
                string,
                t.TSType,
                t.Expression,
            ]) =>
                name.endsWith('_drop') &&
                (t.type === 'TSArrayType' ||
                    t.type === 'TSOptionalType' ||
                    (t.type === 'TSUnionType' &&
                        t.types[1].type === 'TSNullKeyword'));

            if (
                attributes.length === 2 &&
                attributes[0][0] === 'first' &&
                attributes[1][0] === 'rest' &&
                attributes[1][1].type === 'TSArrayType' &&
                typesEqual(attributes[0][1], attributes[1][1].elementType)
            ) {
                attributes = [
                    [
                        'items',
                        attributes[1][1],
                        t.arrayExpression([
                            attributes[0][2],
                            t.spreadElement(attributes[1][2]),
                        ]),
                    ],
                ];
                // return [
                //     attributes[1][1],
                //     t.arrayExpression([
                //         attributes[0][2],
                //         t.spreadElement(attributes[1][2]),
                //     ]),
                // ];
            }
            const canDropThrough =
                attributes.length === 2 &&
                (isExpendable(attributes[0]) || isExpendable(attributes[1]));
            const typeName = attributes.some((s) => s[0] === 'type')
                ? '$type'
                : 'type';
            ruleTags.push(ctx.ruleName);

            const recordType = t.tsTypeLiteral(
                [
                    t.tsPropertySignature(
                        t.identifier(typeName),
                        t.tsTypeAnnotation(
                            t.tsLiteralType(t.stringLiteral(ctx.ruleName)),
                        ),
                    ),
                    t.tsPropertySignature(
                        t.identifier('loc'),
                        t.tsTypeAnnotation(
                            t.tsTypeReference(t.identifier('Location')),
                        ),
                    ),
                    ...(first
                        ? [
                              t.tsPropertySignature(
                                  t.identifier('comments'),
                                  t.tsTypeAnnotation(
                                      t.tsTypeReference(
                                          t.identifier('Array'),
                                          t.tsTypeParameterInstantiation([
                                              t.tsTupleType([
                                                  t.tsTypeReference(
                                                      t.identifier('Location'),
                                                  ),
                                                  t.tsTypeReference(
                                                      t.identifier('string'),
                                                  ),
                                              ]),
                                          ]),
                                      ),
                                  ),
                              ),
                          ]
                        : []),
                ].concat(
                    attributes.map(([name, type, _]) => {
                        return t.tsPropertySignature(
                            t.identifier(name.replace(/_drop$/, '')),
                            name.endsWith('_drop') &&
                                canDropThrough &&
                                type.type === 'TSUnionType' &&
                                type.types[1].type === 'TSNullKeyword'
                                ? t.tsTypeAnnotation(type.types[0])
                                : t.tsTypeAnnotation(type),
                        );
                    }),
                ),
            );
            const recordObject = t.objectExpression(
                [
                    t.objectProperty(
                        t.identifier(typeName),
                        t.stringLiteral(ctx.ruleName),
                    ),
                    t.objectProperty(
                        t.identifier('loc'),
                        t.callExpression(t.identifier('myLocation'), []),
                    ),
                    ...(first
                        ? [
                              t.objectProperty(
                                  t.identifier('comments'),
                                  t.identifier('allComments'),
                              ),
                          ]
                        : []),
                ].concat(
                    attributes.map(([name, _, expr]) => {
                        return t.objectProperty(
                            t.identifier(name.replace(/_drop$/, '')),
                            expr,
                            false,
                            expr.type === 'Identifier' && expr.name === name,
                        );
                    }),
                ),
            );
            if (canDropThrough) {
                const expFirst = isExpendable(attributes[0]);
                return [
                    t.tsUnionType([
                        recordType,
                        attributes[expFirst ? 1 : 0][1],
                    ]),
                    t.conditionalExpression(
                        attributes[expFirst ? 0 : 1][1].type === 'TSArrayType'
                            ? t.binaryExpression(
                                  '===',
                                  t.memberExpression(
                                      t.identifier(
                                          attributes[expFirst ? 0 : 1][0],
                                      ),
                                      t.identifier('length'),
                                  ),
                                  t.numericLiteral(0),
                              )
                            : t.unaryExpression(
                                  '!',
                                  t.identifier(attributes[expFirst ? 0 : 1][0]),
                              ),
                        t.identifier(attributes[expFirst ? 1 : 0][0]),
                        recordObject,
                    ),
                ];
            }
            return [recordType, recordObject];
        }
    }
    return [t.tsAnyKeyword(), t.stringLiteral(`NOT_IMPL_${expr.type}`)];
};
