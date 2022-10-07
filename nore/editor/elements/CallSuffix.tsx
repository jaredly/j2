import React from 'react';
import * as t from '../../generated/type-map';
import { sel } from '../Editor';
import { Path, setSelection, Store } from '../store/store';
import { Expression } from './aggregates';
import { AtomEdit } from './AtomEdit';

// OHHH KKKKK I think I need a primitive that's like `SText`
// for `SelectableText` that's like, this is some text that
// the cursor can interact with, it's at [this idx], and [this offset]
// and it's [this long] idk.
// Then it registers itself as a listener? I mean that's like a wholeeee
// bunch of listeners, but maybe it's ok?

const orderKids = (
    children: [number, number],
    args: number[],
): [number, number] => {
    const one = args.indexOf(children[0]);
    const two = args.indexOf(children[1]);
    return [Math.min(one, two), Math.max(one, two)];
};

const isSelected = (kids: null | [number, number], idx: number): boolean => {
    return kids != null && kids[0] <= idx && kids[1] >= idx;
};

export const CallSuffix = ({
    value,
    store,
    path,
}: {
    value: t.CallSuffix;
    store: Store;
    path: Path;
}) => {
    const selected = store.selection?.idx === value.loc.idx;
    const selEnd =
        selected &&
        store.selection?.type === 'edit' &&
        store.selection.at === 'end';
    const selKids =
        selected &&
        store.selection?.type === 'select' &&
        store.selection.children
            ? orderKids(store.selection.children, value.args)
            : null;
    return (
        <span
            ref={(node) => {
                if (node) {
                    store.nodes[value.loc.idx] = { node, path };
                }
            }}
            style={
                selected &&
                store.selection?.type === 'select' &&
                store.selection.children === null
                    ? sel
                    : undefined
            }
        >
            <span
                style={{ color: '#777' }}
                onMouseDown={(evt) => {
                    evt.preventDefault();
                    // so, selection ... is probably like the first
                    const box = evt.currentTarget.getBoundingClientRect();
                    const left = evt.clientX < box.left + box.width / 2;
                    if (!left) {
                        setSelection(
                            store,
                            value.args.length
                                ? {
                                      type: 'edit',
                                      idx: value.args[0],
                                      at: 'start',
                                  }
                                : {
                                      type: 'edit',
                                      idx: value.loc.idx,
                                      at: 'inner',
                                  },
                        );
                    } else {
                        const last = path[path.length - 1];
                        const apply = store.map[last.pid].value as t.Apply;
                        const at = apply.suffixes.indexOf(value.loc.idx);
                        setSelection(store, {
                            type: 'edit',
                            idx: at > 0 ? apply.suffixes[at - 1] : apply.target,
                            at: 'end',
                        });
                    }
                }}
            >
                (
            </span>

            {value.args.length === 0 &&
            selected &&
            store.selection?.type === 'edit' &&
            store.selection.at === 'inner' ? (
                <AtomEdit
                    level="Expression"
                    idx={null}
                    store={store}
                    text={''}
                    path={path.concat([
                        {
                            type: 'CallSuffix_args',
                            pid: value.loc.idx,
                            arg: 0,
                        },
                    ])}
                />
            ) : null}

            {value.args.map((id, i) => (
                <span
                    key={id + ':' + i}
                    style={isSelected(selKids, i) ? sel : undefined}
                >
                    <Expression
                        key={id + ':' + i}
                        id={id}
                        store={store}
                        path={path.concat([
                            {
                                type: 'CallSuffix_args',
                                arg: i,
                                pid: value.loc.idx,
                            },
                        ])}
                    />
                    {i !== value.args.length - 1 && (
                        <span
                            style={{ color: '#777' }}
                            onMouseDown={(evt) => {
                                evt.preventDefault();
                                const box =
                                    evt.currentTarget.getBoundingClientRect();
                                const left =
                                    evt.clientX < box.left + box.width / 2;
                                if (left) {
                                    setSelection(store, {
                                        type: 'edit',
                                        idx: id,
                                        at: 'end',
                                    });
                                } else {
                                    setSelection(store, {
                                        type: 'edit',
                                        idx: value.args[i + 1],
                                        at: 'start',
                                    });
                                }
                            }}
                        >
                            ,{' '}
                        </span>
                    )}
                </span>
            ))}
            <span
                style={{ color: '#777' }}
                onMouseDown={(evt) => {
                    // so, selection ... is probably like the first
                    evt.preventDefault();
                    const box = evt.currentTarget.getBoundingClientRect();
                    const left = evt.clientX < box.left + box.width / 2;
                    if (left) {
                        setSelection(
                            store,
                            value.args.length
                                ? {
                                      type: 'edit',
                                      idx: value.args[value.args.length - 1],
                                      at: 'end',
                                  }
                                : {
                                      type: 'edit',
                                      idx: value.loc.idx,
                                      at: 'inner',
                                  },
                        );
                    } else {
                        setSelection(store, {
                            type: 'edit',
                            idx: value.loc.idx,
                            at: 'end',
                        });
                    }
                }}
            >
                )
            </span>
            {selEnd ? (
                <AtomEdit
                    level="Suffix"
                    idx={null}
                    store={store}
                    text={''}
                    path={path}
                />
            ) : null}
        </span>
    );
};
