import { Path } from './react-map';
import React, { ReactNode } from 'react';
import { setSelection, Store } from '../editor/store/store';
import { goLeft, goRight } from './navigation';

export const ClickSide = ({
    path,
    children,
    store,
}: {
    path: Path[];
    store: Store;
    children: ReactNode;
}) => {
    return (
        <span
            style={{ color: '#aaf' }}
            onMouseDown={(evt) => {
                evt.preventDefault();
                const box = evt.currentTarget.getBoundingClientRect();
                const leftSide = evt.clientX < box.left + box.width / 2;
                const last = path[path.length - 1];
                if (leftSide) {
                    const left = goLeft(store, path, false);
                    if (left) {
                        setSelection(store, left.sel);
                    }
                } else {
                    if (last.cid === 0) {
                        const left = goLeft(store, path, false);
                        if (left) {
                            const right = goRight(
                                store,
                                left.path.concat([
                                    {
                                        cid: left.sel.cid,
                                        idx: left.sel.idx,
                                        punct: 0,
                                    },
                                ]),
                                false,
                            );
                            if (right) {
                                setSelection(store, right.sel);
                            }
                        }
                    } else {
                        const right = goRight(
                            store,
                            path
                                .slice(0, -1)
                                .concat([{ ...last, cid: last.cid - 1 }]),
                            false,
                        );
                        if (right) {
                            setSelection(store, right.sel);
                        }
                    }
                }
            }}
        >
            {children}
        </span>
    );
};
