// Handwritten structured editor, round 2: now with maps
import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import * as from from '../../generated/from-map';
import { parseExpression } from '../../generated/parser';
import { idx } from '../../generated/grammar';
import { Expression } from '../elements/aggregates';
import { useEffect, useState } from 'react';

export type History = {
    items: HistoryItem[];
    idx: number;
};

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

export type HistoryItem = {
    pre: t.Map;
    post: t.Map;
    preSelection: Selection;
    postSelection: Selection;
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
