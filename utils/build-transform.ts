import { traverse } from '@babel/core';
import generate from '@babel/generator';
import * as t from '@babel/types';

export type Ctx = {
    transformerStatus: { [key: string]: boolean | null };
    transformers: { [key: string]: string };

    types: {
        [key: string]: {
            type: t.TSType;
            params: t.TSTypeParameterDeclaration | null;
        };
    };
    visitorTypes: string[];
};

export const getTypeName = (t: t.TSTypeElement) =>
    t.type === 'TSPropertySignature' &&
    t.key.type === 'Identifier' &&
    t.key.name === 'type' &&
    t.typeAnnotation &&
    t.typeAnnotation.typeAnnotation.type === 'TSLiteralType' &&
    t.typeAnnotation.typeAnnotation.literal.type === 'StringLiteral'
        ? t.typeAnnotation.typeAnnotation.literal.value
        : null;

export const makeIndividualTransformer = (
    vbl: string,
    newName: string,
    level: number,
    type: t.TSType,
    ctx: Ctx,
    nullable?: 'null' | 'undefined',
): string | null => {
    if (level > 20) {
        throw new Error('nope');
    }
    if (nullable != null) {
        const inner = makeIndividualTransformer(
            `${newName}$current`,
            newName + `$${level}$`,
            level,
            type,
            ctx,
        );
        if (!inner) {
            return null;
        }
        return `
        let ${newName} = ${nullable};
        const ${newName}$current = ${vbl};
        if (${newName}$current != null) {
            ${inner}
            ${newName} = ${newName}$${level}$;
        }
        `;
    }
    if (type.type === 'TSTypeReference') {
        // if (type.typeName.type !== 'Identifier') {
        //     console.log(type.typeName);
        //     throw new Error(`qualified?`);
        // }
        if (
            type.typeName.type === 'Identifier' &&
            type.typeName.name === 'Array'
        ) {
            const inner = makeIndividualTransformer(
                `${newName}$item${level}`,
                'result',
                level + 1,
                type.typeParameters!.params[0],
                ctx,
            );
            if (inner) {
                return `
                let ${newName} = ${vbl};
                {
                    let changed${level + 1} = false;
                    const arr${level} = ${vbl}.map((${newName}$item${level}) => {
                        ${inner}
                        return result
                    })
                    if (changed${level + 1}) {
                        ${newName} = arr${level};
                        changed${level} = true;
                    }
                }
                `;
            }
        }
        if (type.typeParameters) {
            // console.log('Generics not handled', type.loc);
            // return null;
        }
        const name =
            type.typeName.type === 'Identifier'
                ? type.typeName.name
                : type.typeName.right.name;
        // if (visitorTypes.includes(type.typeName.name)) {
        // console.log(type.typeName.name, level);
        if (ctx.transformerStatus[name] === undefined) {
            ctx.transformers[name] = makeTransformer(name, ctx);
            // transformerStatus[name] = true;
        }
        if (ctx.transformerStatus[name] === null) {
            return null;
        }
        return `
                const ${newName} = transform${name}(${vbl}, visitor, ctx);
                changed${level} = changed${level} || ${newName} !== ${vbl};`;
        // }
        // if (types[type.typeName.name]) {
        //     console.log(type.typeName.name);
        //     return makeIndividualTransformer(
        //         vbl,
        //         newName,
        //         level,
        //         types[type.typeName.name],
        //     );
        // }
        // OTHERWISE: if this type eventually includes a thing that needs changing,
        // it'll be quite a hassle.
    }
    if (type.type === 'TSTypeLiteral') {
        return objectTransformer(vbl, newName, level, type, ctx);
    }
    if (type.type === 'TSUnionType') {
        if (type.types.length === 2) {
            if (type.types[0].type === 'TSNullKeyword') {
                return makeIndividualTransformer(
                    vbl,
                    newName,
                    level,
                    type.types[1],
                    ctx,
                    'null',
                );
            }
            if (type.types[1].type === 'TSNullKeyword') {
                return makeIndividualTransformer(
                    vbl,
                    newName,
                    level,
                    type.types[0],
                    ctx,
                    'null',
                );
            }
        }
        return unionTransformer(vbl, newName, level, type, ctx);
    }
    if (type.type === 'TSArrayType') {
        throw new Error(`expected Array<X>, not X[]`);
    }
    return null;
};

