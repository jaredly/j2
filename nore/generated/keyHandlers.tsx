import * as parsers from './parser';
import * as t from './type-map';
import * as to from './to-map';
import { updateStore, Store, setSelection, nidx } from '../editor/store/store';
import { Path } from './react-map';
import { lastChild } from './navigation';

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
const handleOpenParen = (store: Store, path: Path) => {
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
        const tidx = nidx();
        map[path.idx] = {
            type: 'Expression',
            value: {
                suffixes: [suffix],
                type: 'Apply',
                target: tidx,
                loc: { start: 0, end: 0, idx: path.idx },
            },
        };
        map[tidx] = {
            type: 'Applyable',
            value: {
                ...mapped.value,
                loc: { ...mapped.value.loc, idx: tidx },
            },
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

export const handleKey = (store: Store, path: Path[], key: string) => {
    if (!keyHandlers[key]) {
        return;
    }
    for (let i = path.length - 1; i >= 0; i--) {
        if (keyHandlers[key](store, path[i])) {
            return;
        }
    }
};

export const keyHandlers: {
    [key: string]: (store: Store, path: Path) => true | void;
} = {
    ',': handleOneComma,
    '(': handleOpenParen,
    ')': handleCloseParen,
};
