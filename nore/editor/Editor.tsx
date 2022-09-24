// Handwritten structured editor, round 2: now with maps
import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import * as from from '../generated/from-map';
import * as React from 'react';
import { parseExpression } from '../generated/parser';
import { useEffect, useMemo, useRef, useState } from 'react';
import { idx } from '../generated/grammar';
// import { Expression } from './elements/aggregates';
import { Expression } from '../generated/react-map';
import { Store, Selection, Path } from './store/store';
import { useDrag } from './useDrag';

export const hitBox = (boxes: Box[], x: number, y: number) => {
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

export const inOut = (
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

export type Box = {
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

const redo = (store: Store) => {};
const undo = (store: Store) => {};

const Keyboardians = ({ store }: { store: Store }) => {
    useEffect(() => {
        const keydown = (e: KeyboardEvent) => {
            if (
                e.key === 'Delete' ||
                (e.key === 'Backspace' && store.selection?.type === 'select')
            ) {
                // OK? now we delete some thingssss
            }
            if (e.key === 'Z' && e.metaKey) {
                e.preventDefault();
                if (e.shiftKey) {
                    redo(store);
                } else {
                    undo(store);
                }
            }
        };
        document.addEventListener('keydown', keydown);

        return () => {
            document.removeEventListener('keydown', keydown);
        };
    }, []);
    return null;
};

export const emptyStore = (): Store => ({
    map: {},
    listeners: {},
    selection: null,
    drag: null,
    nodes: {},
    history: {
        idx: 0,
        items: [],
    },
    onDeselect: null,
});

export const Editor = ({ store, root }: { store: Store; root: number }) => {
    const dragHandlers = useDrag(store);

    return (
        <div
            style={{ margin: 48, fontSize: 48, color: '#888' }}
            {...dragHandlers}
        >
            <Keyboardians store={store} />
            <Expression idx={root} store={store} path={[]} />
            <Dump store={store} id={root} />
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

export const sel = { backgroundColor: `rgba(255, 255, 0, 0.2)` };

export function calcSelection(
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
