// Handwritten structured editor, round 2: now with maps
import { useEffect, useState } from 'react';
import { idx } from '../../generated/grammar';
import * as t from '../../generated/type-map';
import { emptyStore } from '../Editor';
import * as to from '../../generated/to-map';
import { parseExpression } from '../../generated/parser';

/*
// So parentage types ... are like the inverse of the tree??
type PCallSuffix = {
    type: 'CallSuffix';
    parent: PApply | null;
    suffix: number | null;
    idx: number | null;
};
type PApply = { type: 'apply'; parent: PExpression | null; idx: number | null };
type PApplyTarget = {
    type: 'ApplyTarget';
    parent: PApply | null;
    idx: number | null;
};
type PCallArg = {
    type: 'CallArg';
    parent: PCallSuffix | null;
    arg: number | null;
    idx: number | null;
};
type PExpression = PApplyTarget | PCallArg;
*/

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

export type Path = PathItem[];

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

export type History = {
    items: HistoryItem[];
    idx: number;
};

export type HistoryItem = {
    pre: t.Map;
    post: t.Map;
    preSelection: Selection | null;
    postSelection: Selection | null | undefined;
};

export type StoreUpdate = {
    map: t.Map;
    selection?: Selection | null;
};

export const newStore = (text: string) => {
    const store = emptyStore();

    const root = to.add(store.map, {
        type: 'Expression',
        value: to.Expression(parseExpression(text), store.map),
    });
    return { store, root };
};

export const updateStore = (
    store: Store,
    { map: change, selection }: StoreUpdate,
) => {
    const pre: t.Map = {};
    Object.keys(change).forEach((item) => {
        pre[+item] = store.map[+item];
    });
    const history: HistoryItem = {
        pre,
        post: change,
        preSelection: store.selection,
        postSelection: selection,
    };
    if (store.history.idx > 0) {
        store.history.items = store.history.items.slice(0, store.history.idx);
    }
    store.history.items.push(history);
    store.history.idx = 0;
    Object.assign(store.map, change);
    if (selection !== undefined) {
        setSelection(store, selection);
    }
};

export type Store = {
    map: t.Map;
    history: History;
    listeners: { [key: string]: Array<() => void> };
    selection: null | Selection;
    onDeselect: null | (() => void);
    drag: null | {
        start: { x: number; y: number; idx: number };
        end: { x: number; y: number; idx: number };
    };
    nodes: { [key: number]: { node: HTMLElement; path: Path } };
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

const kidsEqual = (
    one: null | [number, number],
    two: null | [number, number],
) => {
    if (!one || !two) {
        return one === two;
    }
    return one[0] === two[0] && one[1] === two[1];
};

export const setSelection = (
    store: Store,
    selection: null | Selection,
    extraNotify?: number[],
    force?: boolean,
) => {
    if (
        store.selection?.idx === selection?.idx &&
        !force &&
        selection?.type === store.selection?.type &&
        !(
            selection?.type === 'select' &&
            store.selection?.type === 'select' &&
            !kidsEqual(store.selection?.children, selection?.children)
        )
    ) {
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

// get for changing (having already done the shallow clones)
export const getc = (store: Store, idx: number) => {
    store.map[idx] = { ...store.map[idx] };
    return (store.map[idx].value = { ...store.map[idx].value });
};

export const addBlank = (store: Store) => {
    const blank = newBlank();
    store.map[blank.loc.idx] = {
        type: 'Expression',
        value: blank,
    };
    return blank.loc.idx;
};

export const nidx = () => idx.current++;
export const newBlank = (): t.Blank => ({
    type: 'Blank',
    loc: {
        start: 0,
        end: 0,
        idx: nidx(),
    },
});
