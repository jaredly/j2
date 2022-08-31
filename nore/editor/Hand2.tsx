import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseSuffix,
} from '../generated/parser';
import React, { useEffect, useMemo, useState } from 'react';

export type Selection =
    | {
          type: 'edit';
          idx: number;
          at?: 'start' | 'end' | 'change' | null;
      }
    | {
          type: 'select';
          idx: number;
          children: null | [number, number];
      };

export type Store = {
    map: t.Map;
    listeners: { [key: string]: Array<() => void> };
    selection: null | Selection;
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
    const [value, setValue] = useState({ item: store.map[key], tick: 0 });
    useEffect(() => {
        const fn = () => {
            console.log('changed', key);
            setValue((v) => ({ item: store.map[key], tick: v.tick + 1 }));
        };
        store.listeners[key] = store.listeners[key] || [];
        store.listeners[key].push(fn);
        return () => {
            store.listeners[key] = store.listeners[key].filter((x) => x !== fn);
        };
    }, []);
    return value.item.value;
};

export const Expression = ({ id, store }: { id: number; store: Store }) => {
    const value = useStore(store, id) as t.Expression;
    if (value.type === 'Apply') {
        return <Apply value={value} store={store} />;
    }
    return <VApplyable level="Expression" value={value} store={store} />;
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
    if (value.type === 'Blank') {
        return <Blank idx={id} store={store} level="Suffix" />;
    }
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
    return <VApplyable value={value} store={store} level="Applyable" />;
};

export const VApplyable = ({
    value,
    store,
    level,
}: {
    value: t.Applyable;
    store: Store;
    level: 'Expression' | 'Applyable';
}) => {
    if (value.type === 'Identifier') {
        return <Identifier level={level} value={value} store={store} />;
    }
    if (value.type === 'Boolean') {
        return <Boolean level={level} value={value} store={store} />;
    }
    if (value.type === 'Blank') {
        return <Blank idx={value.loc.idx} store={store} level={level} />;
    }
    return <Number level={level} value={value} store={store} />;
};

const notify = (store: Store, idxs: (number | null | undefined)[]) => {
    console.log('notify', idxs);
    idxs.forEach((idx) => {
        if (idx != null) {
            store.listeners[idx]?.forEach((fn) => fn());
        }
    });
};

const setSelection = (store: Store, selection: null | Selection) => {
    const prev = store.selection?.idx;
    store.selection = selection;
    notify(store, [prev, selection?.idx]);
};

export const AtomEdit = ({
    text,
    store,
    level,
    idx,
}: {
    text: string;
    store: Store;
    level: 'Expression' | 'Applyable' | 'Suffix';
    idx: number;
}) => {
    const selection = store.selection?.idx === idx ? store.selection : null;
    if (selection?.type === 'edit') {
        return (
            <span
                contentEditable
                ref={(node) => {
                    if (!node) return;
                    node.textContent = text;
                    node.focus();
                }}
                onBlur={(evt) => {
                    const changed = evt.currentTarget.textContent;
                    if (changed && changed !== text) {
                        if (level === 'Suffix') {
                            const nw = to.Suffix(
                                parseSuffix(changed),
                                store.map,
                            );
                            nw.loc.idx = idx;
                            store.map[idx] = {
                                type: 'Suffix',
                                value: nw,
                            };
                        }
                        if (level === 'Expression') {
                            const nw = to.Expression(
                                parseExpression(changed),
                                store.map,
                            );
                            nw.loc.idx = idx;
                            store.map[idx] = {
                                type: 'Expression',
                                value: nw,
                            };
                        }
                        if (level === 'Applyable') {
                            const nw = to.Applyable(
                                parseApplyable(changed),
                                store.map,
                            );
                            nw.loc.idx = idx;
                            store.map[idx] = {
                                type: 'Applyable',
                                value: nw,
                            };
                        }
                        console.log('diff', changed);
                    }
                    setSelection(store, null);
                }}
            />
        );
    }
    return (
        <span
            onMouseDown={() => setSelection(store, { type: 'edit', idx: idx })}
        >
            {text}
        </span>
    );
};

export const Blank = ({
    idx,
    store,
    level,
}: {
    idx: number;
    store: Store;
    level: 'Expression' | 'Applyable' | 'Suffix';
}) => {
    return <AtomEdit text={''} idx={idx} store={store} level={level} />;
};

export const Identifier = ({
    value,
    store,
    level,
}: {
    value: t.Identifier;
    store: Store;
    level: 'Expression' | 'Applyable';
}) => {
    return (
        <AtomEdit
            text={value.text}
            idx={value.loc.idx}
            store={store}
            level={level}
        />
    );
};

export const Number = ({
    value,
    store,
    level,
}: {
    value: t.Number;
    store: Store;
    level: 'Expression' | 'Applyable';
}) => {
    return (
        <AtomEdit
            text={value.num.raw + (value.kind ? value.kind.value : '')}
            idx={value.loc.idx}
            store={store}
            level={level}
        />
    );
};

export const Boolean = ({
    value,
    store,
    level,
}: {
    value: t.Boolean;
    store: Store;
    level: 'Expression' | 'Applyable';
}) => {
    return (
        <AtomEdit
            text={value.value}
            idx={value.loc.idx}
            store={store}
            level={level}
        />
    );
};