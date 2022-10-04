import { Path } from './react-map';
import React, { useLayoutEffect, useRef } from 'react';
import { setSelection, Store } from '../editor/store/store';
import { goLeft, goRight } from './navigation';

export const ClickSide = ({
    path,
    children,
}: {
    path: Path[];
    children: JSX.Element | string;
}) => {
    return (
        <span
            style={{ color: '#aaf' }}
            className="hover"
            onMouseDown={(evt) => {
                const box = evt.currentTarget.getBoundingClientRect();
                const leftSide = evt.clientX < box.left + box.width / 2;
                console.log('ok what', leftSide, JSON.stringify(path));
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
