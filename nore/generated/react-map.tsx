

import React from 'react';
import {parse} from './grammar';
import * as t from './type-map';
import * as c from './atomConfig';
import { updateStore, Store, useStore } from '../editor/store/store';
import {ContentEditable} from './ContentEditable';

export const AtomEdit = <T,>({value, idx, config, store, path}: {value: T, idx: number, store: Store, config: c.AtomConfig<T>, path: Path[]}) => {
    const [edit, setEdit] = React.useState(() => config.toString(value));
    return <ContentEditable value={edit} onChange={value => setEdit(value)} onBlur={() => {
        updateStore(store, {map: {[idx]: {
            type: store.map[idx].type,
            value: config.fromString(edit, store.map)
        } as t.Map[0]}})
    }} />
}

export const Blank = ({idx, store, path}: {idx: number, store: Store, path: Path[]}) => {
    const item = useStore(store, idx) as t.Blank;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Blank} path={path.concat([{type: 'Blank', idx: item.loc.idx, path: null}])} />
}


export type Path = {type: 'Number', idx: number, path: null | {at: 'before' | 'after'}  | {at: 'num'} | {at: 'kind'}}
| {type: 'Boolean', idx: number, path: null | {at: 'before' | 'after'}  | {at: 'value'}}
| {type: 'PIdentifier', idx: number, path: null | {at: 'before' | 'after'}  | {at: 'text'} | {at: 'ref'}}
| {type: 'Identifier', idx: number, path: null | {at: 'before' | 'after'}  | {at: 'text'} | {at: 'ref'}}
| {type: 'UInt', idx: number, path: null | {at: 'before' | 'after'} }
| {type: 'LocalHash', idx: number, path: null | {at: 'before' | 'after'} }
| {type: 'IdHash', idx: number, path: null | {at: 'before' | 'after'} }
| {type: 'Apply', idx: number, path: null | {at: 'before' | 'after'}  | {at: 'suffix', suffix: number} | {at: 'target'}}
| {type: 'CallSuffix', idx: number, path: null | {at: 'before' | 'after'}  | {at: 'args', arg: number}}
| {type: 'Lambda', idx: number, path: null | {at: 'before' | 'after'} }
| {type: 'Larg', idx: number, path: null | {at: 'before' | 'after'} }
| {type: 'Blank', idx: number, path: null};

export const Number = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Number;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Number} path={path.concat([{type: 'Number', path: []}])} />;
}

export const Boolean = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Boolean;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Boolean} path={path.concat([{type: 'Boolean', path: []}])} />;
}

export const PIdentifier = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.PIdentifier;
    return <AtomEdit value={item} idx={idx} store={store} config={c.PIdentifier} path={path.concat([{type: 'PIdentifier', path: []}])} />;
}

export const Identifier = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Identifier;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Identifier} path={path.concat([{type: 'Identifier', path: []}])} />;
}

export const UInt = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.UInt;
    return <>{item.raw}</>;
}

export const LocalHash = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.LocalHash;
    return <span>#[:<UInt idx={item.sym} store={store} path={path.concat([{"type":"LocalHash","path":[{"type":"named","name":"sym"}]}])} />]</span>;
}

export const IdHash = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.IdHash;
    return <span>#[h{item.hash}{item.idx ? <span>.<UInt idx={item.idx} store={store} path={path.concat([{"type":"IdHash","path":[{"type":"named","name":"idx"}]}])} /></span> : null}]</span>;
}

export const Apply = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Apply;
    return <span><Applyable idx={item.target} store={store} path={path.concat([{"type":"Apply","path":[{"type":"named","name":"target"}]}])} />{item.suffixes.map((suffix, i) => <Suffix idx={suffix} store={store} path={path.concat([{"type":"Apply","path":[{"type":"named","name":"suffix"},{"type":"args","i":"i","key":"item"}]}])} />)}</span>;
}

export const CallSuffix = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.CallSuffix;
    return <span>({item.args.map((arg, i) => <Expression idx={arg} store={store} path={path.concat([{"type":"CallSuffix","path":[{"type":"named","name":"args"},{"type":"args","key":"item","i":"i"}]}])} />)})</span>;
}

export const Lambda = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Lambda;
    return <span>fn({item.args.map((arg, i) => <Larg idx={arg} store={store} path={path.concat([{"type":"Lambda","path":[{"type":"named","name":"args"},{"type":"args","key":"item","i":"i"}]}])} />)})<>what inferrable</>=&gt;<Expression idx={item.body} store={store} path={path.concat([{"type":"Lambda","path":[{"type":"named","name":"body"}]}])} /></span>;
}

export const Larg = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Larg;
    return <span><Pattern idx={item.pat} store={store} path={path.concat([{"type":"Larg","path":[{"type":"named","name":"pat"}]}])} /><>what inferrable</></span>;
}

export const Applyable = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Applyable;
    if (item.type === "Number") {
        return <Number idx={idx} store={store} path={path} />;
    }

    if (item.type === "Boolean") {
        return <Boolean idx={idx} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Type = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Type;
    if (item.type === "Number") {
        return <Number idx={idx} store={store} path={path} />;
    }

    if (item.type === "Boolean") {
        return <Boolean idx={idx} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Atom = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Atom;
    if (item.type === "Number") {
        return <Number idx={idx} store={store} path={path} />;
    }

    if (item.type === "Boolean") {
        return <Boolean idx={idx} store={store} path={path} />;
    }

    if (item.type === "PIdentifier") {
        return <PIdentifier idx={idx} store={store} path={path} />;
    }

    if (item.type === "Identifier") {
        return <Identifier idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Pattern = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Pattern;
    if (item.type === "PIdentifier") {
        return <PIdentifier idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Expression = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Expression;
    if (item.type === "Apply") {
        return <Apply idx={idx} store={store} path={path} />;
    }

    if (item.type === "Number" || item.type === "Boolean" || item.type === "Identifier") {
        return <Applyable idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Suffix = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Suffix;
    if (item.type === "CallSuffix") {
        return <CallSuffix idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}
