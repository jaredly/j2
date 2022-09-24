// Generate types

import {
    change,
    check,
    Derived,
    EExtra,
    Gram,
    Grams,
    TGram,
    TopGram,
    transform,
    transformGram,
} from '../grams/types';
import * as b from '@babel/types';
import generate from '@babel/generator';

export const generateToMap = (
    grammar: Grams,
    tagDeps: { [key: string]: string[] },
) => {
    const items = assembleTypes(grammar, tagDeps);
    return (
        `
import * as t from './types';
import * as tm from './type-map';

const fail = (message?: string) => {
    throw new Error("IDK " + message);
}

export const add = (map: tm.Map, item: tm.Map[0]) => {
    map[item.value.loc.idx] = item;
    return item.value.loc.idx;
};

` +
        Object.keys(items)
            .map(
                (key) => `
export const ${key} = (value: t.${key}, map: tm.Map): tm.${key} => (${items[key]});
export const ${key}_id = (value: t.${key}, map: tm.Map): number => add(map, {
    type: "${key}",
    value: ${key}(value, map)
});`,
            )
            .join('\n\n')
    );
};

export const assembleTypes = (
    grammar: Grams,
    tags: { [key: string]: string[] },
): { [name: string]: string } => {
    const items: { [name: string]: string } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'or') {
            items[name] = gramToType(gram, 'value');
            continue;
        }
        if (gram.type === 'peggy') {
            // items[name] = 'value';
            continue;
        }
        let defn = topGramToType(
            gram.type === 'sequence'
                ? gram.items
                : gram.type === 'derived'
                ? gram
                : gram.inner,
            'value',
        );
        items[name] = `{
    ...value,
    ...${defn},
}`;
    }
    Object.keys(tags).forEach((tag) => {
        items[tag] =
            tags[tag]
                .map(
                    (inner) =>
                        (tags[inner]
                            ? tags[inner]
                                  .map((i2) => `value.type === "${i2}"`)
                                  .join(' || ')
                            : `value.type === "${inner}"`) +
                        ` ? ${inner}(value, map) : `,
                )
                .join('\n') + `\nfail("Unexpected type: " + value.type)`;
        // items[tag] = b.tsUnionType(
        //         tags[tag]
        //             .map((name) => b.tsTypeReference(b.identifier(name)))
        //             .concat([b.tsTypeReference(b.identifier('Blank'))]),
        //     ),
        // });
    });
    return items;
};

export const topGramToType = (
    gram: TopGram<never>['inner'] | Derived<never>,
    value: string,
): string => {
    if (Array.isArray(gram)) {
        return gramToType({ type: 'sequence', items: gram }, value);
    }
    if (gram.type === 'suffixes') {
        return `{
            target: ${gramToType(gram.target, `${value}.target`)},
            suffixes: ${value}.suffixes.map(suffix => ${gramToType(
            gram.suffix,
            `suffix`,
        )}),

        }`;
    }
    if (gram.type === 'derived') {
        return gramToType(gram, value);
    }
    throw new Error(`not yet ${gram.type}`);
};

export const sequenceToType = (grams: Gram<never>[], value: string): string => {
    const attrs: { [key: string]: string } = {};
    let firstNonString: null | Gram<EExtra> = null;
    grams.forEach((item) => {
        if (
            !firstNonString &&
            item.type !== 'literal' &&
            item.type !== 'literal-ref'
        ) {
            firstNonString = item;
        }
        if (item.type === 'named') {
            attrs[item.name] = gramToType(item.inner, value + '.' + item.name);
        }
    });
    if (!Object.keys(attrs).length && firstNonString) {
        return gramToType(firstNonString, value);
    }
    return `{
        ${Object.keys(attrs)
            .map((key) => `${key}: ${attrs[key]},`)
            .join('\n        ')}
    }`;
};

export const gramToType = (gram: Gram<never>, value: string): string => {
    switch (gram.type) {
        case 'sequence': {
            return sequenceToType(gram.items, value);
        }
        case 'derived': {
            return value;
            // return b.tsTypeLiteral([
            //     b.tsPropertySignature(
            //         b.identifier('raw'),
            //         b.tsTypeAnnotation(gramToType(gram.inner)),
            //     ),
            //     b.tsPropertySignature(
            //         b.identifier('value'),
            //         b.tsTypeAnnotation(
            //             b.tsTypeReference(b.identifier(gram.typeName)),
            //         ),
            //     ),
            // ]);
        }
        case 'literal':
            // return b.tsLiteralType(b.stringLiteral(gram.value));
            return value;
        case 'literal-ref':
            return value;
        case 'ref':
            // return b.tsTypeReference(b.identifier(gram.id));
            return `${gram.id}_id(${value}, map)`;
        case 'args': {
            if (gram.last) {
                // return b.tsTypeLiteral([
                //     b.tsPropertySignature(
                //         b.identifier('items'),
                //         b.tsTypeAnnotation(gramToType(gram.item)),
                //     ),
                //     b.tsPropertySignature(
                //         b.identifier('last'),
                //         b.tsTypeAnnotation(gramToType(gram.last)),
                //     ),
                // ]);
            }
            return `${value}.map(item => ${gramToType(gram.item, 'item')})`;
        }
        case 'or': {
            // return b.tsUnionType(gram.options.map((v) => gramToType(v)));
            if (gram.options.every((v) => v.type === 'literal')) {
                return value;
            }
            return (
                gram.options
                    .map((v) =>
                        v.type === 'ref'
                            ? `${value}.type === '${v.id}' ? ${gramToType(
                                  v,
                                  value,
                              )} : `
                            : `fail("${v.type}") || `,
                    )
                    .join('') + ' fail("no option")'
            );
        }
        case 'named':
            console.error(`Named in the wrong place`);
            // return gramToType(gram.inner);
            return value;
        case 'star':
        case 'plus':
            return `${value}.map(item => ${gramToType(gram.item, 'item')})`;
        case 'optional':
            // return b.tsUnionType([b.tsNullKeyword(), gramToType(gram.item)]);
            return `${value} ? ${gramToType(gram.item, value)} : null`;
        case 'inferrable':
            return `${value} ? {...${value}, value: ${gramToType(
                gram.item,
                value + '.value',
            )}} : null`;
        // return b.tsUnionType([
        //     b.tsTypeLiteral([
        //         b.tsPropertySignature(
        //             b.identifier('inferred'),
        //             b.tsTypeAnnotation(b.tsBooleanKeyword()),
        //         ),
        //         b.tsPropertySignature(
        //             b.identifier('value'),
        //             b.tsTypeAnnotation(gramToType(gram.item)),
        //         ),
        //     ]),
        //     b.tsNullKeyword(),
        // ]);
    }
};
