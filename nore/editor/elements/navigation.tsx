import * as t from '../../generated/type-map';
import { Store, Path, setSelection } from '../Hand2';
import { getc } from './AtomEdit';

export const goRight = (store: Store, idx: number | null, path: Path) => {
    if (
        !path.length ||
        store.selection?.idx == null ||
        store.selection.type !== 'edit'
    ) {
        return;
    }
    const current = store.map[store.selection.idx].value;
    let lastIdx = path.length - 1;
    let last = path[lastIdx];
    while (
        last.type === 'Apply_suffix' &&
        lastIdx > 0 &&
        last.suffix >=
            (store.map[last.pid].value as t.Apply).suffixes.length - 1
    ) {
        lastIdx--;
        last = path[lastIdx];
    }
    switch (last.type) {
        case 'Apply_suffix': {
            const apply = store.map[last.pid].value as t.Apply;
            if (last.suffix < apply.suffixes.length - 1) {
                const next = store.map[apply.suffixes[last.suffix + 1]]
                    .value as t.CallSuffix;
                if (next.args.length) {
                    return setSelection(store, {
                        type: 'edit',
                        idx: next.args[0],
                        at: 'start',
                    });
                } else {
                    return setSelection(store, {
                        type: 'edit',
                        idx: apply.suffixes[last.suffix + 1],
                        at: 'inner',
                    });
                }

                // return setSelection(store, {
                //     type: 'edit',
                //     idx: apply.suffixes[last.suffix + 1],
                //     at: 'start',
                // });
            }
            return;
        }
        case 'CallSuffix_args': {
            const call = store.map[last.pid].value as t.CallSuffix;
            if (last.arg < call.args.length - 1) {
                return setSelection(store, {
                    type: 'edit',
                    idx: call.args[last.arg + 1],
                    at: 'start',
                });
            } else {
                return setSelection(store, {
                    type: 'edit',
                    idx: call.loc.idx,
                    at: 'end',
                });
            }
        }
        case 'Apply_target': {
            const apply = store.map[last.pid].value as t.Apply;
            const first = store.map[apply.suffixes[0]].value as t.CallSuffix;
            if (first.args.length) {
                return setSelection(store, {
                    type: 'edit',
                    idx: first.args[0],
                    at: 'start',
                });
            } else {
                return setSelection(store, {
                    type: 'edit',
                    idx: apply.suffixes[0],
                    at: 'inner',
                });
            }
        }
    }
};

export const goLeft = (store: Store, path: Path) => {
    if (
        !path.length ||
        !store.selection?.idx ||
        store.selection.type !== 'edit'
    ) {
        return;
    }
    const current = store.map[store.selection.idx].value;
    if (current.type === 'CallSuffix') {
        if (store.selection.at === 'end') {
            if (current.args.length) {
                return setSelection(store, {
                    type: 'edit',
                    idx: current.args[current.args.length - 1],
                    at: 'end',
                });
            } else {
                return setSelection(
                    store,
                    {
                        type: 'edit',
                        idx: current.loc.idx,
                        at: 'inner',
                    },
                    undefined,
                    true,
                );
            }
        }
    }
    let lastIdx = path.length - 1;
    let last = path[lastIdx];
    while (last.type === 'Apply_target' && lastIdx > 0) {
        lastIdx--;
        last = path[lastIdx];
    }

    switch (last.type) {
        case 'Apply_suffix': {
            const apply = store.map[last.pid].value as t.Apply;
            if (last.suffix > 0) {
            }
            return;
        }
        case 'CallSuffix_args': {
            const call = store.map[last.pid].value as t.CallSuffix;
            if (last.arg > 0) {
                return setSelection(store, {
                    type: 'edit',
                    idx: call.args[last.arg - 1],
                    at: 'end',
                });
            }
            const prev = path[lastIdx - 1];
            if (prev.type === 'Apply_suffix') {
                const apply = store.map[prev.pid].value as t.Apply;
                if (prev.suffix > 0) {
                    return setSelection(store, {
                        type: 'edit',
                        idx: apply.suffixes[prev.suffix - 1],
                        at: 'end',
                    });
                }
                return setSelection(store, {
                    type: 'edit',
                    idx: apply.target,
                    at: 'end',
                });
            }
            return;
        }
    }
};
export const remove = (idx: number | null, path: Path, store: Store) => {
    const last = path[path.length - 1];
    switch (last.type) {
        case 'Apply_suffix': {
            const apply = getc(store, last.pid) as t.Apply;
            apply.suffixes = apply.suffixes.slice();
            apply.suffixes.splice(
                Math.min(apply.suffixes.length - 1, last.suffix),
                1,
            );
            const at = last.suffix;
            if (apply.suffixes.length === 0) {
                store.map[last.pid] = store.map[apply.target];
                delete store.map[apply.target];
                store.map[last.pid].value.loc.idx = last.pid;
                setSelection(
                    store,
                    {
                        type: 'edit',
                        idx: last.pid,
                        at: 'end',
                    },
                    [last.pid],
                );
                return;
            }
            setSelection(
                store,
                {
                    type: 'edit',
                    idx: at > 0 ? apply.suffixes[at - 1] : apply.target,
                    at: 'end',
                },
                [last.pid],
            );
            break;
        }
        case 'CallSuffix_args': {
            const call = getc(store, last.pid) as t.CallSuffix;
            if (
                (call.args.length === 1 && path.length > 1) ||
                (idx == null && call.args.length === 0)
            ) {
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
            if (idx == null) {
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
