import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import * as from from '../generated/from-map';
import { parseExpression } from '../generated/parser';
import React, { useEffect, useMemo, useState } from 'react';
import { idx } from '../generated/grammar';
import { AtomEdit } from './AtomEdit';

export const nidx = () => idx.current++;
export const newBlank = (): t.Blank => ({
    type: 'Blank',
    loc: {
        start: 0,
        end: 0,
        idx: nidx(),
    },
});

export type PathItem =
    | {
          type: 'Apply_target';
          pid: number;
      }
    | { type: 'Apply_suffix'; pid: number; suffix: number }
    | {
          type: 'CallSuffix_args';
          arg: number;
          pid: number;
      };

export type EditSelection = {
    type: 'edit';
    idx: number;
    at?: 'start' | 'end' | 'change' | 'inner' | null;
};
export type Selection =
    | EditSelection
    | {
          type: 'select';
          idx: number;
          children: null | [number, number];
      };

export type Store = {
    map: t.Map;
    listeners: { [key: string]: Array<() => void> };
    selection: null | Selection;
    onDeselect: null | (() => void);
};

export const Editor = () => {
    const store = useMemo(() => ({ map: {}, listeners: {} } as Store), []);
    const [ast, setAst] = React.useState(() => {
        return to.add(store.map, {
            type: 'Expression',
            value: to.Expression(
                parseExpression('hello(one(2)(3), 1, 2u)'),
                store.map,
            ),
        });
    });

    return (
        <div style={{ margin: 48, fontSize: 48 }}>
            <Expression id={ast} store={store} path={[]} />
            <div
                style={{
                    marginTop: 48,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                }}
            >
                <Dump store={store} id={ast} />
            </div>
        </div>
    );
};

export const Dump = ({ store, id }: { store: Store; id: number }) => {
    const [tick, setTick] = useState(0);
    console.log('tick');
    useEffect(() => {
        if (!store.listeners['']) {
            store.listeners[''] = [];
        }
        const fn = () => setTick((tick) => tick + 1);
        store.listeners[''].push(fn);
        return () => {
            store.listeners[''] = store.listeners[''].filter((x) => x !== fn);
        };
    }, []);
    return (
        <div>
            {JSON.stringify(
                from.Expression(store.map[id].value as t.Expression, store.map),
                null,
                2,
            )}
        </div>
    );
};

