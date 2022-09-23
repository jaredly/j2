

import React from 'react';
import {parse} from './grammar';
import * as t from './type-map';
import * as c from './atomConfig';

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
}

export const AtomEdit = <T,>({value, config, map}: {value: T, config: AtomConfig<T>, map: t.Map}) => {
    const [edit, setEdit] = React.useState(() => config.toString(value));
    return <input value={edit} onChange={evt => setEdit(evt.target.value)} />
}

export const Blank = ({item, map}: {item: t.Blank, map: t.Map}) => {
    return <>Blank</>
}

export const Number = ({item, map}: {item: t.Number, map: t.Map}): JSX.Element => {
    return <AtomEdit value={item} map={map} config={c.Number} />;
}

export const RawNumber = ({item, map}: {item: t.RawNumber, map: t.Map}): JSX.Element => {
    return <>{item}</>;
}

export const Boolean = ({item, map}: {item: t.Boolean, map: t.Map}): JSX.Element => {
    return <AtomEdit value={item} map={map} config={c.Boolean} />;
}

export const Identifier = ({item, map}: {item: t.Identifier, map: t.Map}): JSX.Element => {
    return <AtomEdit value={item} map={map} config={c.Identifier} />;
}

export const IdText = ({item, map}: {item: t.IdText, map: t.Map}): JSX.Element => {
    return <>{item}</>;
}

export const HashText = ({item, map}: {item: t.HashText, map: t.Map}): JSX.Element => {
    return <>{item}</>;
}

export const UIntLiteral = ({item, map}: {item: t.UIntLiteral, map: t.Map}): JSX.Element => {
    return <>{item}</>;
}

export const UInt = ({item, map}: {item: t.UInt, map: t.Map}): JSX.Element => {
    return <>{item.raw}</>;
}

export const LocalHash = ({item, map}: {item: t.LocalHash, map: t.Map}): JSX.Element => {
    return <span>#[:{item.sym}]</span>;
}

export const IdHash = ({item, map}: {item: t.IdHash, map: t.Map}): JSX.Element => {
    return <span>#[h{item.hash}{item.idx}]</span>;
}

export const Apply = ({item, map}: {item: t.Apply, map: t.Map}): JSX.Element => {
    return <>tagged</>;
}

export const CallSuffix = ({item, map}: {item: t.CallSuffix, map: t.Map}): JSX.Element => {
    return <>tagged</>;
}

export const _ = ({item, map}: {item: t._, map: t.Map}): JSX.Element => {
    return <>{item}</>;
}

export const Applyable = ({item, map}: {item: t.Applyable, map: t.Map}): JSX.Element => {
    if (item.type === "Number") {
        return <Number item={item} map={map} />;
    }

    if (item.type === "Boolean") {
        return <Boolean item={item} map={map} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} map={map} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} map={map} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Type = ({item, map}: {item: t.Type, map: t.Map}): JSX.Element => {
    if (item.type === "Number") {
        return <Number item={item} map={map} />;
    }

    if (item.type === "Boolean") {
        return <Boolean item={item} map={map} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} map={map} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} map={map} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Atom = ({item, map}: {item: t.Atom, map: t.Map}): JSX.Element => {
    if (item.type === "Number") {
        return <Number item={item} map={map} />;
    }

    if (item.type === "Boolean") {
        return <Boolean item={item} map={map} />;
    }

    if (item.type === "Identifier") {
        return <Identifier item={item} map={map} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} map={map} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Expression = ({item, map}: {item: t.Expression, map: t.Map}): JSX.Element => {
    if (item.type === "Apply") {
        return <Apply item={item} map={map} />;
    }

    if (item.type === "Number" || item.type === "Boolean" || item.type === "Identifier") {
        return <Applyable item={item} map={map} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} map={map} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}

export const Suffix = ({item, map}: {item: t.Suffix, map: t.Map}): JSX.Element => {
    if (item.type === "CallSuffix") {
        return <CallSuffix item={item} map={map} />;
    }

    if (item.type === "Blank") {
        return <Blank item={item} map={map} />;
    }

    throw new Error('Unexpected type ' + (item as any).type)
}
