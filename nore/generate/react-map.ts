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

type Path = {
    type: string;
    path: PathItem[];
};
type PathItem =
    | { type: 'named'; name: string }
    | { type: 'args'; key: 'item' | 'last'; i: string };

export const prelude = `
import React from 'react';
import {parse} from './grammar';
import * as t from './type-map';
import * as c from './atomConfig';
import { Store } from '../editor/store/store';

export type Path = any;

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
}

export const AtomEdit = <T,>({value, config, store, path}: {value: T, store: Store, config: AtomConfig<T>, path: Path}) => {
    const [edit, setEdit] = React.useState(() => config.toString(value));
    return <input value={edit} onChange={evt => setEdit(evt.target.value)} />
}

export const Blank = ({item, store, path}: {item: t.Blank, store: Store, path: Path}) => {
    return <AtomEdit value={item} store={store} config={c.Blank} path={path.concat([{type: 'Blank', idx: item.loc.idx}])} />
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
        if (gram.type === 'peggy') {
            continue;
        }
        const value = topGramToReact(name, gram);
        components[
            name
        ] = `export const ${name} = ({item, store, path}: {item: t.${name}, store: Store, path: Path}): JSX.Element => {
    return ${value};
}`;
    }
    Object.keys(tagDeps).forEach((tag) => {
        tags[tag].push(...tagDeps[tag]);
    });
    Object.keys(tags).forEach((tag) => {
        components[
            tag
        ] = `export const ${tag} = ({item, store, path}: {item: t.${tag}, store: Store, path: Path}): JSX.Element => {
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
        return <${child} item={item} store={store} path={path} />;
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
            if (gram.tags.includes('Atom')) {
                return `<AtomEdit value={${value}} store={store} config={c.${name}} path={path.concat([{type: '${name}', path: []}])} />`;
            }
            if (Array.isArray(gram.inner)) {
                return gramToReact(
                    { type: 'sequence', items: gram.inner },
                    value,
                    { type: name, path: [] },
                );
            }
            if (gram.inner.type === 'suffixes') {
                return `<span>${gramToReact(
                    gram.inner.target,
                    value + '.target',
                    { type: name, path: [{ type: 'named', name: 'target' }] },
                )}{${value}.suffixes.map((suffix, i) => ${gramToReact(
                    gram.inner.suffix,
                    'suffix',
                    {
                        type: name,
                        path: [
                            { type: 'named', name: 'suffix' },
                            { type: 'args', i: 'i', key: 'item' },
                        ],
                    },
                )})}</span>`;
            }
            if (gram.inner.type === 'binops') {
                return `<>binops</>`;
            }
            return gramToReact(gram.inner, value, { type: name, path: [] });
        case 'peggy':
            return `<>{${value}}</>`;
        case 'sequence':
            return gramToReact(gram, value, { type: name, path: [] });
    }
};

export const gramToReact = (
    gram: Gram<never>,
    value: string,
    path: Path,
): string => {
    switch (gram.type) {
        case 'sequence':
            return `<span>${gram.items
                .map((child, i) => gramToReact(child, value, path))
                .join('')}</span>`;
        case 'literal':
            return gram.value.replace(/>/g, '&gt;').replace(/</g, '&lt;');
        case 'literal-ref':
            return `{${value}}`;
        case 'named':
            return gramToReact(gram.inner, `${value}.${gram.name}`, {
                ...path,
                path: path.path.concat([{ type: 'named', name: gram.name }]),
            });
        case 'ref':
            return `<${gram.id} item={store.map[${value}].value as t.${
                gram.id
            }} store={store} path={path.concat([${JSON.stringify(path)}])} />`;
        case 'args':
            const [l, r] = gram.bounds ?? ['(', ')'];
            return `${l}{${value}.map((arg, i) => ${gramToReact(
                gram.item,
                'arg',
                {
                    ...path,
                    path: path.path.concat([
                        { type: 'args', key: 'item', i: 'i' },
                    ]),
                },
            )})}${r}`;
        case 'optional':
            return `{${value} ? ${gramToReact(gram.item, value, path)} : null}`;
        default:
            return `<>what ${gram.type}</>`;
    }
};
