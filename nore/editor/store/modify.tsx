import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import {
    parseApplyable,
    parseExpression,
    parseSuffix,
} from '../../generated/parser';
import {
    Store,
    Path,
    nidx,
    newBlank,
    setSelection,
    notify,
    addBlank,
    getc,
} from './store';
import { Level } from '../elements/AtomEdit';

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

export function addCallSuffix(path: Path, store: Store, level: string) {
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

export function addArg(
    store: Store,
    last: { type: 'CallSuffix_args'; arg: number; pid: number },
) {
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
