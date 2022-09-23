

import React from 'react';
import {parse} from './grammar';
import * as t from './type-map';
import * as c from './atomConfig';
import { Store } from '../editor/store/store';

export type Path = any;

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
}

export const AtomEdit = <T,>({value, config, store, path}: {value: T, store: Store, config: AtomConfig<T>, path: Path}) => {
    const [edit, setEdit] = React.useState(() => config.toString(value));
    return <input value={edit} onChange={evt => setEdit(evt.target.value)} />
}

export const Blank = ({item, store, path}: {item: t.Blank, store: Store, path: Path}) => {
    return <AtomEdit value={item} store={store} config={c.Blank} path={path.concat([{type: 'Blank'}])} />
}

export const Number = ({item, store, path}: {item: t.Number, store: Store, path: Path}): JSX.Element => {
    return <AtomEdit value={item} store={store} config={c.Number} path={path} />;
}

export const RawNumber = ({item, store, path}: {item: t.RawNumber, store: Store, path: Path}): JSX.Element => {
    return <>{item}</>;
}

export const Boolean = ({item, store, path}: {item: t.Boolean, store: Store, path: Path}): JSX.Element => {
    return <AtomEdit value={item} store={store} config={c.Boolean} path={path} />;
}

export const Identifier = ({item, store, path}: {item: t.Identifier, store: Store, path: Path}): JSX.Element => {
    return <AtomEdit value={item} store={store} config={c.Identifier} path={path} />;
}

export const IdText = ({item, store, path}: {item: t.IdText, store: Store, path: Path}): JSX.Element => {
    return <>{item}</>;
}

export const HashText = ({item, store, path}: {item: t.HashText, store: Store, path: Path}): JSX.Element => {
    return <>{item}</>;
}

export const UIntLiteral = ({item, store, path}: {item: t.UIntLiteral, store: Store, path: Path}): JSX.Element => {
    return <>{item}</>;
}

export const UInt = ({item, store, path}: {item: t.UInt, store: Store, path: Path}): JSX.Element => {
    return <>{item.raw}</>;
}

export const LocalHash = ({item, store, path}: {item: t.LocalHash, store: Store, path: Path}): JSX.Element => {
    return <span>#[:<UInt item={store.map[item.sym].value as t.UInt} store={store} path={path.concat([{"type":"named","name":"sym"}])} />]</span>;
}

export const IdHash = ({item, store, path}: {item: t.IdHash, store: Store, path: Path}): JSX.Element => {
    return <span>#[h{item.hash}{item.idx ? <span>.<UInt item={store.map[item.idx].value as t.UInt} store={store} path={path} /></span> : null}]</span>;
}

export const Apply = ({item, store, path}: {item: t.Apply, store: Store, path: Path}): JSX.Element => {
    return <span><Applyable item={store.map[item.target].value as t.Applyable} store={store} path={path} />{item.suffixes.map(suffix => <Suffix item={store.map[suffix].value as t.Suffix} store={store} path={path} />)}</span>;
}

export const CallSuffix = ({item, store, path}: {item: t.CallSuffix, store: Store, path: Path}): JSX.Element => {
    return <span>({item.args.map(arg => <Expression item={store.map[arg].value as t.Expression} store={store} path={path} />)})</span>;
}

export const _ = ({item, store, path}: {item: t._, store: Store, path: Path}): JSX.Element => {
    return <>{item}</>;
}

export const Applyable = ({item, store, path}: {item: t.Applyable, store: Store, path: Path}): JSX.Element => {
    if (item.type === "Number") {
        return <Number item={item} store={store} path={path} />;
    }

    if (item.type === "Boolean") {
        return <Boolean item={item} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Type = ({item, store, path}: {item: t.Type, store: Store, path: Path}): JSX.Element => {
    if (item.type === "Number") {
        return <Number item={item} store={store} path={path} />;
    }

    if (item.type === "Boolean") {
        return <Boolean item={item} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Atom = ({item, store, path}: {item: t.Atom, store: Store, path: Path}): JSX.Element => {
    if (item.type === "Number") {
        return <Number item={item} store={store} path={path} />;
    }

    if (item.type === "Boolean") {
        return <Boolean item={item} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Expression = ({item, store, path}: {item: t.Expression, store: Store, path: Path}): JSX.Element => {
    if (item.type === "Apply") {
        return <Apply item={item} store={store} path={path} />;
    }

    if (item.type === "Number" || item.type === "Boolean" || item.type === "Identifier") {
        return <Applyable item={item} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Suffix = ({item, store, path}: {item: t.Suffix, store: Store, path: Path}): JSX.Element => {
    if (item.type === "CallSuffix") {
        return <CallSuffix item={item} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}
