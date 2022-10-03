

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

export const BlankChildren = (item: t.Blank): Child[] => {
    return [{item: {idx: item.loc.idx, cid: 0, punct: 0}}];
}



export type Path = {cid: number, idx: number, punct: number};
export type Child = {item: Path, idx?: number};

export const Lambda = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Lambda;
    return <span>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>fn</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}> (</ClickSide>{item.args.length ? item.args.map((arg, i) => <React.Fragment key={i}><Larg idx={arg} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{i < item.args.length - 1 ? <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>, </ClickSide> : ''}</React.Fragment>) : <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />}<ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>)</ClickSide>{item.res ? <span>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>:</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><Type idx={item.res.value} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span> : null}<ClickSide path={path.concat([{cid, idx, punct: punct += 3}])}> =&gt;</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><Expression idx={item.body} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const LambdaChildren = (item: t.Lambda): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {cid: cid++, idx, punct}});
            punct += 2;
    
    punct += 2;
    item.args.forEach((arg, i) => {
        children.push({idx: arg, item: {cid: cid++, idx, punct}});
        if (i < item.args.length - 1) {
            punct += 2;
        }
    })
    if (!item.args.length) {
        children.push({item: {cid: cid++, idx, punct}});
    }
    punct += 1;
    if (item.res != null) {
        children.push({item: {cid: cid++, idx, punct}});
            punct += 1;
    punct += 1;
    children.push({idx: item.res.value, item: {cid: cid++, idx, punct}});
    children.push({item: {cid: cid++, idx, punct}});
    }
    punct += 3;
    punct += 1;
    children.push({idx: item.body, item: {cid: cid++, idx, punct}});
    children.push({item: {cid: cid++, idx, punct}});
    return children;
}

export const Larg = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Larg;
    return <span>
            
            <Pattern idx={item.pat} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{item.typ ? <span>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>:</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><Type idx={item.typ.value} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span> : null}
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const LargChildren = (item: t.Larg): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({idx: item.pat, item: {cid: cid++, idx, punct}});
    if (item.typ != null) {
        children.push({item: {cid: cid++, idx, punct}});
            punct += 1;
    punct += 1;
    children.push({idx: item.typ.value, item: {cid: cid++, idx, punct}});
    children.push({item: {cid: cid++, idx, punct}});
    }
    children.push({item: {cid: cid++, idx, punct}});
    return children;
}

export const Number = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Number;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Number} path={path} />;
}

export const NumberChildren = (item: t.Number): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {idx, punct, cid: cid++}});
    return children;
}

export const Boolean = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Boolean;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Boolean} path={path} />;
}

export const BooleanChildren = (item: t.Boolean): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {idx, punct, cid: cid++}});
    return children;
}

export const PIdentifier = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.PIdentifier;
    return <AtomEdit value={item} idx={idx} store={store} config={c.PIdentifier} path={path} />;
}

export const PIdentifierChildren = (item: t.PIdentifier): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {idx, punct, cid: cid++}});
    return children;
}

export const Identifier = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Identifier;
    return <AtomEdit value={item} idx={idx} store={store} config={c.Identifier} path={path} />;
}

export const IdentifierChildren = (item: t.Identifier): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {idx, punct, cid: cid++}});
    return children;
}

export const UInt = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.UInt;
    return <>{item.raw}</>;
}

export const UIntChildren = (item: t.UInt): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    // derived
    return children;
}

export const LocalHash = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.LocalHash;
    return <span>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 3}])}>#[:</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><UInt idx={item.sym} store={store} path={path.concat([{cid: cid++, idx, punct}])} /><ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}> ]</ClickSide>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const LocalHashChildren = (item: t.LocalHash): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {cid: cid++, idx, punct}});
            punct += 3;
    punct += 1;
    children.push({idx: item.sym, item: {cid: cid++, idx, punct}});
    punct += 2;
    children.push({item: {cid: cid++, idx, punct}});
    return children;
}

export const IdHash = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.IdHash;
    return <span>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 3}])}>#[h</ClickSide> {item.hash}{item.idx ? <span>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>.</ClickSide><ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}> </ClickSide><UInt idx={item.idx} store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span> : null}<ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}> ]</ClickSide>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const IdHashChildren = (item: t.IdHash): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({item: {cid: cid++, idx, punct}});
            punct += 3;
    punct += item.hash.length + 1;
    if (item.idx != null) {
                children.push({item: {cid: cid++, idx, punct}});
            punct += 1;
    punct += 1;
    children.push({idx: item.idx, item: {cid: cid++, idx, punct}});
    children.push({item: {cid: cid++, idx, punct}});
    }
    punct += 2;
    children.push({item: {cid: cid++, idx, punct}});
    return children;
}

export const Apply = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.Apply;
    return <span style={selectionStyle(store.selection, path, idx)}><Applyable idx={item.target} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{item.suffixes.map((suffix, i) => <React.Fragment key={i}><Suffix idx={suffix} store={store} path={path.concat([{cid: cid++, idx, punct}])} /></React.Fragment>)}</span>;
}

