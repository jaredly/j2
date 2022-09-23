

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
    return <AtomEdit value={item} store={store} config={c.Blank} path={path.concat([{type: 'Blank', idx: item.loc.idx}])} />
}

export const Number = ({item, store, path}: {item: t.Number, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'Number', idx: item.loc.idx}])
    return <AtomEdit value={item} store={store} config={c.Number} path={path} />;
}

export const Boolean = ({item, store, path}: {item: t.Boolean, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'Boolean', idx: item.loc.idx}])
    return <AtomEdit value={item} store={store} config={c.Boolean} path={path} />;
}

export const PIdentifier = ({item, store, path}: {item: t.PIdentifier, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'PIdentifier', idx: item.loc.idx}])
    return <AtomEdit value={item} store={store} config={c.PIdentifier} path={path} />;
}

export const Identifier = ({item, store, path}: {item: t.Identifier, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'Identifier', idx: item.loc.idx}])
    return <AtomEdit value={item} store={store} config={c.Identifier} path={path} />;
}

export const UInt = ({item, store, path}: {item: t.UInt, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'UInt', idx: item.loc.idx}])
    return <>{item.raw}</>;
}

export const LocalHash = ({item, store, path}: {item: t.LocalHash, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'LocalHash', idx: item.loc.idx}])
    return <span>#[:<UInt item={store.map[item.sym].value as t.UInt} store={store} path={path.concat([{"type":"named","name":"sym"}])} />]</span>;
}

export const IdHash = ({item, store, path}: {item: t.IdHash, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'IdHash', idx: item.loc.idx}])
    return <span>#[h{item.hash}{item.idx ? <span>.<UInt item={store.map[item.idx].value as t.UInt} store={store} path={path} /></span> : null}]</span>;
}

export const Apply = ({item, store, path}: {item: t.Apply, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'Apply', idx: item.loc.idx}])
    return <span><Applyable item={store.map[item.target].value as t.Applyable} store={store} path={path.concat([{"type":"named","name":"target"}])} />{item.suffixes.map((suffix, i) => <Suffix item={store.map[suffix].value as t.Suffix} store={store} path={path.concat([{"type":"named","name":"suffix"},{"type":"args","i":"i","key":"item"}])} />)}</span>;
}

export const CallSuffix = ({item, store, path}: {item: t.CallSuffix, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'CallSuffix', idx: item.loc.idx}])
    return <span>({item.args.map((arg, i) => <Expression item={store.map[arg].value as t.Expression} store={store} path={path.concat([{"type":"named","name":"args"},{"type":"args","key":"item","i":"i"}])} />)})</span>;
}

export const Lambda = ({item, store, path}: {item: t.Lambda, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'Lambda', idx: item.loc.idx}])
    return <span>fn({item.args.map((arg, i) => <Larg item={store.map[arg].value as t.Larg} store={store} path={path.concat([{"type":"named","name":"args"},{"type":"args","key":"item","i":"i"}])} />)})<>what inferrable</>=&gt;<Expression item={store.map[item.body].value as t.Expression} store={store} path={path.concat([{"type":"named","name":"body"}])} /></span>;
}

export const Larg = ({item, store, path}: {item: t.Larg, store: Store, path: Path}): JSX.Element => {
    path = path.concat([{type: 'Node', kind: 'Larg', idx: item.loc.idx}])
    return <span><Pattern item={store.map[item.pat].value as t.Pattern} store={store} path={path.concat([{"type":"named","name":"pat"}])} /><>what inferrable</></span>;
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

    if (item.type === "PIdentifier") {
        return <PIdentifier item={item} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Pattern = ({item, store, path}: {item: t.Pattern, store: Store, path: Path}): JSX.Element => {
    if (item.type === "PIdentifier") {
        return <PIdentifier item={item} store={store} path={path} />;
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
