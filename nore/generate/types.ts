// Generate types

import { Gram, Grams, TopGram } from '../types';
import * as b from '@babel/types';
import generate from '@babel/generator';

export const generateTypes = (grammar: Grams) => {
    const lines: { name: string; defn: b.TSType }[] = [];
    const tags: { [name: string]: string[] } = {};
    for (const [name, gram] of Object.entries(grammar)) {
        if (!Array.isArray(gram) && gram.type === 'or') {
            lines.push({ name, defn: gramToType(gram) });
            continue;
        }
        if (!Array.isArray(gram) && gram.type === 'tagged') {
            gram.tags.forEach((tag) => {
                if (!tags[tag]) tags[tag] = [];
                tags[tag].push(name);
            });
        }
        let defn = topGramToType(Array.isArray(gram) ? gram : gram.inner);
        lines.push({
            name,
            defn: b.tsTypeLiteral([
                b.tsPropertySignature(
                    b.identifier('type'),
                    b.tsTypeAnnotation(b.tsLiteralType(b.stringLiteral(name))),
                ),
                ...defn.members,
            ]),
        });
    }
    Object.keys(tags).forEach((tag) => {
        lines.push({
            name: tag,
            defn: b.tsUnionType(
                tags[tag].map((name) => b.tsTypeReference(b.identifier(name))),
            ),
        });
    });
    const builtins: { [key: string]: string } = { UIntLiteral: 'number' };
    Object.keys(builtins).forEach((k) => {
        lines.push({
            name: k,
            defn: b.tsTypeReference(b.identifier(builtins[k])),
        });
    });
    return lines
        .map(
            ({ name, defn }) => `export type ${name} = ${generate(defn).code};`,
        )
        .join('\n');
};

export const topGramToType = (gram: TopGram['inner']): b.TSTypeLiteral => {
    if (Array.isArray(gram)) {
        return gramToType(gram) as b.TSTypeLiteral;
    }
    if (gram.type === 'suffixes') {
        return b.tsTypeLiteral([
            b.tsPropertySignature(
                b.identifier('target'),
                b.tsTypeAnnotation(gramToType(gram.target)),
            ),
            b.tsPropertySignature(
                b.identifier('suffixes'),
                b.tsTypeAnnotation(b.tsArrayType(gramToType(gram.suffix))),
            ),
        ]);
    }
    throw new Error('not yet');
};

export const gramToType = (gram: Gram): b.TSType => {
    if (typeof gram === 'string') {
        if (gram.startsWith('$')) {
            return b.tsStringKeyword();
        }
        if (gram[0].toUpperCase() === gram[0]) {
            return b.tsTypeReference(b.identifier(gram));
        }
        return b.tsLiteralType(b.stringLiteral(gram));
    }
    if (Array.isArray(gram)) {
        const attrs: { [key: string]: b.TSType } = {};
        let firstNonString: null | Gram = null;
        gram.forEach((item) => {
            if (
                !firstNonString &&
                (typeof item !== 'string' || item.match(/[A-Z]/))
            ) {
                firstNonString = item;
            }
            if (
                typeof item === 'object' &&
                !Array.isArray(item) &&
                item.type === 'named'
            ) {
                attrs[item.name] = gramToType(item.inner);
            }
        });
        if (!Object.keys(attrs).length && firstNonString) {
            return gramToType(firstNonString);
        }
        return b.tsTypeLiteral(
            Object.keys(attrs).map((key) =>
                b.tsPropertySignature(
                    b.identifier(key),
                    b.tsTypeAnnotation(attrs[key]),
                ),
            ),
        );
    }
    switch (gram.type) {
        case 'args': {
            if (gram.last) {
                return b.tsTypeLiteral([
                    b.tsPropertySignature(
                        b.identifier('items'),
                        b.tsTypeAnnotation(gramToType(gram.item)),
                    ),
                    b.tsPropertySignature(
                        b.identifier('last'),
                        b.tsTypeAnnotation(gramToType(gram.last)),
                    ),
                ]);
            }
            return b.tsArrayType(gramToType(gram.item));
        }
        case 'or': {
            return b.tsUnionType(gram.options.map(gramToType));
        }
        case 'named':
            console.error(`Named in the wrong place`);
            return gramToType(gram.inner);
        case 'star':
        case 'plus':
            return b.tsArrayType(gramToType(gram.item));
        case 'optional':
            return b.tsUnionType([b.tsNullKeyword(), gramToType(gram.item)]);
        case 'inferrable':
            return b.tsTypeLiteral([
                b.tsPropertySignature(
                    b.identifier('inferred'),
                    b.tsTypeAnnotation(b.tsBooleanKeyword()),
                ),
                b.tsPropertySignature(
                    b.identifier('item'),
                    b.tsTypeAnnotation(gramToType(gram.item)),
                ),
            ]);
        // case 'binops':
        //     throw new Error(`not sure about binops yet`);
    }
};
