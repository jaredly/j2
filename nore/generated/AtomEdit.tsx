import React, { useLayoutEffect, useRef } from 'react';
import { idx, parse } from './grammar';
import * as parsers from './parser';
import * as t from './type-map';
import * as c from './atomConfig';
import * as to from './to-map';
import { updateStore, Store, useStore, newBlank } from '../editor/store/store';
import { ContentEditable } from './ContentEditable';
import { Path } from './react-map';

const colors: { [key: string]: string } = {
    Identifier: '#5bb6b7',
    PIdentifier: '#82f682',
    Number: '#4848a5',
    Expression: 'white',
};

const pathColor = (path: Path[]) => {
    for (let i = path.length - 1; i >= 0; i--) {
        const t = path[i].type;
        if (colors[t]) {
            return colors[t];
        }
    }
    return undefined;
};

export const AtomEdit = <T,>({
    value,
    idx,
    config,
    store,
    path,
}: {
    value: T;
    idx: number;
    store: Store;
    config: c.AtomConfig<T>;
    path: Path[];
}) => {
    const [edit, setEdit] = React.useState(null as null | string);
    const commit = React.useCallback(() => {
        const type = store.map[idx].type;
        // console.log(path, type);
        try {
            const parsed =
                // @ts-ignore
                edit?.length === 0 ? newBlank() : parsers['parse' + type](edit);
            // @ts-ignore
            const tomap = to[type];
            updateStore(store, {
                map: {
                    [idx]: {
                        type: type,
                        value: tomap(parsed, store.map),
                    } as t.Map[0],
                },
            });
        } catch (err) {
            console.error(err);
            setEdit(config.toString(value));
        }
    }, [edit, value, idx]);
    const ref = useRef(null as null | HTMLSpanElement);
    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (ref.current.textContent !== edit) {
            ref.current.textContent = edit;
        }
    }, [edit]);
    if (edit == null) {
        return (
            <span
                style={{
                    color: pathColor(path),
                    minHeight: '1.5em',
                    // minWidth: 10,
                    backgroundColor: 'rgba(255, 255, 0, 0.05)',
                }}
                onMouseDown={(evt) => {
                    setEdit(config.toString(value));
                }}
            >
                {config.toString(value)}
            </span>
        );
    }
    return (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            // onChange={(value) => setEdit(value)}
            onInput={(evt) => setEdit(evt.currentTarget.textContent!)}
            onBlur={() => {
                commit();
                setEdit(null);
            }}
            style={{
                color: pathColor(path),
                outline: 'none',
                minHeight: '1.5em',
                // minWidth: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    commit();
                    setEdit(null);
                }
                if (evt.key === ',') {
                    evt.preventDefault();
                    evt.stopPropagation();
                    console.log(path);
                    addArg(path, store);
                }
            }}
        />
    );
};

const addArg = (path: Path[], store: Store) => {
    for (let i = path.length - 1; i >= 0; i--) {
        const p = path[i];
        if (p.type === 'Lambda' && p.path?.at === 'args') {
            const arg = p.path.arg;
            const v = store.map[p.idx].value as t.Lambda;
            const pidx = idx.current++;
            const aidx = idx.current++;
            const update: t.Map = {
                [pidx]: {
                    type: 'Pattern',
                    value: {
                        type: 'Blank',
                        loc: { idx: pidx, start: 0, end: 0 },
                    },
                },
                [aidx]: {
                    type: 'Larg',
                    value: {
                        type: 'Larg',
                        loc: { idx: aidx, start: 0, end: 0 },
                        pat: pidx,
                        typ: null,
                    },
                },
                [p.idx]: {
                    type: store.map[p.idx].type,
                    value: {
                        ...v,
                        args: v.args
                            .slice(0, arg + 1)
                            .concat([aidx])
                            .concat(v.args.slice(arg + 1)),
                    },
                } as t.Map[0],
            };
            return updateStore(store, {
                map: update,
                selection: { idx: pidx, at: 'change', type: 'edit' },
            });
        }

        if (p.type === 'CallSuffix' && p.path?.at === 'args') {
            const arg = p.path.arg;
            const v = store.map[p.idx].value as t.CallSuffix;
            const pidx = idx.current++;
            const update: t.Map = {
                [pidx]: {
                    type: 'Expression',
                    value: {
                        type: 'Blank',
                        loc: { idx: pidx, start: 0, end: 0 },
                    },
                },
                [p.idx]: {
                    type: store.map[p.idx].type,
                    value: {
                        ...v,
                        args: v.args
                            .slice(0, arg + 1)
                            .concat([pidx])
                            .concat(v.args.slice(arg + 1)),
                    },
                } as t.Map[0],
            };
            return updateStore(store, {
                map: update,
                selection: { idx: pidx, at: 'change', type: 'edit' },
            });
        }
    }
};