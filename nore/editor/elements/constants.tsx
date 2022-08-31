import * as t from '../../generated/type-map';
import React from 'react';
import { AtomEdit } from './AtomEdit';
import { Store, Path } from '../Hand2';

export const Blank = ({
    idx,
    store,
    level,
    path,
}: {
    idx: number;
    store: Store;
    level: 'Expression' | 'Applyable' | 'Suffix';
    path: Path;
}) => {
    return (
        <AtomEdit text={''} idx={idx} store={store} level={level} path={path} />
    );
};

export const Identifier = ({
    value,
    store,
    level,
    path,
}: {
    value: t.Identifier;
    store: Store;
    level: 'Expression' | 'Applyable';
    path: Path;
}) => {
    return (
        <AtomEdit
            style={{ color: 'rgb(0 174 123)' }}
            text={value.text}
            idx={value.loc.idx}
            store={store}
            level={level}
            path={path}
        />
    );
};

export const Number = ({
    value,
    store,
    level,
    path,
}: {
    value: t.Number;
    store: Store;
    level: 'Expression' | 'Applyable';
    path: Path;
}) => {
    return (
        <AtomEdit
            style={{ color: '#5af' }}
            text={value.num.raw + (value.kind ? value.kind.value : '')}
            idx={value.loc.idx}
            store={store}
            level={level}
            path={path}
        />
    );
};

export const Boolean = ({
    value,
    store,
    level,
    path,
}: {
    value: t.Boolean;
    store: Store;
    level: 'Expression' | 'Applyable';
    path: Path;
}) => {
    return (
        <AtomEdit
            text={value.value}
            idx={value.loc.idx}
            store={store}
            level={level}
            path={path}
        />
    );
};
