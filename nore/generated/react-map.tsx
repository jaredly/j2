

import React from 'react';
import {parse} from './grammar';
import * as parsers from './parser';
import * as t from './type-map';
import * as c from './atomConfig';
import * as to from './to-map';
import { updateStore, Store, Selection, useStore } from '../editor/store/store';
import {ContentEditable} from './ContentEditable';
import {AtomEdit} from './AtomEdit';
import {ClickSide, Empty} from './ClickSide';

const selectionStyle = (selection: null | Selection, path: Path[], idx: number) => {
    if (selection?.idx === idx) {
        return {
            outline: '1px solid magenta',
        }
    }
    return {}
}

export const Blank = ({idx, store, path}: {idx: number, store: Store, path: Path[]}) => {
    const item = useStore(store, idx) as t.Blank;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Blank} path={path} />
}


export type Path = {cid: number, idx: number, punct: number};

export const Lambda = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Lambda;
    return <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>fn</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}> (</ClickSide>{item.args.length ? item.args.map((arg, i) => <React.Fragment key={i}><Larg idx={arg} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{i < item.args.length - 1 ? <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>, </ClickSide> : ''}</React.Fragment>) : <Empty path={path.concat([{cid: cid++, idx, punct}])} />}<ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>)</ClickSide>{item.res ? <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>:</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><Type idx={item.res.value} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span> : null}<ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}> =&gt;</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><Expression idx={item.body} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const Larg = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Larg;
    return <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <Pattern idx={item.pat} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{item.typ ? <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>:</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><Type idx={item.typ.value} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span> : null}
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const Number = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Number;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Number} path={path.concat({cid: -1, idx, punct})} />;
}

export const Boolean = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Boolean;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Boolean} path={path.concat({cid: -1, idx, punct})} />;
}

export const PIdentifier = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.PIdentifier;
    return <AtomEdit value={item} idx={idx} store={store} config={c.PIdentifier} path={path.concat({cid: -1, idx, punct})} />;
}

export const Identifier = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Identifier;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Identifier} path={path.concat({cid: -1, idx, punct})} />;
}

export const UInt = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.UInt;
    return <>{item.raw}</>;
}

export const LocalHash = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.LocalHash;
    return <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 3}])}>#[:</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><UInt idx={item.sym} store={store} path={path.concat([{cid: cid++, idx, punct}])} /><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> ]</ClickSide>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const IdHash = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.IdHash;
    return <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 3}])}>#[h</ClickSide> {item.hash}{item.idx ? <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>.</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><UInt idx={item.idx} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span> : null}<ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> ]</ClickSide>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const Apply = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Apply;
    return <span style={selectionStyle(store.selection, path, idx)}><Applyable idx={item.target} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{item.suffixes.map((suffix, i) => <React.Fragment key={i}><Suffix idx={suffix} store={store} path={path.concat([{cid: cid++, idx, punct}])} /></React.Fragment>)}</span>;
}

export const CallSuffix = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.CallSuffix;
    return <span>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>(</ClickSide>{item.args.length ? item.args.map((arg, i) => <React.Fragment key={i}><Expression idx={arg} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{i < item.args.length - 1 ? <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>, </ClickSide> : ''}</React.Fragment>) : <Empty path={path.concat([{cid: cid++, idx, punct}])} />}<ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>)</ClickSide>
            <Empty path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const Expression = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Expression;
    if (item.type === "Lambda") {
        return <Lambda idx={idx} store={store} path={path} />;
    }

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
