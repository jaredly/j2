import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import React from 'react';
import { Store, Path, nidx, setSelection } from '../Hand2';
import { goLeft, goRight, remove } from './navigation';
import {
    Level,
    onFinishEdit,
    toCallExpression,
    getc,
    addBlank,
} from './AtomEdit';

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
        return evt.currentTarget.blur();
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
        // @ts-ignore
        store.selection.at = 'end';
        return;
    }
    if (evt.key === '(' && level === 'Expression' && idx != null) {
        evt.preventDefault();
        store.onDeselect = null;
        toCallExpression(evt.currentTarget.textContent!, store, idx);
    }

    if (evt.key === '(') {
        if (level === 'Suffix' || level === 'Applyable') {
            evt.preventDefault();
            const last = path[path.length - 1];
            const apply = getc(store, last.pid) as t.Apply;
            const blank = addBlank(store);
            const nid = to.add(store.map, {
                type: 'Suffix',
                value: {
                    type: 'CallSuffix',
                    args: [blank],
                    loc: { start: 0, end: 0, idx: nidx() },
                },
            });
            apply.suffixes = apply.suffixes.slice();
            if (level === 'Applyable') {
                apply.suffixes.unshift(nid);
            } else if (last.type === 'Apply_suffix') {
                apply.suffixes.splice(last.suffix + 1, 0, nid);
            } else {
                apply.suffixes.push(nid);
            }
            setSelection(store, { type: 'edit', idx: blank }, [last.pid]);
        }
    }

    if (evt.key === ')') {
        // debugger;
        for (let i = path.length - 1; i >= 0; i--) {
            const last = path[i];
            if (last.type === 'Apply_suffix') {
                const apply = getc(store, last.pid) as t.Apply;
                // const blank = addBlank(store);
                // call.args = call.args.slice();
                // call.args.splice(last.suffix + 1, 0, blank);
                const next =
                    last.suffix < apply.suffixes.length
                        ? apply.suffixes[last.suffix]
                        : last.pid;
                if (next === store.selection?.idx) {
                    continue;
                }
                evt.preventDefault();
                setSelection(
                    store,
                    {
                        type: 'edit',
                        idx: next,
                        at: 'end',
                    },
                    [last.pid],
                );
                return;
            }
        }
    }

    if (evt.key === ',') {
        for (let i = path.length - 1; i >= 0; i--) {
            const last = path[i];
            if (last.type === 'CallSuffix_args') {
                evt.preventDefault();
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
