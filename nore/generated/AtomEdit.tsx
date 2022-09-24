import React from 'react';
import { parse } from './grammar';
import * as parsers from './parser';
import * as t from './type-map';
import * as c from './atomConfig';
import * as to from './to-map';
import { updateStore, Store, useStore } from '../editor/store/store';
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
    const [edit, setEdit] = React.useState(() => config.toString(value));
    const commit = React.useCallback(() => {
        const type = store.map[idx].type;
        console.log(path, type);
        try {
            // @ts-ignore
            const parsed = parsers['parse' + type](edit);
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
    return (
        <ContentEditable
            value={edit}
            onChange={(value) => setEdit(value)}
            onBlur={() => {
                commit();
            }}
            style={{
                color: pathColor(path),
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    commit();
                }
            }}
        />
    );
};
