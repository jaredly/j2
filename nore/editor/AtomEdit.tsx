import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseSuffix,
} from '../generated/parser';
import React, { useRef } from 'react';
import { Store, Path, nidx, newBlank, setSelection, notify } from './Hand2';

const canRemove = (path: Path) => {
    if (path.length === 0) return false;
    const last = path[path.length - 1];
    switch (last.type) {
        case 'Apply_suffix':
        case 'CallSuffix_args':
            return true;
    }
    return false;
};

const remove = (idx: number, path: Path, store: Store) => {
    const last = path[path.length - 1];
    switch (last.type) {
        case 'Apply_suffix': {
            const apply = store.map[last.pid].value as t.Apply;
            const at = apply.suffixes.indexOf(idx);
            apply.suffixes = apply.suffixes.filter((n) => n !== idx);
            setSelection(
                store,
                {
                    type: 'edit',
                    idx: at > 0 ? apply.suffixes[at - 1] : last.pid,
                    at: 'end',
                },
                [last.pid],
            );
            break;
        }
        case 'CallSuffix_args': {
            const call = store.map[last.pid].value as t.CallSuffix;
            if (call.args.length === 1 && path.length > 1) {
                // we're removing the whole thing, my folks
                const prev = path[path.length - 2];
                console.assert(prev.type === 'Apply_suffix');
                const apply = store.map[prev.pid].value as t.Apply;
                const at = apply.suffixes.indexOf(last.pid);
                if (apply.suffixes.length === 1) {
                    // We remove the whole apply
                    const target = store.map[apply.target].value;
                    store.map[prev.pid].value = target;
                    target.loc.idx = prev.pid;
                    // oh got to clean up in those other places too
                    delete store.map[apply.target];
                    setSelection(store, {
                        type: 'edit',
                        idx: prev.pid,
                        at: 'end',
                    });
                    return;
                }
                apply.suffixes = apply.suffixes.filter((n) => n !== last.pid);
                setSelection(
                    store,
                    {
                        type: 'edit',
                        idx: at > 0 ? apply.suffixes[at - 1] : apply.target,
                        at: 'end',
                    },
                    [prev.pid],
                );
                return;
            }
            const at = call.args.indexOf(idx);
            call.args = call.args.filter((n) => n !== idx);
            setSelection(
                store,
                {
                    type: 'edit',
                    idx: at > 0 ? call.args[at - 1] : last.pid,
                    at: 'end',
                },
                [last.pid],
            );

            break;
        }
    }
};

export const AtomEdit = ({
    text,
    store,
    level,
    idx,
    path,
}: {
    text: string;
    store: Store;
    level: 'Expression' | 'Applyable' | 'Suffix';
    idx: number | null;
    path: Path;
}) => {
    const selection =
        idx === null
            ? { type: 'edit', idx: 0, at: 'change' }
            : store.selection?.idx === idx
            ? store.selection
            : null;
    const ref = useRef(null as null | HTMLSpanElement);
    if (selection?.type === 'edit') {
        return (
            <span
                contentEditable
                style={{
                    outline: 'none',
                    backgroundColor: `rgba(255,0,255,0.1)`,
                }}
                ref={(node) => {
                    if (!node) {
                        // We've got a runner! Unmounting, so let's commit this info
                        if (ref.current && ref.current.textContent !== text) {
                            const changed = ref.current.textContent!;
                            if (changed.trim().length === 0) {
                                // this never existed, to need to "remove" it
                                if (idx == null) {
                                    return;
                                }
                                const last = path[path.length - 1];
                                if (last && last.type === 'CallSuffix_args') {
                                    const call = store.map[last.pid]
                                        .value as t.CallSuffix;
                                    if (call.args.length === 1) {
                                        call.args = [];
                                        notify(store, [last.pid]);
                                        return;
                                    }
                                }
                                const nw = newBlank();
                                nw.loc.idx = idx;
                                store.map[idx].value = nw;
                                notify(store, [idx]);
                                return;
                            }
                            if (idx != null) {
                                try {
                                    reparse(level, changed, store, idx);
                                    notify(store, [idx]);
                                } catch (err) {
                                    console.error(err);
                                }
                                console.log('diff', changed);
                            }
                        }
                        return;
                    }
                    ref.current = node;
                    node.textContent = text;
                    node.focus();
                    if (selection.at === 'end') {
                        const sel = document.getSelection();
                        const r = sel?.getRangeAt(0)!;
                        r.selectNodeContents(node);
                        r.collapse(false);
                    }
                    if (selection.at === 'change') {
                        document
                            .getSelection()
                            ?.getRangeAt(0)
                            .selectNodeContents(node);
                    }
                }}
                onInput={(evt) => {
                    const text = evt.currentTarget.textContent!;
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Escape') {
                        evt.preventDefault();
                        evt.currentTarget.blur();
                        return;
                    }
                    if (
                        evt.key === 'Backspace' &&
                        canRemove(path) &&
                        idx != null
                    ) {
                        if (evt.currentTarget.textContent === '') {
                            evt.preventDefault();
                            remove(idx, path, store);
                            return;
                        }
                    }
                    if (idx == null) {
                        return;
                    }
                    if (evt.key === '(' && level === 'Expression') {
                        const sel = document.getSelection();
                        if (sel?.getRangeAt(0).toString() !== '') {
                            return;
                        }
                        evt.preventDefault();
                        toCallExpression(
                            evt.currentTarget.textContent!,
                            store,
                            idx,
                        );
                        // TODO check if selection is at the end, and such
                        console.log('paren');
                    }
                }}
                onBlur={(evt) => {
                    // const changed = evt.currentTarget.textContent;
                    // if (changed != null && changed.trim().length === 0) {
                    //     if (idx == null) {
                    //         setSelection(store, null);
                    //         return;
                    //     }
                    //     const nw = newBlank();
                    //     nw.loc.idx = idx;
                    //     store.map[idx].value = nw;
                    //     setSelection(store, null);
                    //     return;
                    // }
                    // if (changed && changed !== text && idx != null) {
                    //     try {
                    //         reparse(level, changed, store, idx);
                    //     } catch (err) {
                    //         console.error(err);
                    //     }
                    //     console.log('diff', changed);
                    // }
                    setSelection(store, null);
                }}
            />
        );
    }
    return (
        <span
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

function toCallExpression(text: string, store: Store, idx: number) {
    let target: t.Applyable;
    try {
        target = to.Applyable(parseApplyable(text), store.map);
    } catch (err) {
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
