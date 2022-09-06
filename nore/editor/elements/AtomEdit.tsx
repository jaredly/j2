import React, { useEffect, useRef } from 'react';
import {
    Store,
    Path,
    setSelection,
    Selection,
    EditSelection,
} from '../store/store';
import { keyHandler } from './keyHandler';
import { sel } from '../Hand2';
import { onFinishEdit } from '../store/modify';

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
