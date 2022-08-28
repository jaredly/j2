// Generate types

import {
    EExtra,
    Gram,
    Grams,
    TGram,
    TopGram,
    transform,
    transformGram,
} from '../types';
import * as b from '@babel/types';
import generate from '@babel/generator';

const check = (v: Gram<EExtra>): v is EExtra =>
    typeof v === 'string' || Array.isArray(v);
const change = (v: EExtra): Gram<never> => {
    if (typeof v === 'string') {
        if (v.match(/^\$[A-Z]/)) {
            return { type: 'literal-ref', id: v.slice(1) };
        }
        if (v.match(/^[A-Z]/)) {
            return { type: 'ref', id: v };
        }
        return { type: 'literal', value: v };
    }
    return {
        type: 'sequence',
        items: v.map((b) => transform(b, check, change)),
    };
};

// Next step:
// - in addition to generating a tstype, also produce a peggy grammar string
//   and then a js processor

// type Processed = {
//     type: b.TSType;
//     expr: b.Expression;
//     peg: string;
// };

export const generateTypes = (grammar: Grams) => {
    const lines: { name: string; defn: b.TSType }[] = [];
    const tags: { [name: string]: string[] } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'or') {
            lines.push({ name, defn: gramToType(gram) });
            continue;
        }
        if (gram.type === 'tagged') {
            gram.tags.forEach((tag) => {
                if (!tags[tag]) tags[tag] = [];
                tags[tag].push(name);
            });
        }
        let defn = topGramToType(
            gram.type === 'sequence' ? gram.items : gram.inner,
        );
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

export const topGramToType = (
    gram: TopGram<never>['inner'],
): b.TSTypeLiteral => {
    if (Array.isArray(gram)) {
        const res = gramToType({ type: 'sequence', items: gram });
        if (res.type === 'TSTypeLiteral') {
            return res;
        }
        throw new Error(`Not a working sequence`);
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

export const sequenceToType = (grams: Gram<never>[]): b.TSType => {
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
};

export const gramToType = (gram: Gram<never>): b.TSType => {
    switch (gram.type) {
        case 'sequence': {
            return sequenceToType(gram.items);
        }
        case 'literal':
            return b.tsLiteralType(b.stringLiteral(gram.value));
        case 'literal-ref':
            return b.tsStringKeyword();
        case 'ref':
            return b.tsTypeReference(b.identifier(gram.id));
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
