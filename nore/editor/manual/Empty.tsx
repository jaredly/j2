import { Path } from '../generated/react-map';
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { setSelection, Store } from '../store/store';
import { goLeft, goRight } from './navigation';
import { handleKey, keyHandlers } from './keyHandlers';
import * as parsers from '../../generated/parser';
import { colors, pathColor } from './AtomEdit';

export const Empty = ({
    path,
    store,
    kind,
}: {
    path: Path[];
    store: Store;
    kind?: string;
}) => {
    let [edit, setEdit] = React.useState('');
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
    const parsed = useMemo(() => {
        // const last = store.map[path[path.length - 1].idx].type;
        try {
            // @ts-ignore
            const parsed = parsers['parse' + kind](edit);
            return parsed;
        } catch (err) {
            console.log('no', err, kind);
            return null;
        }
    }, [edit]);
    console.log('parsed', edit, parsed?.type);
    if (sel) {
        return (
            <span
                contentEditable
                ref={ref}
                style={{
                    height: '1em',
                    // color: 'white',
                    outline: 'none',
                    color: (parsed && colors[parsed.type]) || 'white',
                }}
                onBlur={() => {
                    setSelection(store, null);
                }}
                onInput={(evt) => setEdit(evt.currentTarget.textContent!)}
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
                        const res = handleKey(store, path, evt.key, edit);
                        if (res !== false) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            console.log(path);
                        }
                    }
                }}
            />
        );
    }
    return <span style={{ height: '1em', color: 'red' }}></span>;
};
