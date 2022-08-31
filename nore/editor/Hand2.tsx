import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseSuffix,
} from '../generated/parser';
import React, { useEffect, useMemo, useState } from 'react';
import { idx } from '../generated/grammar';

const nidx = () => idx.current++;
export const newBlank = (): t.Blank => ({
    type: 'Blank',
    loc: {
        start: 0,
        end: 0,
        idx: nidx(),
    },
});

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
            value: to.Expression(
                parseExpression('hello(one(2), 1, 2u)'),
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

const sel = { backgroundColor: `rgba(255, 255, 0, 0.2)` };

export const Apply = ({ value, store }: { value: t.Apply; store: Store }) => {
    const selected = store.selection?.idx === value.loc.idx;
    return (
        <span style={selected ? sel : undefined}>
            <Applyable id={value.target} store={store} />
            {value.suffixes.map((id) => (
                <Suffix key={id} id={id} store={store} />
            ))}
            {selected &&
            store.selection?.type === 'edit' &&
            store.selection.at === 'end' ? (
                <AtomEdit level="Suffix" idx={null} store={store} text={''} />
            ) : null}
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
            <span
                onMouseDown={(evt) => {
                    // so, selection ... is probably like the first
                    if (value.args.length) {
                        evt.preventDefault();
                        setSelection(store, {
                            type: 'edit',
                            idx: value.args[0],
                        });
                    }
                }}
            >
                (
            </span>
            {value.args.map((id, i) => (
                <React.Fragment key={id}>
                    <Expression key={id} id={id} store={store} />
                    {i !== value.args.length - 1 && (
                        <span
                            onMouseDown={(evt) => {
                                evt.preventDefault();
                                setSelection(store, {
                                    type: 'edit',
                                    idx: id,
                                    at: 'end',
                                });
                            }}
                        >
                            ,{' '}
                        </span>
                    )}
                </React.Fragment>
            ))}
            <span
                onMouseDown={(evt) => {
                    // so, selection ... is probably like the first
                    if (value.args.length) {
                        evt.preventDefault();
                        setSelection(store, {
                            type: 'edit',
                            idx: value.args[value.args.length - 1],
                            at: 'end',
                        });
                    }
                }}
            >
                )
            </span>
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
    onRemove,
}: {
    text: string;
    store: Store;
    level: 'Expression' | 'Applyable' | 'Suffix';
    idx: number | null;
    onRemove?: () => void;
}) => {
    const selection =
        idx === null
            ? { type: 'edit', idx: 0, at: 'change' }
            : store.selection?.idx === idx
            ? store.selection
            : null;
    if (selection?.type === 'edit') {
        return (
            <span
                contentEditable
                style={{
                    outline: 'none',
                    backgroundColor: `rgba(255,0,255,0.1)`,
                }}
                ref={(node) => {
                    if (!node) return;
                    node.textContent = text;
                    node.focus();
                    if (selection.at === 'end') {
                        const sel = document.getSelection();
                        const r = sel?.getRangeAt(0)!;
                        r.selectNodeContents(node);
                        r.collapse(false);
                    }
                    if (selection.at === 'change') {
                        document
                            .getSelection()
                            ?.getRangeAt(0)
                            .selectNodeContents(node);
                    }
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Escape') {
                        evt.preventDefault();
                        evt.currentTarget.blur();
                        return;
                    }
                    if (evt.key === 'Backspace' && onRemove) {
                        if (evt.currentTarget.textContent === '') {
                            evt.preventDefault();
                            onRemove();
                        }
                    }
                    if (idx == null) {
                        return;
                    }
                    if (evt.key === '(' && level === 'Expression') {
                        const sel = document.getSelection();
                        if (sel?.getRangeAt(0).toString() !== '') {
                            return;
                        }
                        const prev = store.map[idx].value;
                        prev.loc.idx = nidx();
                        evt.preventDefault();
                        const blank = newBlank();
                        const nw: t.Apply = {
                            type: 'Apply',
                            target: prev.loc.idx,
                            suffixes: [
                                to.add(store.map, {
                                    type: 'Suffix',
                                    value: {
                                        type: 'CallSuffix',
                                        args: [
                                            to.add(store.map, {
                                                type: 'Expression',
                                                value: blank,
                                            }),
                                        ],
                                        loc: {
                                            idx: nidx(),
                                            start: 0,
                                            end: 0,
                                        },
                                    },
                                }),
                            ],
                            loc: {
                                idx: idx,
                                start: 0,
                                end: 0,
                            },
                        };
                        if (level === 'Expression') {
                            store.map[prev.loc.idx] = {
                                type: 'Expression',
                                value: prev as t.Expression,
                            };
                            store.map[idx] = {
                                type: level,
                                value: nw,
                            };
                            setSelection(store, {
                                type: 'edit',
                                idx: blank.loc.idx,
                            });
                        }
                        // TODO check if selection is at the end, and such
                        console.log('paren');
                    }
                }}
                onBlur={(evt) => {
                    const changed = evt.currentTarget.textContent;
                    if (changed != null && changed.trim().length === 0) {
                        if (idx == null) {
                            setSelection(store, null);
                            return;
                        }
                        const nw = newBlank();
                        nw.loc.idx = idx;
                        store.map[idx].value = nw;
                        setSelection(store, null);
                        return;
                    }
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
