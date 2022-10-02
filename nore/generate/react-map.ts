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
import { updateStore, Store, Selection, useStore } from '../editor/store/store';
import {ContentEditable} from './ContentEditable';
import {AtomEdit} from './AtomEdit';
import {ClickSide, Empty} from './ClickSide';

const selectionStyle = (selection: null | Selection, path: Path[], idx: number) => {
    if (selection?.idx === idx) {
        return {
            outline: '1px solid magenta',
        }
    }
    return {}
}

export const Blank = ({idx, store, path}: {idx: number, store: Store, path: Path[]}) => {
    const item = useStore(store, idx) as t.Blank;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Blank} path={path} />
}
`;

export const pathType = (grammar: Grams, tags: { [key: string]: string[] }) => {
    return `{cid: number, idx: number, punct: number}`;
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
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.${name};
    return ${value};
}`;
    }
    Object.keys(tags).forEach((tag) => {
        components[
            tag
        ] = `export const ${tag} = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
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
                return `<AtomEdit value={${value}} idx={idx} store={store} config={c.${name}} path={path.concat({cid: -1, idx, punct})} />`;
            }
            if (Array.isArray(gram.inner)) {
                return gramToReact(
                    { type: 'sequence', items: gram.inner },
                    value,
                    { name, path: null },
                );
            }
            if (gram.inner.type === 'suffixes') {
                return `<span style={selectionStyle(store.selection, path, idx)}>${gramToReact(
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
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            ${gram.items
                .map((child, i) => gramToReact(child, value, path, i > 0))
                .join('')}
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span>`;
        case 'literal':
            return `<ClickSide path={path.concat([{cid, idx, punct: punct += ${
                gram.value.length
            }}])}>${
                (leadingSpace ? ' ' : '') +
                gram.value.replace(/>/g, '&gt;').replace(/</g, '&lt;')
            }</ClickSide>`;
        case 'literal-ref':
            return (leadingSpace ? ' ' : '') + `{${value}}`;
        case 'named':
            return gramToReact(
                gram.inner,
                `${value}.${gram.name}`,
                {
                    name: path.name,
                    path: `{cid: cid++, idx, punct}`,
                },
                leadingSpace,
            );
        case 'ref':
            return (
                (leadingSpace
                    ? '<ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide>'
                    : '') +
                `<${gram.id} idx={${value}} store={store} path={path.concat([{cid: cid++, idx, punct}])} />`
            );
        case 'args':
            const [l, r] = gram.bounds ?? ['(', ')'];
            return `<ClickSide path={path.concat([{cid, idx, punct: punct += ${
                (leadingSpace ? 1 : 0) + l.length
            }}])}>${
                (leadingSpace ? ' ' : '') + l
            }</ClickSide>{${value}.length ? ${value}.map((arg, i) => <React.Fragment key={i}>${gramToReact(
                gram.item,
                'arg',
                { name: path.name, path: `{cid: cid++, idx, punct}` },
            )}{i < ${value}.length - 1 ? <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>, </ClickSide> : ''}</React.Fragment>) : <Empty path={path.concat([{cid: cid++, idx, punct}])} />}<ClickSide path={path.concat([{cid, idx, punct: punct += ${
                r.length
            }}])}>${r}</ClickSide>`;
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
