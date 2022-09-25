// React components

import {
    change,
    check,
    EExtra,
    Gram,
    GramDef,
    Grams,
    TGram,
    transformGram,
} from '../grams/types';
// import * as b from '@babel/types';
// import generate from '@babel/generator';

type Path = { name: string; path: null | string };
// type Path = {
//     type: string;
//     path: PathItem[];
// };
// type PathItem =
//     | { type: 'named'; name: string }
//     | { type: 'args'; key: 'item' | 'last'; i: string };

export const prelude = `
import React from 'react';
import {parse} from './grammar';
import * as parsers from './parser';
import * as t from './type-map';
import * as c from './atomConfig';
import * as to from './to-map';
import { updateStore, Store, useStore } from '../editor/store/store';
import {ContentEditable} from './ContentEditable';
import {AtomEdit} from './AtomEdit';

export const Empty = () => {
    return <span style={{height: '1em', color: 'red'}}>i</span>
}

export const Blank = ({idx, store, path}: {idx: number, store: Store, path: Path[]}) => {
    const item = useStore(store, idx) as t.Blank;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Blank} path={path.concat([{type: 'Blank', idx: item.loc.idx, path: null}])} />
}
`;

export const gramPaths = (egram: GramDef<EExtra>) => {
    const gram: TGram<never> = transformGram<never>(egram, check, change);
    const paths: string[] = [];
    if (gram.type === 'sequence') {
        gram.items.forEach((item) => {
            if (item.type === 'named') {
                if (item.inner.type === 'args') {
                    paths.push(` | {at: '${item.name}', arg: number}`);
                } else {
                    paths.push(` | {at: '${item.name}'}`);
                }
            }
        });
    }
    if (gram.type === 'tagged') {
        if (Array.isArray(gram.inner)) {
            gram.inner.forEach((item) => {
                if (item.type === 'named') {
                    if (item.inner.type === 'args') {
                        paths.push(` | {at: '${item.name}', arg: number}`);
                    } else {
                        paths.push(` | {at: '${item.name}'}`);
                    }
                }
            });
        } else if (gram.inner.type === 'suffixes') {
            paths.push(` | {at: 'suffix', suffix: number} | {at: 'target'}`);
        }
    }
    return paths;
};

export const pathType = (grammar: Grams, tags: { [key: string]: string[] }) => {
    return Object.entries(grammar)
        .filter(([_, v]) => Array.isArray(v) || v.type !== 'peggy')
        .map(
            ([k, v]) =>
                `{type: '${k}', idx: number, path: null | {at: 'before' | 'after'} ${gramPaths(
                    v,
                ).join('')}}`, //\n// ${JSON.stringify(v)}`,
        )
        .concat(`{type: 'Blank', idx: number, path: null}`)
        .concat(
            Object.keys(tags).map(
                (tag) => `{type: '${tag}', idx: number, path: null}`,
            ),
        )
        .join('\n| ');
};

export const generateReact = (
    grammar: Grams,
    tags: { [key: string]: string[] },
) => {
    const reacts = generateReactComponents(grammar, tags);

    return `
${prelude}

export type Path = ${pathType(grammar, tags)};

${Object.keys(reacts)
    .map((name) => reacts[name])
    .join('\n\n')}
`;
};

export const generateReactComponents = (
    grammar: Grams,
    tags: { [key: string]: string[] },
) => {
    const components: { [key: string]: string } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'peggy') {
            continue;
        }
        const value = topGramToReact(name, gram);
        components[
            name
        ] = `export const ${name} = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.${name};
    return ${value};
}`;
    }
    Object.keys(tags).forEach((tag) => {
        components[
            tag
        ] = `export const ${tag} = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    path = path.concat([{type: '${tag}', idx, path: null}]);
    const item = useStore(store, idx) as t.${tag};
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
        return <${child} idx={idx} store={store} path={path} />;
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
                return `<AtomEdit value={${value}} idx={idx} store={store} config={c.${name}} path={path.concat([{type: '${name}', idx, path: null}])} />`;
            }
            if (Array.isArray(gram.inner)) {
                return gramToReact(
                    { type: 'sequence', items: gram.inner },
                    value,
                    { name, path: null },
                );
            }
            if (gram.inner.type === 'suffixes') {
                return `<span>${gramToReact(
                    gram.inner.target,
                    value + '.target',
                    { name, path: `{at: 'target'}` },
                )}{${value}.suffixes.map((suffix, i) => <React.Fragment key={i}>${gramToReact(
                    gram.inner.suffix,
                    'suffix',
                    { name, path: `{at: 'suffix', suffix: i}` },
                )}</React.Fragment>)}</span>`;
            }
            if (gram.inner.type === 'binops') {
                return `<>binops</>`;
            }
            return gramToReact(gram.inner, value, { name, path: null });
        case 'peggy':
            return `<>{${value}}</>`;
        case 'sequence':
            return gramToReact(gram, value, { name, path: null });
    }
};

export const gramToReact = (
    gram: Gram<never>,
    value: string,
    path: { name: string; path: null | string },
    leadingSpace = false,
): string => {
    switch (gram.type) {
        case 'sequence':
            return `<span>
            <Empty />
            ${gram.items
                .map((child, i) => gramToReact(child, value, path, i > 0))
                .join('')}
            <Empty />
            </span>`;
        case 'literal':
            return (
                (leadingSpace ? ' ' : '') +
                gram.value.replace(/>/g, '&gt;').replace(/</g, '&lt;')
            );
        case 'literal-ref':
            return (leadingSpace ? ' ' : '') + `{${value}}`;
        case 'named':
            return gramToReact(
                gram.inner,
                `${value}.${gram.name}`,
                {
                    name: path.name,
                    path: `{at: '${gram.name}'}`,
                },
                leadingSpace,
            );
        case 'ref':
            return (
                (leadingSpace ? ' ' : '') +
                `<${gram.id} idx={${value}} store={store} path={path.concat([{type: '${path.name}', idx, path: ${path.path}}])} />`
            );
        case 'args':
            const [l, r] = gram.bounds ?? ['(', ')'];
            return (
                (leadingSpace ? ' ' : '') +
                `${l}{${value}.map((arg, i) => <React.Fragment key={i}>${gramToReact(
                    gram.item,
                    'arg',
                    { name: path.name, path: `{at: 'args', arg: i}` },
                )}{i < ${value}.length - 1 ? ', ' : ''}</React.Fragment>)}${r}`
            );
        case 'optional':
            return `{${value} ? ${gramToReact(
                gram.item,
                value,
                path,
                leadingSpace,
            )} : null}`;
        case 'inferrable':
            return `{${value} ? ${gramToReact(
                gram.item,
                value + '.value',
                path,
                leadingSpace,
            )} : null}`;
        default:
            return (leadingSpace ? ' ' : '') + `<>what ${gram.type}</>`;
    }
};
