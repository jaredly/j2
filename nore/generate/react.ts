// React components

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
// import * as b from '@babel/types';
// import generate from '@babel/generator';

type PathItem =
    | { type: 'sequence'; key: number }
    | { type: 'args'; key: 'item' | 'last' };

export const prelude = `
import React from 'react';
import {parse} from './grammar';
import * as t from './types';
import * as c from './atomConfig';

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
}

export const AtomEdit = <T,>({value, config}: {value: T, config: AtomConfig<T>}) => {
    const [edit, setEdit] = React.useState(() => config.toString(value));
    return <input value={edit} onChange={evt => setEdit(evt.target.value)} />
}
`;

export const generateReact = (grammar: Grams) => {
    // const { lines, tags } = assembleTypes(grammar, tagDeps, options);
    // return typesToScript(lines, tags, grammar, options);
    const components: { [key: string]: string } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        components[name] = topGramToReact(name, gram);
    }
    return components;
};

export const topGramToReact = (name: string, gram: TGram<never>): string => {
    const value = 'item';
    switch (gram.type) {
        case 'or':
            return 'orrr';
        case 'derived':
            return gramToReact(gram.inner, value + '.raw', []);
        case 'peggy':
            // return `<AtomEdit value={${value}}/>`;
            return `<>{${value}}</>`;
        case 'sequence':
            return gramToReact(gram, value, []);
        case 'tagged':
            if (gram.tags.includes('Atom')) {
                return `<AtomEdit value={${value}} config={c.${name}}/>`;
            }
            if (Array.isArray(gram.inner)) {
                return gramToReact(
                    {
                        type: 'sequence',
                        items: gram.inner,
                    },
                    value,
                    [],
                );
            } else {
                switch (gram.inner.type) {
                    case 'binops':
                        return 'binops';
                    case 'args':
                        return 'args';
                    case 'suffixes':
                        return `<span>${gramToReact(
                            gram.inner.target,
                            value + '.target',
                            [],
                        )}{${
                            value + '.suffixes'
                        }.map((item, key) => ${gramToReact(
                            gram.inner.suffix,
                            'item',
                            [],
                        )})}</span>`;
                }
            }
    }
};

export const gramToReact = (
    gram: Gram<never>,
    value: string,
    path: PathItem[],
): string => {
    switch (gram.type) {
        case 'sequence':
            return `<span>${gram.items
                .map((child, i) => gramToReact(child, value, path))
                .join('')}</span>`;
        case 'literal':
            return gram.value;
        case 'literal-ref':
        case 'ref':
            return `<${gram.id} item={${value}} />`;
        case 'args':
            return `${
                gram.bounds ? gram.bounds[0] : '('
            }{${value}.map(child => ${gramToReact(
                gram.item,
                'child',
                path.concat([{ type: 'args', key: 'item' }]),
            )})}${gram.bounds ? gram.bounds[1] : ')'}`;
        case 'named':
            return gramToReact(gram.inner, `${value}.${gram.name}`, path);
        case 'derived':
            return gramToReact(gram.inner, `${value}.raw`, path);
        case 'optional':
        case 'inferrable':
            return `{${value} ? <span>${gramToReact(
                gram.item,
                value,
                path,
            )}</span> : null}`;
        case 'or':
            return `{${value}}`;
        default:
            return `unknown type ${gram.type}`;
    }
};
