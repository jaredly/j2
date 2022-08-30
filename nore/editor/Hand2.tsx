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
            value: to.Expression(parseExpression('hello(1, 2u)'), store.map),
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
    return value.value;
};

export const Expression = ({ id, store }: { id: number; store: Store }) => {
    const value = useStore(store, id) as t.Expression;
    if (value.type === 'Apply') {
        return <Apply value={value} store={store} />;
    }
    return <VApplyable value={value} store={store} />;
};

export const Apply = ({ value, store }: { value: t.Apply; store: Store }) => {
    return (
        <span>
            <Applyable id={value.target} store={store} />
            {value.suffixes.map((id) => (
                <Suffix key={id} id={id} store={store} />
            ))}
        </span>
    );
};

export const Suffix = ({ id, store }: { id: number; store: Store }) => {
    const value = useStore(store, id) as t.Suffix;
    return <CallSuffix value={value} store={store} />;
};

// OHHH KKKKK I think I need a primitive that's like `SText`
// for `SelectableText` that's like, this is some text that
// the cursor can interact with, it's at [this idx], and [this offset]
// and it's [this long] idk.
// Then it registers itself as a listener? I mean that's like a wholeeee
// bunch of listeners, but maybe it's ok?

export const CallSuffix = ({
    value,
    store,
}: {
    value: t.CallSuffix;
    store: Store;
}) => {
    return (
        <span>
            <span>(</span>
            {value.args.map((id, i) => (
                <React.Fragment key={id}>
                    <Expression key={id} id={id} store={store} />
                    {i !== value.args.length - 1 && <span>, </span>}
                </React.Fragment>
            ))}
            <span>)</span>
        </span>
    );
};

export const Applyable = ({ id, store }: { id: number; store: Store }) => {
    const value = useStore(store, id) as t.Applyable;
    return <VApplyable value={value} store={store} />;
};

export const VApplyable = ({
    value,
    store,
}: {
    value: t.Applyable;
    store: Store;
}) => {
    if (value.type === 'Identifier') {
        return <Identifier value={value} store={store} />;
    }
    if (value.type === 'Boolean') {
        return <Boolean value={value} store={store} />;
    }
    return <Number value={value} store={store} />;
};

export const Identifier = ({
    value,
    store,
}: {
    value: t.Identifier;
    store: Store;
}) => {
    return <span>{value.text}</span>;
};

export const Number = ({ value, store }: { value: t.Number; store: Store }) => {
    return (
        <span>
            {value.num.raw}
            {value.kind ? value.kind.value : ''}
        </span>
    );
};

export const Boolean = ({
    value,
    store,
}: {
    value: t.Boolean;
    store: Store;
}) => {
    return <span>{value.value}</span>;
};
