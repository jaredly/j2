

import React from 'react';
import {parse} from './grammar';
import * as t from './types';

export type AtomConfig<T> = {
    toString: (item: T) => string;
    fromString: (str: string) => T;
}

export const AtomEdit = <T,>({value, config}: {value: T, config: AtomConfig<T>}) => {
    return <input value={config.toString((value))} />
}

export const Number = ({item}: {item: t.Number}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const RawNumber = ({item}: {item: t.RawNumber}): JSX.Element => {
    return <>{item}</>;
}

export const Boolean = ({item}: {item: t.Boolean}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const Identifier = ({item}: {item: t.Identifier}): JSX.Element => {
    return <AtomEdit value={item}/>;
}

export const IdText = ({item}: {item: t.IdText}): JSX.Element => {
    return <>{item}</>;
}

export const HashText = ({item}: {item: t.HashText}): JSX.Element => {
    return <>{item}</>;
}

export const UIntLiteral = ({item}: {item: t.UIntLiteral}): JSX.Element => {
    return <>{item}</>;
}

export const UInt = ({item}: {item: t.UInt}): JSX.Element => {
    return <UIntLiteral item={item.raw} />;
}

export const LocalHash = ({item}: {item: t.LocalHash}): JSX.Element => {
    return <span>#[:<UInt item={item.sym} />]</span>;
}

export const IdHash = ({item}: {item: t.IdHash}): JSX.Element => {
    return <span>#[h<HashText item={item.hash} />{item.idx ? <span><span>.<UInt item={item.idx} /></span></span> : null}]</span>;
}

export const Apply = ({item}: {item: t.Apply}): JSX.Element => {
    return <span><Applyable item={item.target} />{item.suffixes.map((item, key) => <Suffix item={item} />)}</span>;
}

export const CallSuffix = ({item}: {item: t.CallSuffix}): JSX.Element => {
    return <span>({item.args.map(child => <Expression item={child} />)})</span>;
}

export const _ = ({item}: {item: t._}): JSX.Element => {
    return <>{item}</>;
}
