import { Path } from '../generated/react-map';
import React, { useLayoutEffect, useRef } from 'react';
import { setSelection, Store } from '../store/store';
import { goLeft, goRight } from './navigation';
import { handleKey, keyHandlers } from './keyHandlers';

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
                            setSelection(store, right.sel);
                        }
                    }
                    if (evt.key === 'ArrowLeft') {
                        evt.preventDefault();
                        evt.stopPropagation();
                        const left = goLeft(store, path, true);
                        // console.log('going left', left);
                        if (left) {
                            setSelection(store, left.sel);
                        }
                    }
                    if (keyHandlers[evt.key]) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        console.log(path);
                        handleKey(
                            store,
                            path,
                            evt.key,
                            evt.currentTarget.textContent!,
                        );
                    }
                }}
            />
        );
    }
    return <span style={{ height: '1em', color: 'red' }}></span>;
};
