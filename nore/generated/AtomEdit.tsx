import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { idx, parse } from './grammar';
import * as parsers from './parser';
import * as t from './type-map';
import * as c from './atomConfig';
import * as to from './to-map';
import {
    updateStore,
    Store,
    newBlank,
    setSelection,
} from '../editor/store/store';
import { Path } from './react-map';
import { firstChild, goLeft, goRight } from './navigation';
import { keyHandlers, handleKey } from './keyHandlers';

const colors: { [key: string]: string } = {
    Identifier: '#5bb6b7',
    PIdentifier: '#82f682',
    Number: '#4848a5',
    Expression: 'white',
};

const pathColor = (path: Path[], store: Store) => {
    for (let i = path.length - 1; i >= 0; i--) {
        const t = store.map[path[i].idx].value.type;
        if (colors[t]) {
            return colors[t];
        }
        console.log(t);
    }
    return undefined;
};

export const AtomEdit = <T,>({
    value,
    idx,
    config,
    store,
    path,
}: {
    value: T;
    idx: number;
    store: Store;
    config: c.AtomConfig<T>;
    path: Path[];
}) => {
    const editing = store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);

    edit = edit == null ? config.toString(value) : edit;

    const commit = React.useCallback(() => {
        const type = store.map[idx].type;
        try {
            const parsed =
                edit?.length === 0
                    ? newBlank()
                    : // @ts-ignore
                      parsers['parse' + type](edit!.trim());
            // @ts-ignore
            const tomap = to[type];
            parsed.loc.idx = idx;
            updateStore(store, {
                map: {
                    [idx]: {
                        type: type,
                        value: tomap(parsed, store.map),
                    } as t.Map[0],
                },
            });
        } catch (err) {
            console.error(err);
            setEdit(config.toString(value));
        }
    }, [edit, value, idx]);

    useLayoutEffect(() => {
        if (!editing) {
            commit();
        }
    }, [editing]);

    const ref = useRef(null as null | HTMLSpanElement);
    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing && ref.current !== document.activeElement) {
            const at = store.selection?.type === 'edit' && store.selection.at;
            if (at === 'end') {
                const sel = window.getSelection()!;
                setTimeout(() => {
                    sel.selectAllChildren(ref.current!);
                    sel.getRangeAt(0).collapse(false);
                }, 0);
            } else if (at === 'change') {
                const sel = window.getSelection()!;
                setTimeout(() => {
                    sel.selectAllChildren(ref.current!);
                }, 0);
            } else {
                ref.current.focus();
            }
        }
        if (ref.current.textContent !== edit) {
            ref.current.textContent = edit;
        }
    }, [edit, editing]);
    if (!editing) {
        return (
            <span
                style={{
                    color: pathColor(
                        path.concat([{ idx, cid: 0, punct: 0 }]),
                        store,
                    ),
                    minHeight: '1.5em',
                    // backgroundColor: 'rgba(255, 255, 0, 0.05)',
                }}
                onMouseDown={(evt) => {
                    setEdit(config.toString(value));
                    setSelection(store, {
                        type: 'edit',
                        idx,
                        cid: 0,
                    });
                }}
            >
                {config.toString(value)}
            </span>
        );
    }
    return (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            onInput={(evt) => setEdit(evt.currentTarget.textContent!)}
            onBlur={() => {
                commit();
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: pathColor(
                    path.concat([{ idx, cid: 0, punct: 0 }]),
                    store,
                ),
                outline: 'none',
                minHeight: '1.5em',
                // backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    commit();
                    // setEdit(null);
                    return;
                }
                if (keyHandlers[evt.key]) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    handleKey(
                        store,
                        path.concat([{ idx, cid: 0, punct: 0 }]),
                        evt.key,
                    );
                }
                if (
                    evt.key === 'ArrowRight' &&
                    getSelection()?.toString() === '' &&
                    getPos(evt.currentTarget) ===
                        evt.currentTarget.textContent!.length
                ) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    const right = goRight(store, path);
                    // console.log(`going right`, right);
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
                    const left = goLeft(store, path);
                    // console.log(`going left`, left);
                    if (left) {
                        setSelection(store, left.sel);
                    }
                }
            }}
        />
    );
};

const getPos = (target: HTMLElement) => {
    // console.log('getting pos');
    const sel = document.getSelection()!;
    const r = sel.getRangeAt(0).cloneRange();
    sel.extend(target, 0);
    const pos = sel.toString().length;
    sel.removeAllRanges();
    sel.addRange(r);
    return pos;
};

/*
Should my NodeChildren function also return ... something to do with
what valid characters exist for a given child position?
like can we do a comma here? idk.
*/
