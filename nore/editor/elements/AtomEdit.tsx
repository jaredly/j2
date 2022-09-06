import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseSuffix,
} from '../../generated/parser';
import React, { useEffect, useRef } from 'react';
import {
    Store,
    Path,
    nidx,
    newBlank,
    setSelection,
    notify,
    Selection,
    EditSelection,
    addBlank,
    getc,
} from '../store/store';
import { keyHandler } from './keyHandler';
import { sel } from '../Hand2';

export const onFinishEdit = (
    changed: string,
    idx: null | number,
    path: Path,
    store: Store,
    text: string,
    level: Level,
) => {
    if (idx != null && store.map[idx] == null) {
        return; // we been deleted
    }
    if (changed.trim().length === 0) {
        // this never existed, to need to "remove" it
        if (idx == null) {
            return;
        }
        const last = path[path.length - 1];
        if (last && last.type === 'CallSuffix_args') {
            const call = store.map[last.pid].value as t.CallSuffix;
            if (call.args.length === 1) {
                call.args = [];
                notify(store, [last.pid]);
                return;
            }
        }
        const nw = newBlank();
        nw.loc.idx = idx;
        store.map[idx] = { ...store.map[idx] };
        store.map[idx].value = nw;
        notify(store, [idx]);
        return;
    }
    if (changed !== text) {
        if (idx == null) {
            const last = path[path.length - 1];
            if (last && last.type === 'CallSuffix_args') {
                idx = addBlank(store);
                const call = getc(store, last.pid) as t.CallSuffix;
                call.args = call.args.concat([idx]);
                notify(store, [last.pid]);
            } else {
                return;
            }
        }
        try {
            reparse(level, changed, store, idx);
            notify(store, [idx]);
        } catch (err) {
            console.error(err);
        }
    }
    return;
};

export type Level = 'Expression' | 'Applyable' | 'Suffix';

export const AtomEdit = ({
    text,
    store,
    level,
    idx,
    path,
    style,
}: {
    text: string;
    store: Store;
    level: Level;
    idx: number | null;
    path: Path;
    style?: React.CSSProperties;
}) => {
    const selection =
        idx === null
            ? { type: 'edit', idx: 0, at: 'change' }
            : store.selection?.idx === idx
            ? store.selection
            : null;
    const ref = useRef(null as null | HTMLSpanElement);
    const editing = selection?.type === 'edit';
    useEffect(() => {
        if (selection?.type !== 'edit') {
            return;
        }
        const fn = () => {
            if (ref.current) {
                const changed = ref.current.textContent!;
                // console.log('unmount, etc', changed, idx);
                onFinishEdit(changed, idx, path, store, text, level);
            }
        };
        store.onDeselect = fn;
        return () => {
            if (store.onDeselect === fn) {
                store.onDeselect = null;
            }
        };
    }, [editing]);

    if (editing) {
        return (
            <span
                contentEditable
                style={{
                    outline: 'none',
                    backgroundColor: `rgba(255,0,255,0.1)`,
                    ...style,
                }}
                ref={(node) => {
                    if (!node) {
                        ref.current = null;
                        return;
                    }
                    if (idx != null) {
                        store.nodes[idx] = { node, path };
                    }
                    if (!ref.current) {
                        // console.log('first mount', text, idx);
                        ref.current = node;
                        node.textContent = text;
                    }
                    setDomSelection(selection as EditSelection, node);
                }}
                // TODO: Provide feedback on ... whether it's valid?
                // Also, autocomplete comes here!
                // onInput={(evt) => {
                //     const text = evt.currentTarget.textContent!;
                // }}
                onKeyDown={(evt) => {
                    keyHandler(evt, idx, path, store, level, text);
                }}
                onBlur={() => setSelection(store, null)}
            />
        );
    }
    return (
        <span
            style={{
                ...style,
                ...(selection?.type === 'select' ? sel : null),
            }}
            ref={(node) => {
                if (node && idx != null) {
                    store.nodes[idx] = { node, path };
                }
            }}
            onMouseDown={
                idx != null
                    ? () => setSelection(store, { type: 'edit', idx: idx })
                    : undefined
            }
        >
            {text}
        </span>
    );
};

function setDomSelection(selection: EditSelection, node: HTMLSpanElement) {
    node.focus();
    if (selection.at === 'end') {
        const sel = document.getSelection();
        const r = sel?.getRangeAt(0)!;
        r.selectNodeContents(node);
        r.collapse(false);
    }
    if (selection.at === 'change') {
        document.getSelection()?.getRangeAt(0).selectNodeContents(node);
    }
}

function reparse(level: string, changed: string, store: Store, idx: number) {
    if (level === 'Suffix') {
        const nw = to.Suffix(parseSuffix(changed), store.map);
        nw.loc.idx = idx;
        store.map[idx] = {
            type: 'Suffix',
            value: nw,
        };
    }
    if (level === 'Expression') {
        const nw = to.Expression(parseExpression(changed), store.map);
        nw.loc.idx = idx;
        store.map[idx] = {
            type: 'Expression',
            value: nw,
        };
    }
    if (level === 'Applyable') {
        const nw = to.Applyable(parseApplyable(changed), store.map);
        nw.loc.idx = idx;
        store.map[idx] = {
            type: 'Applyable',
            value: nw,
        };
    }
}

export function toCallExpression(text: string, store: Store, idx: number) {
    let target: t.Applyable;
    try {
        target = to.Applyable(parseApplyable(text), store.map);
    } catch (err) {
        console.log(`Unable to parse to applyable`);
        console.log(err);
        return;
    }
    // const prev = store.map[idx].value;
    // prev.loc.idx = nidx();
    const blank = newBlank();
    const nw: t.Apply = {
        type: 'Apply',
        target: target.loc.idx,
        suffixes: [
            to.add(store.map, {
                type: 'Suffix',
                value: {
                    type: 'CallSuffix',
                    args: [
                        to.add(store.map, {
                            type: 'Expression',
                            value: blank,
                        }),
                    ],
                    loc: {
                        idx: nidx(),
                        start: 0,
                        end: 0,
                    },
                },
            }),
        ],
        loc: {
            idx: idx,
            start: 0,
            end: 0,
        },
    };
    store.map[target.loc.idx] = {
        type: 'Applyable',
        value: target as t.Applyable,
    };
    store.map[idx] = {
        type: 'Expression',
        value: nw,
    };
    setSelection(store, {
        type: 'edit',
        idx: blank.loc.idx,
    });
}
