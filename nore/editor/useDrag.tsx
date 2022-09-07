import React, { useMemo } from 'react';
import { Store, setSelection } from './store/store';
import { Box, hitBox, inOut, calcSelection } from './Editor';

export const useDrag = (store: Store) => {
    const boxes = useMemo(() => [] as Box[], []);
    return {
        onMouseDown: (evt: React.MouseEvent) => {
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
        },
        onMouseMove: (evt: React.MouseEvent) => {
            if (store.drag) {
                const box = inOut(
                    boxes,
                    { x: evt.clientX, y: evt.clientY },
                    { x: store.drag.start.x, y: store.drag.start.y }
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
        },
        onMouseUp: () => {
            if (store.drag) {
                store.drag = null;
            }
        }
    };
};