const useStore = (store: Store, key: number) => {
    const [value, setValue] = useState({ item: store.map[key], tick: 0 });
    useEffect(() => {
        const fn = () => {
            // console.log('changed', key);
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

export type Path = PathItem[];

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

const sel = { backgroundColor: `rgba(255, 255, 0, 0.2)` };

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

// OHHH KKKKK I think I need a primitive that's like `SText`
// for `SelectableText` that's like, this is some text that
// the cursor can interact with, it's at [this idx], and [this offset]
// and it's [this long] idk.
// Then it registers itself as a listener? I mean that's like a wholeeee
// bunch of listeners, but maybe it's ok?

export const CallSuffix = ({
    value,
    store,
    path,
}: {
    value: t.CallSuffix;
    store: Store;
    path: Path;
}) => {
    const selected = store.selection?.idx === value.loc.idx;
    const selEnd =
        selected &&
        store.selection?.type === 'edit' &&
        store.selection.at === 'end';
    return (
        <span
            style={
                selected && store.selection?.type === 'select' ? sel : undefined
            }
        >
            <span
                style={{ color: '#777' }}
                onMouseDown={(evt) => {
                    evt.preventDefault();
                    // so, selection ... is probably like the first
                    const box = evt.currentTarget.getBoundingClientRect();
                    const left = evt.clientX < box.left + box.width / 2;
                    if (!left) {
                        setSelection(
                            store,
                            value.args.length
                                ? {
                                      type: 'edit',
                                      idx: value.args[0],
                                      at: 'start',
                                  }
                                : {
                                      type: 'edit',
                                      idx: value.loc.idx,
                                      at: 'inner',
                                  },
                        );
                    } else {
                        const last = path[path.length - 1];
                        const apply = store.map[last.pid].value as t.Apply;
                        const at = apply.suffixes.indexOf(value.loc.idx);
                        setSelection(store, {
                            type: 'edit',
                            idx: at > 0 ? apply.suffixes[at - 1] : apply.target,
                            at: 'end',
                        });
                    }
                }}
            >
                (
            </span>
            {value.args.length === 0 &&
            selected &&
            store.selection?.type === 'edit' &&
            store.selection.at === 'inner' ? (
                <AtomEdit
                    level="Expression"
                    idx={null}
                    store={store}
                    text={''}
                    path={path.concat([
                        {
                            type: 'CallSuffix_args',
                            pid: value.loc.idx,
                            arg: 0,
                        },
                    ])}
                />
            ) : null}
            {value.args.map((id, i) => (
                <React.Fragment key={id + ':' + i}>
                    <Expression
                        key={id + ':' + i}
                        id={id}
                        store={store}
                        path={path.concat([
                            {
                                type: 'CallSuffix_args',
                                arg: i,
                                pid: value.loc.idx,
                            },
                        ])}
                    />
                    {i !== value.args.length - 1 && (
                        <span
                            style={{ color: '#777' }}
                            onMouseDown={(evt) => {
                                evt.preventDefault();
                                const box =
                                    evt.currentTarget.getBoundingClientRect();
                                const left =
                                    evt.clientX < box.left + box.width / 2;
                                if (left) {
                                    setSelection(store, {
                                        type: 'edit',
                                        idx: id,
                                        at: 'end',
                                    });
                                } else {
                                    setSelection(store, {
                                        type: 'edit',
                                        idx: value.args[i + 1],
                                        at: 'start',
                                    });
                                }
                            }}
                        >
                            ,{' '}
                        </span>
                    )}
                </React.Fragment>
            ))}
            <span
                style={{ color: '#777' }}
                onMouseDown={(evt) => {
                    // so, selection ... is probably like the first
                    evt.preventDefault();
                    const box = evt.currentTarget.getBoundingClientRect();
                    const left = evt.clientX < box.left + box.width / 2;
                    if (left) {
                        setSelection(
                            store,
                            value.args.length
                                ? {
                                      type: 'edit',
                                      idx: value.args[value.args.length - 1],
                                      at: 'end',
                                  }
                                : {
                                      type: 'edit',
                                      idx: value.loc.idx,
                                      at: 'inner',
                                  },
                        );
                    } else {
                        setSelection(store, {
                            type: 'edit',
                            idx: value.loc.idx,
                            at: 'end',
                        });
                    }
                }}
            >
                )
            </span>
            {selEnd ? (
                <AtomEdit
                    level="Suffix"
                    idx={null}
                    store={store}
                    text={''}
                    path={path}
                />
            ) : null}
        </span>
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

export const notify = (store: Store, idxs: (number | null | undefined)[]) => {
    idxs.forEach((idx) => {
        if (idx != null) {
            store.listeners[idx]?.forEach((fn) => fn());
        }
    });
    if (store.listeners['']) {
        store.listeners[''].forEach((fn) => fn());
    }
};

export const setSelection = (
    store: Store,
    selection: null | Selection,
    extraNotify?: number[],
) => {
    if (store.selection?.idx === selection?.idx) {
        notify(store, extraNotify || []);
        return;
    }
    store.onDeselect ? store.onDeselect() : null;
    console.log('Set Selection', selection);
    const prev = store.selection?.idx;

    if (selection?.type === 'edit') {
        const v = store.map[selection.idx].value;
        if (v.type === 'Apply') {
            if (selection.at === 'start') {
                selection.idx = v.target;
            } else if (selection.at === 'end') {
                selection.idx = v.suffixes[v.suffixes.length - 1];
            }
        }
    }

    store.selection = selection;
    notify(store, [prev, selection?.idx, ...(extraNotify || [])]);
};

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
