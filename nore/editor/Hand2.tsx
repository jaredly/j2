// Handwritten structured editor, round 2: now with maps
import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import * as from from '../generated/from-map';
import { parseExpression } from '../generated/parser';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { idx } from '../generated/grammar';
import { Expression } from './elements/aggregates';

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

export type History = {
    items: HistoryItem[];
    idx: number;
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

const hitBox = (boxes: Box[], x: number, y: number) => {
    return boxes.find((box) => inBox(x, y, box));
};

const between = (x: number, a: number, b: number) => x >= a && x <= b;

const boxIntersect = (inside: Box, outside: Box) => {
    const inx =
        between(inside.x0, outside.x0, outside.x1) ||
        between(inside.x1, outside.x0, outside.x1);
    const outx =
        between(outside.x0, inside.x0, inside.x1) ||
        between(outside.x1, inside.x0, inside.x1);
    const iny =
        between(inside.y0, outside.y0, outside.y1) ||
        between(inside.y1, outside.y0, outside.y1);
    const outy =
        between(outside.y0, inside.y0, inside.y1) ||
        between(outside.y1, inside.y0, inside.y1);
    // They can cross, or inside can be fully inside outside,
    // but you can't have ouside be fully inside inside
    return (inx || iny) && (inx || outx) && (iny || outy);
};

const maxDist = (box: Box, { x, y }: { x: number; y: number }) => {
    return {
        x: Math.max(Math.abs(box.x0 - x), Math.abs(box.x1 - x)),
        y: Math.max(Math.abs(box.y0 - y), Math.abs(box.y1 - y)),
    };
};

const inOut = (
    boxes: Box[],
    inn: { x: number; y: number },
    out: { x: number; y: number },
) => {
    // const found = boxes.find(
    //     (box) => inBox(inn.x, inn.y, box) && !inBox(out.x, out.y, box),
    // );
    // if (!found) {
    const check = {
        x0: Math.min(inn.x, out.x),
        x1: Math.max(inn.x, out.x),
        y0: Math.min(inn.y, out.y),
        y1: Math.max(inn.y, out.y),
    };
    const ok = boxes
        .filter((box) => boxIntersect(box, check as Box))
        .map((box) => ({ box, dist: maxDist(box, out) }))
        .sort((a, b) =>
            a.dist.y === b.dist.y ? b.dist.x - a.dist.x : b.dist.y - a.dist.y,
        );
    return ok.length ? ok[0].box : null;
    // }
    // return found;
};

type Box = {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    idx: number;
    depth: number;
};

const inBox = (x: number, y: number, box: Box) => {
    return x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1;
};

export const Editor = () => {
    const store = useMemo(
        () =>
            ({
                map: {},
                listeners: {},
                selection: null,
                drag: null,
                nodes: {},
            } as Store),
        [],
    );
    const ast = useMemo(() => {
        return to.add(store.map, {
            type: 'Expression',
            value: to.Expression(
                parseExpression('hello(one(2)(3), 1, 2u)'),
                store.map,
            ),
        });
    }, []);
    // const dn = useRef(null as null | HTMLDivElement);

    const boxes = useMemo(() => [] as Box[], []);

    return (
        <div
            style={{ margin: 48, fontSize: 48 }}
            onMouseDown={(evt) => {
                // dn.current!.style.top = evt.clientY + 'px';
                // dn.current!.style.left = evt.clientX + 'px';
                boxes.splice(0, boxes.length);
                Object.keys(store.nodes).forEach((key) => {
                    const node = store.nodes[+key].node;
                    if (!node.isConnected) {
                        return;
                    }
                    const box = store.nodes[+key].node.getBoundingClientRect();
                    boxes.push({
                        x0: box.left,
                        y0: box.top,
                        x1: box.right,
                        y1: box.bottom,
                        idx: +key,
                        depth: store.nodes[+key].path.length,
                    });
                });
                boxes.sort((a, b) => b.depth - a.depth);
                const find = hitBox(boxes, evt.clientX, evt.clientY);
                if (!find) {
                    return;
                }
                store.drag = {
                    start: { x: evt.clientX, y: evt.clientY, idx: find.idx },
                    end: { x: evt.clientX, y: evt.clientY, idx: find.idx },
                };
            }}
            onMouseMove={(evt) => {
                if (store.drag) {
                    const box = inOut(
                        boxes,
                        { x: evt.clientX, y: evt.clientY },
                        { x: store.drag.start.x, y: store.drag.start.y },
                    );
                    if (box) {
                        store.drag.end = {
                            x: box.x1,
                            y: box.y1,
                            idx: box.idx,
                        };
                        if (box.idx === store.drag.start.idx) {
                            return;
                        }
                        const sell = document.getSelection();
                        if (sell) {
                            sell.removeAllRanges();
                        }
                        const sel = calcSelection(store, store.drag);
                        if (sel) {
                            evt.preventDefault();
                            setSelection(store, sel);
                        }
                        // dn.current!.style.top = box.y0 + 'px';
                        // dn.current!.style.left = box.x0 + 'px';
                        // dn.current!.style.width = box.x1 - box.x0 + 'px';
                        // dn.current!.style.height = box.y1 - box.y0 + 'px';
                        // console.log(box.idx, store.nodes[box.idx]);
                    } else {
                        if (store.selection?.type === 'select') {
                            setSelection(store, {
                                type: 'select',
                                idx: store.drag.start.idx,
                                children: null,
                            });
                        }
                    }
                }
            }}
            onMouseUp={(evt) => {
                if (store.drag) {
                    store.drag = null;
                }
            }}
        >
            <Expression id={ast} store={store} path={[]} />
            <Dump store={store} id={ast} />
            {/* <div
                ref={(node) => (dn.current = node)}
                style={{
                    position: 'fixed',
                    pointerEvents: 'none',
                    backgroundColor: 'rgba(255,0,0,0.1)',
                    width: 20,
                    height: 20,
                }}
            /> */}
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
        <div
            style={{
                marginTop: 48,
                fontSize: 10,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
            }}
        >
            <div>{JSON.stringify(store.selection)}</div>
            <div>{JSON.stringify(store.drag)}</div>
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

export const sel = { backgroundColor: `rgba(255, 255, 0, 0.2)` };

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

function calcSelection(
    store: Store,
    drag: NonNullable<Store['drag']>,
): Selection | undefined {
    const p1 = store.nodes[drag.start.idx].path
        .map((p) => p.pid)
        .concat(drag.start.idx);
    const p2 = store.nodes[drag.end.idx].path
        .map((p) => p.pid)
        .concat(drag.end.idx);
    for (let i = 0; i < p1.length && i < p2.length; i++) {
        if (p1[i] !== p2[i]) {
            if (i > 0) {
                return {
                    type: 'select',
                    idx: p1[i - 1],
                    children: [p1[i], p2[i]],
                };
            }
            return;
        }
    }
    if (p1.length < p2.length) {
        return { type: 'select', idx: p1[p1.length - 1], children: null };
    } else {
        return { type: 'select', idx: p2[p2.length - 1], children: null };
    }
}
