import { Path } from './react-map';
import React, { useLayoutEffect, useRef } from 'react';
import { setSelection, Store } from '../editor/store/store';
import { goLeft, goRight } from './navigation';

export const ClickSide = ({
    path,
    children,
    store,
}: {
    path: Path[];
    store: Store;
    children: JSX.Element | string;
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
                        setSelection(store, left);
                    }
                } else {
                    if (last.cid === 0) {
                        const left = goLeft(store, path, false);
                        if (left) {
                            const right = goRight(
                                store,
                                left.path.concat([
                                    { cid: left.cid, idx: left.idx, punct: 0 },
                                ]),
                                false,
                            );
                            if (right) {
                                setSelection(store, right);
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
                            setSelection(store, right);
                        }
                    }
                }
            }}
        >
            {children}
        </span>
    );
};

export const Empty = ({ path, store }: { path: Path[]; store: Store }) => {
    const last = path[path.length - 1];
    const sel =
        // @ts-ignore
        store.selection?.idx === last.idx && store.selection?.cid === last.cid;
    const ref = useRef(null as null | HTMLSpanElement);
    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (sel && ref.current !== document.activeElement) {
            ref.current.focus();
        }
    }, [sel]);
    if (sel) {
        return (
            <span
                contentEditable
                ref={ref}
                style={{ height: '1em', color: 'white' }}
                onBlur={() => {
                    setSelection(store, null);
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'ArrowRight') {
                        evt.preventDefault();
                        evt.stopPropagation();
                        const right = goRight(store, path, true);
                        // console.log('going right', right);
                        if (right) {
                            setSelection(store, right);
                        }
                    }
                    if (evt.key === 'ArrowLeft') {
                        evt.preventDefault();
                        evt.stopPropagation();
                        const left = goLeft(store, path, true);
                        // console.log('going left', left);
                        if (left) {
                            setSelection(store, left);
                        }
                    }
                }}
            />
        );
    }
    return <span style={{ height: '1em', color: 'red' }}></span>;
};
