import * as parsers from '../../generated/parser';
import * as t from '../../generated/type-map';
import * as to from '../../generated/to-map';
import {
    updateStore,
    Store,
    setSelection,
    nidx,
    Selection,
    StoreUpdate,
    UpdateMap,
    newBlank,
} from '../store/store';
import { LambdaChildren, Path } from '../generated/react-map';
import { lastChild } from './navigation';

export const handleOneComma = (store: Store, path: Path) => {
    const item = store.map[path.idx].value;
    if (item.type === 'CallSuffix') {
        if (
            path.cid < item.args.length ||
            (path.cid === 0 && item.args.length === 0)
        ) {
            const prev = setSelection(store, null);
            const item = store.map[path.idx].value as t.CallSuffix;
            console.log('clear selection');
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
                prev,
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
        console.log('has text');
        return false;
    }
    const item = store.map[idx].value;
    if (
        depth === 0 &&
        item.type === 'CallSuffix' &&
        ((item.args.length === 0 && cid === 0) || cid >= item.args.length)
    ) {
        console.log('ok rm call');
        removeSuffix(fullPath, depth, store, idx);
        return true;
    }
    if (depth === 1 && item.type === 'Larg' && cid === 2 && item.typ) {
        console.log('empty type annotation', item);
        const update: UpdateMap = {};
        update[idx] = {
            type: store.map[idx].type,
            value: { ...item, typ: null },
        } as t.Map[0];
        update[item.typ!.value] = null;
        const sel = lastChild(store, item.pat, []);
        if (sel) {
            updateStore(store, {
                map: update,
                selection: sel.sel,
            });
        }
        return true;
    }
    if (depth === 1 && item.type === 'Lambda') {
        const children = LambdaChildren(item);
        if (cid === children.length - 2) {
            // Replace the lambda with a blank
            const update: UpdateMap = {};
            update[idx] = {
                type: store.map[idx].type,
                value: newBlank(),
            } as t.Map[0];
            updateStore(store, {
                map: update,
                selection: { type: 'edit', idx, cid: 0, at: 'change' },
            });
            return true;
        } else {
            console.log('nope', cid, children);
        }
    }
    if (depth === 2 && item.type === 'Lambda') {
        if (cid === 0) {
            return false;
        }
        if (cid <= item.args.length) {
            const update: UpdateMap = {};
            update[idx] = {
                type: store.map[idx].type,
                value: {
                    ...item,
                    args: item.args.filter((_, i) => i !== cid - 1),
                },
                [item.args[cid - 1]]: null,
            } as t.Map[0];
            const sel: Selection | undefined =
                cid === 1
                    ? {
                          type: 'edit',
                          idx,
                          cid: 0,
                      }
                    : lastChild(store, item.args[cid - 2], [])?.sel;
            if (sel) {
                updateStore(store, {
                    map: update,
                    selection: sel,
                });
            }
            return true;
        }
    }
    if (depth === 1 && item.type === 'CallSuffix') {
        if (cid < item.args.length && item.args.length > 1) {
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
            const next = item.args.length > 1 ? Math.max(0, cid - 1) : 0;
            const sel: Selection | undefined =
                item.args.length > 1
                    ? lastChild(store, item.args[next], [])?.sel
                    : ({
                          type: 'edit',
                          at: 'end',
                          idx: idx,
                          cid: 0,
                      } as Selection);
            if (sel) {
                console.log('ok', store.selection, sel);
                updateStore(store, {
                    map: update,
                    selection: sel,
                });
            }
            return true;
        } else {
            removeSuffix(fullPath, depth, store, idx);
            return true;
        }
    }
};

function removeSuffix(
    fullPath: Path[],
    depth: number,
    store: Store,
    idx: number,
) {
    const ppath = fullPath[fullPath.length - 1 - depth - 1];
    const parent = store.map[ppath.idx].value as t.Apply;
    const newSuffixes = parent.suffixes.filter((id) => id !== idx);
    const update: UpdateMap = {};
    // TODO: recursively traverse the suffix to remove any node children
    update[idx] = null;
    if (newSuffixes.length === 0) {
        update[ppath.idx] = {
            type: store.map[ppath.idx].type,
            value: {
                ...store.map[parent.target].value,
                loc: {
                    ...store.map[parent.target].value.loc,
                    idx: ppath.idx,
                },
            },
        } as t.Map[0];
        update[parent.target] = null;
        updateStore(store, {
            map: update,
            selection: {
                type: 'edit',
                idx: ppath.idx,
                cid: 0,
                at: 'end',
            },
        });
    } else {
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
}

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
    if (
        item.type === 'Apply' &&
        path.cid > 0 &&
        path.cid < item.suffixes.length
    ) {
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

const handleColon = (
    store: Store,
    path: Path,
    text: string,
    depth: number,
    fullPath: Path[],
) => {
    const item = store.map[path.idx].value;
    const map: t.Map = {};
    if (depth === 1 && item.type === 'Larg') {
        if (!item.typ) {
            const blank = to.add(map, { type: 'Type', value: newBlank() });
            map[path.idx] = {
                type: store.map[path.idx].type,
                value: {
                    ...item,
                    typ: { inferred: true, value: blank },
                },
            } as t.Map[0];
            updateStore(store, {
                map,
                selection: {
                    type: 'edit',
                    at: 'change',
                    idx: blank,
                    cid: 0,
                },
            });
            return true;
        } else {
            setSelection(store, {
                type: 'edit',
                at: 'start',
                idx: item.typ.value,
                cid: 0,
            });
            return true;
        }
    }
};

const handleOpenParen = (store: Store, path: Path, text: string) => {
    const mapped = store.map[path.idx];
    if (mapped.value.type === 'Apply') {
        const prev = setSelection(store, null);
        const mapped = store.map[path.idx] as t.MapApply;
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
            prev,
        });
        return true;
    }
    if (mapped.type === 'Expression' && text.trim() === 'fn') {
        const map: t.Map = {};
        const lambda = to.Lambda(parsers.parseLambda('fn () => _'), map);
        map[path.idx] = {
            type: 'Expression',
            value: { ...lambda, loc: { ...lambda.loc, idx: path.idx } },
        };
        updateStore(store, {
            map,
            selection: {
                type: 'edit',
                idx: path.idx,
                cid: 1,
                at: 'change',
            },
        });
        return true;
    }
    if (
        mapped.type === 'Expression' &&
        (mapped.value.type === 'Identifier' || mapped.value.type === 'Number')
    ) {
        const prev = setSelection(store, null);
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
            prev,
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
    ':': handleColon,
    Backspace: handleBackspace,
};
