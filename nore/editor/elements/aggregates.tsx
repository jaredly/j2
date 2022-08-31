import * as t from '../../generated/type-map';
import React from 'react';
import { Blank, Identifier, Boolean, Number } from './constants';
import { Apply } from './Apply';
import { Store, Path, useStore } from '../Hand2';

let aggregates = 1;
export const Expression = ({
    id,
    store,
    path,
}: {
    id: number;
    store: Store;
    path: Path;
}) => {
    const value = useStore(store, id) as t.Expression;
    if (value.type === 'Apply') {
        return <Apply value={value} store={store} path={path} />;
    }
    return (
        <VApplyable
            level="Expression"
            value={value}
            store={store}
            path={path}
        />
    );
};

export const Applyable = ({
    id,
    store,
    path,
}: {
    id: number;
    store: Store;
    path: Path;
}) => {
    const value = useStore(store, id) as t.Applyable;
    return (
        <VApplyable value={value} store={store} path={path} level="Applyable" />
    );
};

export const VApplyable = ({
    value,
    store,
    level,
    path,
}: {
    value: t.Applyable;
    store: Store;
    level: 'Expression' | 'Applyable';
    path: Path;
}) => {
    if (value.type === 'Identifier') {
        return (
            <Identifier level={level} value={value} store={store} path={path} />
        );
    }
    if (value.type === 'Boolean') {
        return (
            <Boolean level={level} value={value} store={store} path={path} />
        );
    }
    if (value.type === 'Blank') {
        return (
            <Blank
                idx={value.loc.idx}
                store={store}
                level={level}
                path={path}
            />
        );
    }
    return <Number level={level} value={value} store={store} path={path} />;
};
