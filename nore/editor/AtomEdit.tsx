import * as t from '../generated/type-map';
import * as to from '../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseSuffix,
} from '../generated/parser';
import React, { useRef } from 'react';
import {
    Store,
    Path,
    nidx,
    newBlank,
    setSelection,
    notify,
    Selection,
    EditSelection,
} from './Hand2';

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
    console.log(`remove`, idx);
    const last = path[path.length - 1];
    switch (last.type) {
        case 'Apply_suffix': {
            const apply = getc(store, last.pid) as t.Apply;
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
            const call = getc(store, last.pid) as t.CallSuffix;
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
            delete store.map[idx];
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

// get for changing (having already done the shallow clones)
const getc = (store: Store, idx: number) => {
    store.map[idx] = { ...store.map[idx] };
    return (store.map[idx].value = { ...store.map[idx].value });
};

const addBlank = (store: Store) => {
    const blank = newBlank();
    store.map[blank.loc.idx] = {
        type: 'Expression',
        value: blank,
    };
    return blank.loc.idx;
};

const onFinishEdit = (
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
        console.log('diff', changed);
    }
    return;
};

type Level = 'Expression' | 'Applyable' | 'Suffix';

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
    if (selection?.type === 'edit') {
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
                        // We've got a runner! Unmounting, so let's commit this info
                        if (ref.current) {
                            const changed = ref.current.textContent!;
                            onFinishEdit(
                                changed,
                                idx,
                                path,
                                store,
                                text,
                                level,
                            );
                        }
                        return;
                    }
                    ref.current = node;
                    node.textContent = text;
                    setDomSelection(selection as EditSelection, node);
                }}
                // TODO: Provide feedback on ... whether it's valid?
                // Also, autocomplete comes here!
                // onInput={(evt) => {
                //     const text = evt.currentTarget.textContent!;
                // }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Escape') {
                        evt.preventDefault();
                        return evt.currentTarget.blur();
                    }
                    // Ok yeah, so if you're at the start of a thing,
                    // and you're backspacing
                    // When we want to `select:change` the previous thing.
                    // So really, we need a 'select the previous thing' function
                    if (
                        evt.key === 'Backspace' &&
                        canRemove(path) &&
                        idx != null &&
                        evt.currentTarget.textContent === ''
                    ) {
                        evt.preventDefault();
                        remove(idx, path, store);
                        return;
                    }
                    if (idx == null) {
                        return;
                    }
                    if (evt.key === 'Enter' || evt.key === 'Return') {
                        evt.preventDefault();
                        onFinishEdit(
                            evt.currentTarget.textContent!,
                            idx,
                            path,
                            store,
                            text,
                            level,
                        );
                        // @ts-ignore
                        store.selection.at = 'end';
                        return;
                    }
                    if (evt.key === '(' && level === 'Expression') {
                        evt.preventDefault();
                        toCallExpression(
                            evt.currentTarget.textContent!,
                            store,
                            idx,
                        );
                    }
                    if (evt.key === ',' && level === 'Expression') {
                        evt.preventDefault();
                        const last = path[path.length - 1];
                        if (last.type === 'CallSuffix_args') {
                            const call = getc(store, last.pid) as t.CallSuffix;
                            const blank = addBlank(store);
                            call.args = call.args.slice();
                            call.args.splice(last.arg + 1, 0, blank);
                            setSelection(
                                store,
                                {
                                    type: 'edit',
                                    idx: blank,
                                    at: 'change',
                                },
                                [last.pid],
                            );
                        }
                    }
                }}
                onBlur={() => setSelection(store, null)}
            />
        );
    }
    return (
        <span
            style={style}
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
