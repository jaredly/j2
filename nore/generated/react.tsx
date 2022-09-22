
import React from 'react';
import {parse} from './grammar';
import * as t from './types';

export const AtomEdit = ({value}: {value: string}) => {
    return <input value={value} />
}

export const Number = ({item}: {item: t.Number}): JSX.Element => {
    return <><RawNumber item={item.num.raw} />{item.kind ? <>{item.kind}</> : null}</>;
}

export const RawNumber = ({item}: {item: t.RawNumber}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const Boolean = ({item}: {item: t.Boolean}): JSX.Element => {
    return <>{item.value}</>;
}

export const Identifier = ({item}: {item: t.Identifier}): JSX.Element => {
    return <><IdText item={item.text} />{item.ref ? <>{item.ref}</> : null}</>;
}

export const IdText = ({item}: {item: t.IdText}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const HashText = ({item}: {item: t.HashText}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const UIntLiteral = ({item}: {item: t.UIntLiteral}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const UInt = ({item}: {item: t.UInt}): JSX.Element => {
    return <UIntLiteral item={item.raw} />;
}

export const LocalHash = ({item}: {item: t.LocalHash}): JSX.Element => {
    return <>#[:<UInt item={item.sym} />]</>;
}

export const IdHash = ({item}: {item: t.IdHash}): JSX.Element => {
    return <>#[h<HashText item={item.hash} />{item.idx ? <><>.<UInt item={item.idx} /></></> : null}]</>;
}

export const Apply = ({item}: {item: t.Apply}): JSX.Element => {
    return <><Applyable item={item.target} />{item.suffixes.map((item, key) => <Suffix item={item} />)}</>;
}

export const CallSuffix = ({item}: {item: t.CallSuffix}): JSX.Element => {
    return <>({item.args.map(child => <Expression item={child} />)})</>;
}

export const _ = ({item}: {item: t._}): JSX.Element => {
    return <AtomEdit value={item}/>;
}
