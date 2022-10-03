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

type Options = { from: boolean };

export const generateToMap = (
    grammar: Grams,
    tagDeps: { [key: string]: string[] },
) => {
    const items = assembleTypes(grammar, tagDeps, { from: false });
    const fromItems = assembleTypes(grammar, tagDeps, { from: true });
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

export const Blank = (b: t.Blank, m: tm.Map): tm.Blank => b;
export const from_Blank = (b: tm.Blank, m: tm.Map): t.Blank => b;

` +
        Object.keys(items)
            .map(
                (key) => `
export const ${key} = (value: t.${key}, map: tm.Map): tm.${key} => (${items[key]});
export const from_${key} = (value: tm.${key}, map: tm.Map): t.${key} => (${fromItems[key]});
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
    options: Options,
): { [name: string]: string } => {
    const items: { [name: string]: string } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'or') {
            items[name] = gramToType(gram, 'value', options);
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
            options,
        );
        items[name] = `{
    ...value,
    ...${defn},
}`;
    }
    Object.keys(tags).forEach((tag) => {
        items[tag] =
            tags[tag]
                .concat(['Blank'])
                .map(
                    (inner) =>
                        (tags[inner]
                            ? tags[inner]
                                  .map((i2) => `value.type === "${i2}"`)
                                  .join(' || ')
                            : `value.type === "${inner}"`) +
                        ` ? ${
                            (options.from ? 'from_' : '') + inner
                        }(value, map) : `,
                )
                .join('\n') +
            `\nfail("Unexpected type: " + (value as any).type)`;
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
    options: Options,
): string => {
    if (Array.isArray(gram)) {
        return gramToType({ type: 'sequence', items: gram }, value, options);
    }
    if (gram.type === 'suffixes') {
        return `{
            target: ${gramToType(gram.target, `${value}.target`, options)},
            suffixes: ${value}.suffixes.map(suffix => ${gramToType(
            gram.suffix,
            `suffix`,
            options,
        )}),

        }`;
    }
    if (gram.type === 'derived') {
        return gramToType(gram, value, options);
    }
    throw new Error(`not yet ${gram.type}`);
};

export const sequenceToType = (
    grams: Gram<never>[],
    value: string,
    options: Options,
): string => {
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
            attrs[item.name] = gramToType(
                item.inner,
                value + '.' + item.name,
                options,
            );
        }
    });
    if (!Object.keys(attrs).length && firstNonString) {
        return gramToType(firstNonString, value, options);
    }
    return `{
        ${Object.keys(attrs)
            .map((key) => `${key}: ${attrs[key]},`)
            .join('\n        ')}
    }`;
};

export const gramToType = (
    gram: Gram<never>,
    value: string,
    options: Options,
): string => {
    switch (gram.type) {
        case 'sequence': {
            return sequenceToType(gram.items, value, options);
        }
        case 'derived': {
            return value;
        }
        case 'literal':
            return value;
        case 'literal-ref':
            return value;
        case 'ref':
            if (options.from) {
                return `from_${gram.id}(map[${value}].value as tm.${gram.id}, map)`;
            }
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
            return `${value}.map(item => ${gramToType(
                gram.item,
                'item',
                options,
            )})`;
        }
        case 'or': {
            if (gram.options.every((v) => v.type === 'literal')) {
                return value;
            }
            return (
                gram.options
                    .map((v) =>
                        v.type === 'ref'
                            ? `${
                                  options.from ? `map[${value}].value` : value
                              }.type === '${v.id}' ? ${gramToType(
                                  v,
                                  value,
                                  options,
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
            return `${value}.map(item => ${gramToType(
                gram.item,
                'item',
                options,
            )})`;
        case 'optional':
            // return b.tsUnionType([b.tsNullKeyword(), gramToType(gram.item)]);
            return `${value} ? ${gramToType(gram.item, value, options)} : null`;
        case 'inferrable':
            return `${value} ? {...${value}, value: ${gramToType(
                gram.item,
                value + '.value',
                options,
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
