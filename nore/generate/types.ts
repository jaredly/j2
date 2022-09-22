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

export type Options = { idRefs?: boolean; simpleRules?: string[] };

export const generateTypes = (
    grammar: Grams,
    tagDeps: { [key: string]: string[] },
    options: Options = {},
) => {
    const { lines, tags } = assembleTypes(grammar, tagDeps, options);
    return typesToScript(lines, tags, grammar, options);
};

export const assembleTypes = (
    grammar: Grams,
    tagDeps: { [key: string]: string[] },
    options: Options,
): {
    lines: { name: string; defn: b.TSType }[];
    tags: { [name: string]: string[] };
} => {
    const lines: { name: string; defn: b.TSType }[] = [
        {
            name: 'Blank',
            defn: b.tsTypeLiteral([
                b.tsPropertySignature(
                    b.identifier('type'),
                    b.tsTypeAnnotation(
                        b.tsLiteralType(b.stringLiteral('Blank')),
                    ),
                ),
                b.tsPropertySignature(
                    b.identifier('loc'),
                    b.tsTypeAnnotation(b.tsTypeReference(b.identifier('Loc'))),
                ),
            ]),
        },
    ];
    const tags: { [name: string]: string[] } = { ...tagDeps };
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'or') {
            lines.push({ name, defn: gramToType(gram, options) });
            continue;
        }
        if (gram.type === 'tagged') {
            gram.tags.forEach((tag) => {
                if (!tags[tag]) tags[tag] = [];
                tags[tag].push(name);
            });
        }
        if (gram.type === 'peggy') {
            lines.push({ name, defn: b.tsStringKeyword() });
            continue;
        }
        let defn = topGramToType(
            gram.type === 'sequence'
                ? gram.items
                : gram.type === 'derived'
                ? gram
                : gram.inner,
            options,
        );
        lines.push({
            name,
            defn: b.tsTypeLiteral([
                b.tsPropertySignature(
                    b.identifier('type'),
                    b.tsTypeAnnotation(b.tsLiteralType(b.stringLiteral(name))),
                ),
                ...defn.members,
                b.tsPropertySignature(
                    b.identifier('loc'),
                    b.tsTypeAnnotation(b.tsTypeReference(b.identifier('Loc'))),
                ),
            ]),
        });
    }
    Object.keys(tags).forEach((tag) => {
        lines.push({
            name: tag,
            defn: b.tsUnionType(
                tags[tag]
                    .map((name) => b.tsTypeReference(b.identifier(name)))
                    .concat([b.tsTypeReference(b.identifier('Blank'))]),
            ),
        });
    });
    return { lines, tags };
};

export const topGramToType = (
    gram: TopGram<never>['inner'] | Derived<never>,
    options: Options,
): b.TSTypeLiteral => {
    if (Array.isArray(gram)) {
        const res = gramToType({ type: 'sequence', items: gram }, options);
        if (res.type === 'TSTypeLiteral') {
            return res;
        }
        throw new Error(`Not a working sequence`);
    }
    if (gram.type === 'suffixes') {
        return b.tsTypeLiteral([
            b.tsPropertySignature(
                b.identifier('target'),
                b.tsTypeAnnotation(gramToType(gram.target, options)),
            ),
            b.tsPropertySignature(
                b.identifier('suffixes'),
                b.tsTypeAnnotation(
                    b.tsArrayType(gramToType(gram.suffix, options)),
                ),
            ),
        ]);
    }
    if (gram.type === 'derived') {
        return gramToType(gram, options) as b.TSTypeLiteral;
    }
    throw new Error(`not yet ${gram.type}`);
};

export const sequenceToType = (
    grams: Gram<never>[],
    options: Options,
): b.TSType => {
    const attrs: { [key: string]: b.TSType } = {};
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
            attrs[item.name] = gramToType(item.inner, options);
        }
    });
    if (!Object.keys(attrs).length && firstNonString) {
        return gramToType(firstNonString, options);
    }
    return b.tsTypeLiteral(
        Object.keys(attrs).map((key) =>
            b.tsPropertySignature(
                b.identifier(key),
                b.tsTypeAnnotation(attrs[key]),
            ),
        ),
    );
};

export const gramToType = (gram: Gram<never>, options: Options): b.TSType => {
    switch (gram.type) {
        case 'sequence': {
            return sequenceToType(gram.items, options);
        }
        case 'derived': {
            return b.tsTypeLiteral([
                b.tsPropertySignature(
                    b.identifier('raw'),
                    b.tsTypeAnnotation(gramToType(gram.inner, options)),
                ),
                b.tsPropertySignature(
                    b.identifier('value'),
                    b.tsTypeAnnotation(
                        b.tsTypeReference(b.identifier(gram.typeName)),
                    ),
                ),
            ]);
        }
        case 'literal':
            return b.tsLiteralType(b.stringLiteral(gram.value));
        case 'literal-ref':
        case 'ref':
            if (options.idRefs && !options.simpleRules?.includes(gram.id)) {
                return b.tsNumberKeyword();
            } else {
                return b.tsTypeReference(b.identifier(gram.id));
            }
        case 'args': {
            if (gram.last) {
                return b.tsTypeLiteral([
                    b.tsPropertySignature(
                        b.identifier('items'),
                        b.tsTypeAnnotation(gramToType(gram.item, options)),
                    ),
                    b.tsPropertySignature(
                        b.identifier('last'),
                        b.tsTypeAnnotation(gramToType(gram.last, options)),
                    ),
                ]);
            }
            return b.tsArrayType(gramToType(gram.item, options));
        }
        case 'or': {
            return b.tsUnionType(
                gram.options.map((v) => gramToType(v, options)),
            );
        }
        case 'named':
            console.error(`Named in the wrong place`);
            return gramToType(gram.inner, options);
        case 'star':
        case 'plus':
            return b.tsArrayType(gramToType(gram.item, options));
        case 'optional':
            return b.tsUnionType([
                b.tsNullKeyword(),
                gramToType(gram.item, options),
            ]);
        case 'inferrable':
            return b.tsUnionType([
                b.tsTypeLiteral([
                    b.tsPropertySignature(
                        b.identifier('inferred'),
                        b.tsTypeAnnotation(b.tsBooleanKeyword()),
                    ),
                    b.tsPropertySignature(
                        b.identifier('value'),
                        b.tsTypeAnnotation(gramToType(gram.item, options)),
                    ),
                ]),
                b.tsNullKeyword(),
            ]);
        // case 'binops':
        //     throw new Error(`not sure about binops yet`);
    }
};

export function typesToScript(
    lines: { name: string; defn: b.TSType }[],
    tags: { [name: string]: string[] },
    grammar: Grams,
    options: Options,
) {
    return (
        `export type Loc = {
    start: number;
    end: number;
    idx: number;
}\n\n` +
        lines
            .map(
                ({ name, defn }) =>
                    `export type ${name} = ${generate(defn).code};`,
            )
            .join('\n\n') +
        (options.idRefs
            ? `
 
${Object.keys(grammar)
    .filter((k) => (grammar[k] as any).type !== 'peggy')
    .concat(Object.keys(tags))
    .map(
        (k) => `export type Map${k} = {
    type: '${k}',
    value: ${k},
}`,
    )
    .join('\n\n')}

export type Map = {
	[key: number]: ${Object.keys(grammar)
        .filter((k) => (grammar[k] as any).type !== 'peggy')
        .concat(Object.keys(tags))
        .map((k) => `Map${k}`)
        .join(' | ')}
}
`
            : '')
    );
}
