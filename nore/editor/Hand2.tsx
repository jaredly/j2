import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import * as from from '../generated/from-map';
import { parseExpression } from '../generated/parser';
import React, { useEffect, useMemo, useState } from 'react';
import { idx } from '../generated/grammar';
import { Blank, Identifier, Boolean, Number } from './elements/constants';
import { Apply } from './elements/Apply';

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
            <div>{JSON.stringify(store.selection)}</div>
            {JSON.stringify(
                from.Expression(store.map[id].value as t.Expression, store.map),
                null,
                2,
            )}
        </div>
    );
};

export const useStore = (store: Store, key: number) => {
    const [value, setValue] = useState({ item: store.map[key], tick: 0 });
    useEffect(() => {
        const fn = () => {
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

export const sel = { backgroundColor: `rgba(255, 255, 0, 0.2)` };

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
    force?: boolean,
) => {
    if (store.selection?.idx === selection?.idx && !force) {
        notify(store, extraNotify || []);
        return;
    }
    store.onDeselect ? store.onDeselect() : null;
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
