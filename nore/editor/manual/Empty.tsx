import { Path } from '../generated/react-map';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { setDeselect, setSelection, Store, updateStore } from '../store/store';
import { goLeft, goRight } from './navigation';
import { handleKey, keyHandlers } from './keyHandlers';
import * as parsers from '../../generated/parser';
import { colors, getPos, pathColor } from './AtomEdit';
import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';

// @ts-ignore
window.parsers = parsers;

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
        if (!kind || !edit.length) {
            return null;
        }
        // @ts-ignore
        const fn = parsers['parse' + kind];
        if (!fn) {
            console.warn(`I wanted a parse`, kind);
            return null;
        }
        try {
            const parsed = fn(edit.trim());
            return parsed;
        } catch (err) {
            console.log('no', err, kind, JSON.stringify(edit));
            return null;
        }
    }, [edit]);

    const commit = React.useCallback(() => {
        if (!kind || !edit.length) {
            console.log('no commit', kind, edit.length);
            return;
        }
        console.log('lets commit', edit);
        try {
            // @ts-ignore
            const parsed = parsers['parse' + kind](edit!.trim());
            const update: t.Map = {};
            // @ts-ignore
            const tomap = to[kind](parsed, update);
            update[parsed.loc.idx] = {
                type: kind,
                value: tomap,
            } as t.Map[0];
            // updateStore(store, { map: update });
            const last = path[path.length - 1];
            const parent = store.map[last.idx].value;
            if (parent.type === 'CallSuffix' && last.cid === 0) {
                updateStore(store, {
                    map: {
                        ...update,
                        [last.idx]: {
                            ...store.map[last.idx],
                            value: { ...parent, args: [parsed.loc.idx] },
                        } as t.Map[0],
                    },
                });
            } else if (
                parent.type === 'Lambda' &&
                last.cid === 1 &&
                parent.args.length === 0
            ) {
                updateStore(store, {
                    map: {
                        ...update,
                        [last.idx]: {
                            ...store.map[last.idx],
                            value: { ...parent, args: [parsed.loc.idx] },
                        } as t.Map[0],
                    },
                });
            } else {
                console.warn(`NOT TO COMMIT idk`, parent.type);
            }
        } catch (err) {
            console.error(err);
            setEdit('');
            // setEdit(config.toString(value));
        }
    }, [edit, kind]);

    const lastCommit = useRef(commit);
    lastCommit.current = commit;

    // useLayoutEffect(() => {
    //     if (!sel) {
    //         commit();
    //     }
    // }, [sel, edit, kind]);
    useEffect(() => {
        if (sel) {
            return setDeselect(store, last.idx, last.cid, () => {
                lastCommit.current();
            });
        }
    }, [sel]);

    if (!sel) {
        return <span style={{ height: '1em', color: 'red' }} />;
    }
    return (
        <span
            contentEditable
            ref={ref}
            style={{
                height: '1em',
                outline: 'none',
                color: (parsed && colors[parsed.type]) || 'white',
            }}
            onBlur={() => {
                setSelection(store, null);
            }}
            onInput={(evt) => setEdit(evt.currentTarget.textContent!)}
            onKeyDown={(evt) => {
                if (
                    evt.key === 'ArrowRight' &&
                    getSelection()?.toString() === '' &&
                    getPos(evt.currentTarget) ===
                        evt.currentTarget.textContent!.length
                ) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    const right = goRight(store, path, true);
                    if (right) {
                        setSelection(store, right.sel);
                    }
                }
                if (
                    evt.key === 'ArrowLeft' &&
                    getSelection()?.toString() === '' &&
                    getPos(evt.currentTarget) === 0
                ) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    const left = goLeft(store, path, true);
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
};
