import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseIdentifier,
    parseNumber,
} from '../generated/parser';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Store = {
    map: t.Map;
    listeners: { [key: string]: Array<() => void> };
};

export const Editor = () => {
    const store = useMemo(() => ({ map: {}, listeners: {} } as Store), []);
    const [ast, setAst] = React.useState(() => {
        return to.add(store.map, {
            type: 'Expression',
            value: to.Expression(
                parseExpression('hello#[h23](1, 2u)'),
                store.map,
            ),
        });
    });

    return (
        <div style={{ margin: 48, fontSize: 48 }}>
            <Expression id={ast} store={store} />
            <div
                style={{
                    marginTop: 48,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {JSON.stringify(store.map[ast], null, 2)}
            </div>
        </div>
    );
};

const useStore = (store: Store, key: number) => {
    const [value, setValue] = useState(store.map[key]);
    useEffect(() => {
        const fn = () => setValue(store.map[key]);
        store.listeners[key] = store.listeners[key] || [];
        store.listeners[key].push(fn);
        return () => {
            store.listeners[key] = store.listeners[key].filter((x) => x !== fn);
        };
    }, []);
    return value;
};

export const Expression = ({ id, store }: { id: number; store: Store }) => {
    const { value } = useStore(store, id) as t.MapExpression;
    if (value.type === 'Apply') {
        return <Apply value={value} store={store} />;
    }
    return <Applyable value={value} store={store} />;
};

export const Apply = ({ value, store }: { value: t.Apply; store: Store }) => {
    return <div>Applu</div>;
};

export const Applyable = ({
    value,
    store,
}: {
    value: t.Applyable;
    store: Store;
}) => {
    return <div>Applyable</div>;
};