export const objectTransformer = (
    vbl: string,
    newName: string,
    level: number,
    type: t.TSTypeLiteral,
    ctx: Ctx,
) => {
    const transformers: Array<string> = [];
    const sliders: Array<string> = [];
    type.members.forEach((member) => {
        if (member.type === 'TSIndexSignature') {
            const newNameInner = `${newName}$value`;
            const individual = makeIndividualTransformer(
                `${vbl}[key]`,
                newNameInner,
                level + 1,
                member.typeAnnotation!.typeAnnotation,
                ctx,
            );
            if (individual) {
                transformers.push(`
                const spread: {[key: string]: ${
                    generate(member.typeAnnotation!.typeAnnotation).code
                }} = {};
                Object.keys(${vbl}).forEach(key => {
                    ${individual}
                    spread[key] = ${newNameInner}
                })
                `);
                sliders.push(`...spread`);
                return;
            } else {
                return;
            }
        }
        if (member.type !== 'TSPropertySignature') {
            throw new Error(`Can't process a ${member.type}`);
        }
        if (member.key.type !== 'Identifier') {
            throw new Error(`unexpected key ${member.key.type}`);
        }
        if (!member.typeAnnotation) {
            throw new Error(`No annotation`);
        }
        const newNameInner = `${newName}$${member.key.name}`;
        const individual = makeIndividualTransformer(
            `${vbl}.${member.key.name}`,
            newNameInner,
            level + 1,
            member.typeAnnotation.typeAnnotation,
            ctx,
            member.optional ? 'undefined' : undefined,
        );
        if (individual) {
            transformers.push(individual);
            sliders.push(`${member.key.name}: ${newNameInner}`);
        }
    });
    if (!transformers.length) {
        return null;
    }
    return `
            let ${newName} = ${vbl};
            {
                let changed${level + 1} = false;
                ${transformers.join('\n\n                ')}
                if (changed${level + 1}) {
                    ${newName} =  {...${newName}, ${sliders.join(', ')}};
                    changed${level} = true;
                }
            }
            `;
};

export const unionTransformer = (
    vbl: string,
    newName: string,
    level: number,
    type: t.TSUnionType,
    ctx: Ctx,
) => {
    // console.log('---> getting');
    let hasCases = false;
    const cases: Array<string> = [];
    const processType = (
        type: t.TSType,
        last: boolean,
        toplevelName?: string,
    ) => {
        if (type.type === 'TSUnionType') {
            const sorted = type.types.slice().sort((a, b) => {
                const au =
                    a.type === 'TSTypeReference' &&
                    a.typeName.type === 'Identifier' &&
                    ctx.types[a.typeName.name] &&
                    ctx.types[a.typeName.name].type.type === 'TSUnionType';
                const bu =
                    b.type === 'TSTypeReference' &&
                    b.typeName.type === 'Identifier' &&
                    ctx.types[b.typeName.name] &&
                    ctx.types[b.typeName.name].type.type === 'TSUnionType';
                return (au ? 1 : 0) - (bu ? 1 : 0);
            });
            sorted.forEach((inner, i) => {
                processType(inner, last && i === sorted.length - 1);
            });
        } else if (
            type.type === 'TSTypeReference' &&
            type.typeName.type === 'Identifier'
        ) {
            if (last) {
                const transformer = makeIndividualTransformer(
                    vbl,
                    `${newName}$${level}node`,
                    level,
                    type,
                    ctx,
                );
                if (transformer) {
                    cases.push(`default: {
                        // let changed${level + 1} = false;
                        ${transformer}
                        ${newName} = ${newName}$${level}node;
                    }`);
                }
            } else if (ctx.types[type.typeName.name]) {
                let inner = ctx.types[type.typeName.name].type;
                if (type.typeParameters) {
                    inner = subsituteTypeArgs(
                        ctx.types[type.typeName.name].type,
                        ctx.types[type.typeName.name].params,
                        type.typeParameters,
                    );
                    // throw new Error('vbl in union, must fix');
                }
                processType(inner, false, type.typeName.name);
            }
        } else if (type.type === 'TSTypeLiteral') {
            const tname = type.members
                .map(getTypeName)
                .filter(Boolean) as Array<string>;
            if (!tname.length) {
                throw new Error(`No 'type' member`);
            }
            const name = tname[0];
            if (toplevelName) {
                hasCases = true;

                if (ctx.transformerStatus[toplevelName] === undefined) {
                    ctx.transformers[toplevelName] = makeTransformer(
                        toplevelName,
                        ctx,
                    );
                    // transformerStatus[toplevelName] = true;
                }
                if (ctx.transformerStatus[toplevelName] != null) {
                    cases.push(`case '${name}': {
                        ${newName} = transform${toplevelName}(${vbl}, visitor, ctx);
                        changed${level} = changed${level} || ${newName} !== ${vbl};
                        break;
                    }`);
                    return;
                }
            }
            const specified = `${newName}$${level}specified`;
            const transformer = objectTransformer(
                specified,
                `${newName}$${level}node`,
                level + 1,
                type,
                ctx,
            );
            if (transformer) {
                cases.push(`case '${name}': {
                    const ${specified} = ${vbl};
                    let changed${level + 1} = false;
                    ${transformer}
                    ${newName} = ${newName}$${level}node;
                    break;
                }`);
                hasCases = true;
            } else {
                cases.push(`case '${name}': break;`);
            }
        }
    };
    processType(type, true);
    // getAllUnionTypeMembers(allTypes, type, {});
    // console.log('<--- got');
    // const individualCases = allTypes.map(([name, defn]) => {
    //     const transformer = objectTransformer(
    //         vbl,
    //         `${newName}$${level}node`,
    //         level + 1,
    //         defn,
    //     );
    //     if (!transformer) {
    //         return `case '${name}': break;`;
    //     }
    //     return `case '${name}': {
    //             let changed${level + 1} = false;
    //             ${transformer}
    //             ${newName} = ${newName}$${level}node;
    //             break;
    //         }`;
    // });
    if (!hasCases) {
        return null; // `const ${newName} = ${vbl};`;
    }
    return `
        let ${newName} = ${vbl};
        switch (${vbl}.type) {
            ${cases.join('\n\n            ')}
        }`;
};