export const ApplyChildren = (item: t.Apply): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    children.push({idx: item.target, item: {cid: cid++, idx, punct}});
    item.suffixes.forEach((suffix, i) => {
        children.push({idx: suffix, item: {cid: cid++, idx, punct}});
    });
    return children;
}

export const CallSuffix = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    let cid = 0;
    let punct = 0;
    const item = useStore(store, idx) as t.CallSuffix;
    return <span>
            
            <ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>(</ClickSide>{item.args.length ? item.args.map((arg, i) => <React.Fragment key={i}><Expression idx={arg} store={store} path={path.concat([{cid: cid++, idx, punct}])} />{i < item.args.length - 1 ? <ClickSide path={path.concat([{cid, idx, punct: punct += 2}])}>, </ClickSide> : ''}</React.Fragment>) : <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />}<ClickSide path={path.concat([{cid, idx, punct: punct += 1}])}>)</ClickSide>
            <Empty store={store} path={path.concat([{cid: cid++, idx, punct}])} />
            </span>;
}

export const CallSuffixChildren = (item: t.CallSuffix): Child[] => {
    let cid = 0;
    let punct = 0;
    const idx = item.loc.idx;
    const children: Child[] = [];
    
    punct += 1;
    item.args.forEach((arg, i) => {
        children.push({idx: arg, item: {cid: cid++, idx, punct}});
        if (i < item.args.length - 1) {
            punct += 2;
        }
    })
    if (!item.args.length) {
        children.push({item: {cid: cid++, idx, punct}});
    }
    punct += 1;
    children.push({item: {cid: cid++, idx, punct}});
    return children;
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

export const ExpressionChildren = (item: t.Expression) => {
    if (item.type === "Lambda") {
        return LambdaChildren(item);
    }

    if (item.type === "Apply") {
        return ApplyChildren(item);
    }

    if (item.type === "Number" || item.type === "Boolean" || item.type === "Identifier") {
        return ApplyableChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
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

export const ApplyableChildren = (item: t.Applyable) => {
    if (item.type === "Number") {
        return NumberChildren(item);
    }

    if (item.type === "Boolean") {
        return BooleanChildren(item);
    }

    if (item.type === "Identifier") {
        return IdentifierChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
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

export const TypeChildren = (item: t.Type) => {
    if (item.type === "Number") {
        return NumberChildren(item);
    }

    if (item.type === "Boolean") {
        return BooleanChildren(item);
    }

    if (item.type === "Identifier") {
        return IdentifierChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
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

export const AtomChildren = (item: t.Atom) => {
    if (item.type === "Number") {
        return NumberChildren(item);
    }

    if (item.type === "Boolean") {
        return BooleanChildren(item);
    }

    if (item.type === "PIdentifier") {
        return PIdentifierChildren(item);
    }

    if (item.type === "Identifier") {
        return IdentifierChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
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

export const PatternChildren = (item: t.Pattern) => {
    if (item.type === "PIdentifier") {
        return PIdentifierChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
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

export const SuffixChildren = (item: t.Suffix) => {
    if (item.type === "CallSuffix") {
        return CallSuffixChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Node = ({idx, store, path}: {idx: number, store: Store, path: Path[]}): JSX.Element => {
    const item = useStore(store, idx) as t.Node;
    if (item.type === "Lambda") {
        return <Lambda idx={idx} store={store} path={path} />;
    }

    if (item.type === "Larg") {
        return <Larg idx={idx} store={store} path={path} />;
    }

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

    if (item.type === "UInt") {
        return <UInt idx={idx} store={store} path={path} />;
    }

    if (item.type === "LocalHash") {
        return <LocalHash idx={idx} store={store} path={path} />;
    }

    if (item.type === "IdHash") {
        return <IdHash idx={idx} store={store} path={path} />;
    }

    if (item.type === "Apply") {
        return <Apply idx={idx} store={store} path={path} />;
    }

    if (item.type === "CallSuffix") {
        return <CallSuffix idx={idx} store={store} path={path} />;
    }

    if (item.type === "Blank") {
        return <Blank idx={idx} store={store} path={path} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const NodeChildren = (item: t.Node) => {
    if (item.type === "Lambda") {
        return LambdaChildren(item);
    }

    if (item.type === "Larg") {
        return LargChildren(item);
    }

    if (item.type === "Number") {
        return NumberChildren(item);
    }

    if (item.type === "Boolean") {
        return BooleanChildren(item);
    }

    if (item.type === "PIdentifier") {
        return PIdentifierChildren(item);
    }

    if (item.type === "Identifier") {
        return IdentifierChildren(item);
    }

    if (item.type === "UInt") {
        return UIntChildren(item);
    }

    if (item.type === "LocalHash") {
        return LocalHashChildren(item);
    }

    if (item.type === "IdHash") {
        return IdHashChildren(item);
    }

    if (item.type === "Apply") {
        return ApplyChildren(item);
    }

    if (item.type === "CallSuffix") {
        return CallSuffixChildren(item);
    }

    if (item.type === "Blank") {
        return BlankChildren(item);
    }

    throw new Error('Unexpected type ' + (item as any).type)
}
