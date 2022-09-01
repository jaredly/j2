import * as t from '../../generated/type-map';
import React from 'react';
import { AtomEdit } from './AtomEdit';
import { Blank } from './constants';
import { CallSuffix } from './CallSuffix';
import { Store, Path, sel, useStore } from '../Hand2';
import { Applyable } from './aggregates';

const orderKids = (
    children: [number, number],
    target: number,
    args: number[],
): [number, number] => {
    const one = target === children[0] ? -1 : args.indexOf(children[0]);
    const two = target === children[1] ? -1 : args.indexOf(children[1]);
    return [Math.min(one, two), Math.max(one, two)];
};

const isSelected = (kids: null | [number, number], idx: number): boolean => {
    return kids != null && kids[0] <= idx && kids[1] >= idx;
};

export const Apply = ({
    value,
    store,
    path,
}: {
    value: t.Apply;
    store: Store;
    path: Path;
}) => {
    const selected = store.selection?.idx === value.loc.idx;
    const selEnd =
        selected &&
        store.selection?.type === 'edit' &&
        store.selection.at === 'end';
    const selKids =
        selected &&
        store.selection?.type === 'select' &&
        store.selection.children
            ? orderKids(store.selection.children, value.target, value.suffixes)
            : null;
    return (
        <span
            style={
                selected &&
                !selEnd &&
                store.selection?.type === 'select' &&
                store.selection.children == null
                    ? sel
                    : undefined
            }
        >
            <span style={isSelected(selKids, -1) ? sel : undefined}>
                <Applyable
                    id={value.target}
                    store={store}
                    path={path.concat([
                        {
                            type: 'Apply_target',
                            pid: value.loc.idx,
                        },
                    ])}
                />
            </span>
            {value.suffixes.map((id, i) => (
                <span key={id} style={isSelected(selKids, i) ? sel : undefined}>
                    <Suffix
                        id={id}
                        store={store}
                        path={path.concat([
                            {
                                type: 'Apply_suffix',
                                suffix: i,
                                pid: value.loc.idx,
                            },
                        ])}
                    />
                </span>
            ))}
            {selEnd ? (
                <AtomEdit
                    level="Suffix"
                    idx={null}
                    store={store}
                    text={''}
                    path={path.concat([
                        {
                            type: 'Apply_suffix',
                            pid: value.loc.idx,
                            suffix: value.suffixes.length,
                        },
                    ])}
                />
            ) : null}
        </span>
    );
};

export const Suffix = ({
    id,
    store,
    path,
}: {
    id: number;
    store: Store;
    path: Path;
}) => {
    const value = useStore(store, id) as t.Suffix;
    if (value.type === 'Blank') {
        return <Blank idx={id} store={store} level="Suffix" path={path} />;
    }
    return <CallSuffix value={value} store={store} path={path} />;
};
