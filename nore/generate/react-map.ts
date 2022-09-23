// React components

import {
    change,
    check,
    Gram,
    Grams,
    TGram,
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
import * as t from './type-map';
import * as c from './atomConfig';

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
}

export const AtomEdit = <T,>({value, config, map}: {value: T, config: AtomConfig<T>, map: t.Map}) => {
    const [edit, setEdit] = React.useState(() => config.toString(value));
    return <input value={edit} onChange={evt => setEdit(evt.target.value)} />
}

export const Blank = ({item, map}: {item: t.Blank, map: t.Map}) => {
    return <>Blank</>
}
`;

export const generateReact = (
    grammar: Grams,
    tagDeps: { [name: string]: string[] },
) => {
    const tags: { [name: string]: string[] } = {};
    const components: { [key: string]: string } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'tagged') {
            gram.tags.forEach((tag) => {
                if (!tags[tag]) {
                    tags[tag] = [];
                }
                tags[tag].push(name);
            });
        }
        const value = topGramToReact(name, gram);
        components[
            name
        ] = `export const ${name} = ({item, map}: {item: t.${name}, map: t.Map}): JSX.Element => {
    return ${value};
}`;
    }
    Object.keys(tagDeps).forEach((tag) => {
        tags[tag].push(...tagDeps[tag]);
    });
    Object.keys(tags).forEach((tag) => {
        components[
            tag
        ] = `export const ${tag} = ({item, map}: {item: t.${tag}, map: t.Map}): JSX.Element => {
${tags[tag]
    .concat(['Blank'])
    .map(
        (child) =>
            `    if (${
                tags[child]
                    ? tags[child]
                          .map((inner) => `item.type === "${inner}"`)
                          .join(' || ')
                    : `item.type === "${child}"`
            }) {
        return <${child} item={item} map={map} />;
    }`,
    )
    .join('\n\n')}

    throw new Error('Unexpected type ' + (item as any).type)
}`;
    });
    return components;
};

export const topGramToReact = (name: string, gram: TGram<never>): string => {
    const value = 'item';
    switch (gram.type) {
        case 'or':
            return 'orrr';
        case 'derived':
            return `<>{${value}.raw}</>`;
        case 'tagged':
            return gram.tags.includes('Atom')
                ? `<AtomEdit value={${value}} map={map} config={c.${name}} />`
                : `<>tagged</>`;
        case 'peggy':
            return `<>{${value}}</>`;
        case 'sequence':
            return gramToReact(gram, value, []);
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
        case 'named':
            return `{${value}.${gram.name}}`;
        default:
            return `<>${gram.type}</>`;
    }
};
