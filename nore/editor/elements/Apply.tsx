import * as t from '../../generated/type-map';
import React from 'react';
import { AtomEdit } from './AtomEdit';
import { Blank } from './constants';
import { CallSuffix } from './CallSuffix';
import { Store, Path, sel, useStore } from '../Hand2';
import { Applyable } from './aggregates';

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
    return (
        <span style={selected && !selEnd ? sel : undefined}>
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
            {value.suffixes.map((id, i) => (
                <Suffix
                    key={id}
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
