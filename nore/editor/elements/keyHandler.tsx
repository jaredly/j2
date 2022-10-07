import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import React from 'react';
import {
    Store,
    Path,
    setSelection,
    nidx,
    getc,
    addBlank,
    updateStore,
} from '../store/store';
import { goLeft, goRight, remove } from '../store/navigation';
import { Level } from './AtomEdit';
import {
    addArg,
    addCallSuffix,
    CallSuffix_args,
    onFinishEdit,
    toCallExpression,
} from '../store/modify';
import { firstChild } from '../../generated/navigation';

export const keyHandler = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number | null,
    path: Path,
    store: Store,
    level: Level,
    text: string,
) => {
    if (evt.key === 'Escape') {
        evt.preventDefault();
        evt.currentTarget.blur();
        return;
    }
    if (
        evt.key === 'ArrowLeft' &&
        getSelection()?.toString() === '' &&
        getPos(evt.currentTarget) === 0
    ) {
        evt.preventDefault();
        goLeft(store, path);
    }
    if (
        evt.key === 'ArrowRight' &&
        getSelection()?.toString() === '' &&
        getPos(evt.currentTarget) === evt.currentTarget.textContent!.length
    ) {
        evt.preventDefault();
        goRight(store, idx, path);
    }
    // Ok yeah, so if you're at the start of a thing,
    // and you're backspacing
    // When we want to `select:change` the previous thing.
    // So really, we need a 'select the previous thing' function
    if (
        evt.key === 'Backspace' &&
        getPos(evt.currentTarget) === 0 &&
        window.getSelection()?.toString() === ''
    ) {
        evt.preventDefault();
        if (evt.currentTarget.innerText !== '') {
            return goLeft(store, path);
        }
        remove(idx, path, store);
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
        store.selection = { ...store.selection! };
        // @ts-ignore
        store.selection.at = 'end';
        return;
    }
    if (evt.key === '(' && level === 'Expression') {
        evt.preventDefault();
        store.onDeselect = null;
        if (idx == null) {
            const nidx = onFinishEdit(
                evt.currentTarget.textContent!,
                idx,
                path,
                store,
                text,
                level,
            );
            if (nidx != null) {
                idx = nidx;
            } else {
                return;
            }
        }
        const res = toCallExpression(
            evt.currentTarget.textContent!,
            store,
            idx,
        );
        if (res) {
            updateStore(store, res);
        }
        return;
    }

    if (evt.key === '(') {
        if (level === 'Suffix' || level === 'Applyable') {
            evt.preventDefault();
            addCallSuffix(path, store, level);
        }
    }

    if (evt.key === ')') {
        for (let i = path.length - 1; i >= 0; i--) {
            const last = path[i];
            if (last.type === 'Apply_suffix') {
                const apply = store.map[last.pid].value as t.Apply;
                const next =
                    last.suffix < apply.suffixes.length
                        ? apply.suffixes[last.suffix]
                        : last.pid;
                if (next === store.selection?.idx) {
                    continue;
                }
                evt.preventDefault();
                const child = firstChild(store, next, [], false);
                if (child) {
                    setSelection(store, child.sel, [last.pid]);
                }
                return;
            }
        }
    }

    if (evt.key === ',') {
        if (idx == null && path[path.length - 1].type === 'CallSuffix_args') {
            evt.preventDefault();
            store.onDeselect = null;
            console.log('ok', evt.currentTarget.textContent);
            onFinishEdit(
                evt.currentTarget.textContent!,
                idx,
                path,
                store,
                text,
                level,
            );
            addArg(store, path[path.length - 1] as CallSuffix_args);
            return;
        }
        for (let i = path.length - 1; i >= 0; i--) {
            const last = path[i];
            if (last.type === 'CallSuffix_args') {
                evt.preventDefault();
                addArg(store, last);
                return;
            }
        }
    }
};

const getPos = (target: HTMLElement) => {
    const sel = document.getSelection()!;
    const r = sel.getRangeAt(0).cloneRange();
    sel.extend(target, 0);
    const pos = sel.toString().length;
    sel.removeAllRanges();
    sel.addRange(r);
    return pos;
};