// TODO: Let | Term should break out to --- switch let, and then just delegate to 'Term'

export const subsituteTypeArgs = (
    type: t.TSType,
    params: t.TSTypeParameterDeclaration | null,
    args: t.TSTypeParameterInstantiation,
) => {
    if (!params) {
        console.error(type.loc);
        throw new Error(`params provided, bt not declared`);
    }

    const names = params.params.map((param) => param.name);

    const cloned = t.cloneNode(type, true);
    traverse(cloned, {
        noScope: true,
        enter: (path) => {
            if (
                path.node.type === 'TSTypeReference' &&
                path.node.typeName.type === 'Identifier'
            ) {
                const idx = names.indexOf(path.node.typeName.name);
                if (idx !== -1) {
                    path.replaceWith(args.params[idx]);
                }
            }
        },
    });
    return cloned;
};

export const makeTransformer = (
    name: string,
    ctx: Ctx,
    args?: t.TSTypeParameterInstantiation,
) => {
    // console.log(name);
    ctx.transformerStatus[name] = false;
    const defn = ctx.types[name];
    if (!defn) {
        ctx.transformerStatus[name] = null;
        return `// not a type ${name}`;
        // throw new Error(`Not a type ${name}`);
    }
    let t: t.TSType = defn.type;
    if (args) {
        t = subsituteTypeArgs(t, defn.params, args);
    }
    const transformer = makeIndividualTransformer(
        `node`,
        `updatedNode`,
        0,
        defn.type,
        ctx,
    );
    if (transformer == null && !ctx.visitorTypes.includes(name)) {
        ctx.transformerStatus[name] = null;
        return `// no transformer for ${name}`;
    }
    return `export const transform${name} = <Ctx>(node: ${name}, visitor: Visitor<Ctx>, ctx: Ctx): ${name} => {
        if (!node) {
            throw new Error('No ${name} provided');
        }
        ${
            ctx.visitorTypes.includes(name)
                ? `
        const transformed = visitor.${name} ? visitor.${name}(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        `
                : ''
        }
        let changed0 = false;
        ${transformer ? transformer : 'const updatedNode = node;'}
        ${
            ctx.visitorTypes.includes(name)
                ? `
        node = updatedNode;
        if (visitor.${name}Post) {
            const transformed = visitor.${name}Post(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        `
                : 'return updatedNode;'
        }
    }`;
};

export const getUnionNames = (t: t.TSUnionType, ctx: Ctx) => {
    const allTypes: Array<[string, t.TSTypeLiteral]> = [];
    getAllUnionTypeMembers(allTypes, t, {}, ctx);
    return allTypes.map((n) => n[0]);
};

export const getAllUnionTypeMembers = (
    allTypes: Array<[string, t.TSTypeLiteral]>,
    t: t.TSType,
    seen: { [key: string]: boolean },
    ctx: Ctx,
) => {
    if (t.type === 'TSTypeLiteral') {
        const names = t.members
            .map(getTypeName)
            .filter(Boolean) as Array<string>;
        if (names.length === 1) {
            allTypes.push([names[0], t]);
        } else {
            console.log(JSON.stringify(t));
            throw new Error(`no 'type' for type`);
        }
        return;
    }
    if (t.type === 'TSUnionType') {
        t.types.forEach((t) => getAllUnionTypeMembers(allTypes, t, seen, ctx));
        return;
    }
    if (t.type === 'TSTypeReference' && t.typeName.type === 'Identifier') {
        if (seen[t.typeName.name]) {
            return;
        }
        seen[t.typeName.name] = true;
        console.log('-', t.typeName.name);
        if (ctx.types[t.typeName.name]) {
            getAllUnionTypeMembers(
                allTypes,
                ctx.types[t.typeName.name].type,
                seen,
                ctx,
            );
            return;
        }
    }
    if (t.type === 'TSNullKeyword') {
        throw new Error(`wat null`);
    }
    console.log(JSON.stringify(t));
    throw new Error(`Unexpected type ${t.type}`);
};

export function buildTransformFile(
    body: t.Statement[],
    relativeSource: string,
    ctx: Ctx,
) {
    body.forEach((stmt) => {
        if (
            stmt.type === 'ExportNamedDeclaration' &&
            stmt.declaration &&
            stmt.declaration.type === 'TSTypeAliasDeclaration'
        ) {
            // console.log(stmt.declaration.id.name);
            ctx.types[stmt.declaration.id.name] = {
                type: stmt.declaration.typeAnnotation,
                params: stmt.declaration.typeParameters || null,
            };
        }
    });

    ctx.visitorTypes.forEach(
        (name) => (ctx.transformers[name] = makeTransformer(name, ctx)),
    );

    const resolveType = (t: t.TSType): t.TSType => {
        if (t.type === 'TSTypeReference' && t.typeName.type === 'Identifier') {
            const name = t.typeName.name;
            if (ctx.types[name]) {
                return resolveType(ctx.types[name].type);
            }
        }
        return t;
    };

    const visitorSubs: string[] = [];
    ctx.visitorTypes.forEach((name) => {
        const { type } = ctx.types[name];
        if (type.type === 'TSUnionType') {
            type.types.forEach((item) => {
                const resolved = resolveType(item);
                if (resolved.type === 'TSTypeLiteral') {
                    const tname = resolved.members
                        .map(getTypeName)
                        .filter(Boolean) as Array<string>;
                    if (tname.length && ctx.types[tname[0]]) {
                        visitorSubs.push(
                            `${name}_${tname[0]}?: (node: ${tname}, ctx: any) => null | false | ${name} | [${name} | null, Ctx]`,
                        );
                    }
                }
            });
        }
    });

    const prelude = `import {${Object.keys(ctx.transformerStatus)
        .filter((k) => k !== 'Array')
        .join(', ')}} from '${relativeSource}';

export type Visitor<Ctx> = {
    ${ctx.visitorTypes
        .map(
            (
                name,
            ) => `${name}?: (node: ${name}, ctx: Ctx) => null | false | ${name} | [${name} | null, Ctx],
    ${name}Post?: (node: ${name}, ctx: Ctx) => null | ${name},`,
        )
        .join('\n    ')}
    ${visitorSubs.join(',\n    ')}
}
`;

    let text =
        prelude +
        Object.keys(ctx.transformers)
            .map((k) => ctx.transformers[k])
            .join('\n\n');

    return text;
}

export const generateCheckers = (ctx: Ctx, distinguishTypes: string[]) => {
    let result: string[] = [];
    distinguishTypes.forEach((item) => {
        const [name, ...rest] = item.split(',').filter(Boolean);
        if (!ctx.types[name]) {
            throw new Error(`Unknown type ${name}`);
        }
        // we're distinguishing the First from the Others
        result.push(`export const is${name} = (value: ${name} | ${rest.join(
            ' | ',
        )}): value is ${name} => {
        switch (value.type) {
            ${getUnionNames(ctx.types[name].type as t.TSUnionType, ctx)
                .map((name) => `case "${name}":`)
                .join('\n        ')}
                return true
            default:
                return false
        }
    }`);
    });
    return result.join('\n');
};
