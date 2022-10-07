import * as parsers from '../../generated/parser';
import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import {
    updateStore,
    Store,
    setSelection,
    nidx,
    Selection,
} from '../store/store';
import { Path } from '../generated/react-map';
import { firstChild, lastChild } from './navigation';

export const handleOneComma = (store: Store, path: Path) => {
    const item = store.map[path.idx].value;
    if (item.type === 'CallSuffix') {
        if (
            path.cid < item.args.length ||
            (path.cid === 0 && item.args.length === 0)
        ) {
            const update: t.Map = {};
            const expr = to.Expression(parsers.parseExpression('_'), update);
            update[expr.loc.idx] = { type: 'Expression', value: expr };
            update[path.idx] = {
                type: store.map[path.idx].type,
                value: {
                    ...item,
                    args: [
                        ...item.args.slice(0, path.cid + 1),
                        expr.loc.idx,
                        ...item.args.slice(path.cid + 1),
                    ],
                },
            } as t.Map[0];
            updateStore(store, {
                map: update,
                selection: {
                    type: 'edit',
                    at: 'change',
                    idx: expr.loc.idx,
                    cid: 0,
                },
            });
            return true;
        }
    }
    if (item.type === 'Lambda') {
        if (
            path.cid <= item.args.length ||
            (item.args.length === 0 && path.cid === 1)
        ) {
            const update: t.Map = {};
            const larg = to.Larg(parsers.parseLarg('_'), update);
            update[larg.loc.idx] = { type: 'Larg', value: larg };
            update[path.idx] = {
                type: store.map[path.idx].type,
                value: {
                    ...item,
                    args: item.args.concat([larg.loc.idx]),
                },
            } as t.Map[0];
            updateStore(store, {
                map: update,
                selection: {
                    type: 'edit',
                    at: 'change',
                    idx: larg.pat,
                    cid: 0,
                },
            });
            // return {update, idx: larg.loc.idx};
            return true;
        }
        console.log('lo lam', path.cid, item.args.length);
    }
};

const handleBackspace = (
    store: Store,
    { idx, cid }: Path,
    text: string,
    depth: number,
    fullPath: Path[],
) => {
    if (text.length) {
        return false;
    }
    const item = store.map[idx].value;
    if (
        depth === 0 &&
        item.type === 'CallSuffix' &&
        item.args.length === 0 &&
        cid === 0
    ) {
        console.log('ok rm call');
        const ppath = fullPath[fullPath.length - 1 - depth - 1];
        const parent = store.map[ppath.idx].value as t.Apply;
        const newSuffixes = parent.suffixes.filter((id) => id !== idx);
        if (newSuffixes.length === 0) {
        } else {
            const update: t.Map = {};
            update[ppath.idx] = {
                type: store.map[ppath.idx].type,
                value: {
                    ...parent,
                    suffixes: newSuffixes,
                },
            } as t.Map[0];
            const at = lastChild(
                store,
                ppath.cid > 1 ? newSuffixes[ppath.cid - 2] : parent.target,
                [],
            );
            updateStore(store, { map: update, selection: at ? at.sel : null });
        }
        return true;
    }
    if (depth === 1 && item.type === 'CallSuffix') {
        if (cid < item.args.length) {
            const update: t.Map = {};
            update[idx] = {
                type: store.map[idx].type,
                value: {
                    ...item,
                    args: item.args
                        .slice(0, cid)
                        .concat(item.args.slice(cid + 1)),
                },
            } as t.Map[0];
            const next = item.args.length > 0 ? Math.max(0, cid - 1) : 0;
            const sel: Selection | undefined =
                item.args.length > 0
                    ? lastChild(store, item.args[next], [])?.sel
                    : ({
                          type: 'edit',
                          at: 'end',
                          idx: idx,
                          cid: 0,
                      } as Selection);
            if (sel) {
                updateStore(store, {
                    map: update,
                    selection: sel,
                });
            }
            return true;
        }
    }
};

const handleCloseParen = (store: Store, path: Path) => {
    const item = store.map[path.idx].value;
    if (item.type === 'Lambda') {
        if (path.cid <= item.args.length) {
            setSelection(store, {
                type: 'edit',
                idx: path.idx,
                cid: Math.max(item.args.length, 1) + 1,
            });
            return true;
        }
    }
    if (item.type === 'Apply' && path.cid > 0) {
        const last = lastChild(store, item.suffixes[path.cid], []);
        if (last) {
            setSelection(store, last.sel);
            return true;
        }
    }
    if (item.type === 'CallSuffix') {
        if (
            path.cid < item.args.length ||
            (path.cid === 0 && item.args.length === 0)
        ) {
            setSelection(store, {
                type: 'edit',
                idx: path.idx,
                cid: Math.max(item.args.length, 1),
            });
            return true;
        }
    }
};
const handleOpenParen = (store: Store, path: Path, text: string) => {
    const mapped = store.map[path.idx];
    console.log(path, mapped.type, mapped.value.type);
    if (mapped.value.type === 'Apply') {
        // we can add a callsuffix somewhere
        const map: t.Map = {};
        const callsuffix = to.CallSuffix(parsers.parseCallSuffix('(_)'), map);
        map[callsuffix.loc.idx] = { type: 'Suffix', value: callsuffix };
        map[path.idx] = {
            ...mapped,
            value: {
                ...mapped.value,
                suffixes: [
                    ...mapped.value.suffixes.slice(0, path.cid),
                    callsuffix.loc.idx,
                    ...mapped.value.suffixes.slice(path.cid),
                ],
            },
        } as t.Map[0];
        updateStore(store, {
            map,
            selection: {
                type: 'edit',
                idx: callsuffix.args[0],
                cid: 0,
                at: 'change',
            },
        });
        return true;
    }
    if (
        mapped.type === 'Expression' &&
        (mapped.value.type === 'Identifier' || mapped.value.type === 'Number')
    ) {
        const map: t.Map = {};
        const exp = to.Applyable(parsers.parseApplyable(text), map);
        const blank = to.add(map, {
            type: 'Expression',
            value: to.Expression(parsers.parseExpression('_'), map),
        });
        const suffix = to.add(map, {
            type: 'Suffix',
            value: {
                type: 'CallSuffix',
                args: [blank],
                loc: { start: 0, end: 0, idx: nidx() },
            },
        });
        // const tidx = nidx();
        map[path.idx] = {
            type: 'Expression',
            value: {
                suffixes: [suffix],
                type: 'Apply',
                target: exp.loc.idx,
                loc: { start: 0, end: 0, idx: path.idx },
            },
        };
        map[exp.loc.idx] = {
            type: 'Applyable',
            value: exp,
        };
        updateStore(store, {
            map,
            selection: {
                type: 'edit',
                idx: blank,
                cid: 0,
                at: 'change',
            },
        });
        return true;
    }
};

export const handleKey = (
    store: Store,
    path: Path[],
    key: string,
    text: string,
): boolean | void => {
    if (!keyHandlers[key]) {
        return;
    }
    for (let i = path.length - 1; i >= 0; i--) {
        const res = keyHandlers[key](
            store,
            path[i],
            text,
            path.length - 1 - i,
            path,
        );
        if (res != null) {
            return res;
        }
    }
};

export const keyHandlers: {
    [key: string]: (
        store: Store,
        path: Path,
        text: string,
        depth: number,
        fullPath: Path[],
    ) => boolean | void;
} = {
    ',': handleOneComma,
    '(': handleOpenParen,
    ')': handleCloseParen,
    Backspace: handleBackspace,
};
