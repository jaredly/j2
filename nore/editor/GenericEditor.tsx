import React from 'react';
import { grammar } from '..';
import { parse } from '../generated/grammar';
import {
    Binops,
    change,
    check,
    Gram,
    Suffixes,
    TGram,
    transformGram,
} from '../types';

const parsed = parse('hello(1, 2u)', { startRule: 'Expression' });
type TRule =
    | Binops<never>
    | Suffixes<never>
    | { type: 'peggy'; raw: string }
    | { type: 'sequence'; items: Gram<never>[] };
const processed: {
    [key: string]: TRule;
} = {};
for (const [name, egram] of Object.entries(grammar)) {
    const simpler = transformGram<never>(egram, check, change);
    if (simpler.type === 'tagged') {
        processed[name] = Array.isArray(simpler.inner)
            ? { type: 'sequence', items: simpler.inner }
            : simpler.inner;
        // } else if (simpler.type === 'peggy') {
        // 	continue
        // } else {
        // 	processed[name] = simpler
    } else if (simpler.type === 'sequence' || simpler.type === 'peggy') {
        processed[name] = simpler;
    }
}

export const ShowRule = ({
    value,
    rule,
}: {
    value: any;
    rule: TRule | Gram<never>;
}): JSX.Element | null => {
    if (!rule || !rule.type) {
        return <span>No rules</span>;
    }
    if (rule.type === 'literal') {
        return <span>{rule.value}</span>;
    }
    if (rule.type === 'inferrable') {
        if (value.inferred) {
            return null;
        }
        return <ShowRule value={value.value} rule={rule.item} />;
    }
    if (rule.type === 'literal-ref') {
        return <span>{value}</span>;
    }
    if (rule.type === 'derived') {
        return <ShowRule value={value.raw} rule={rule.inner} />;
    }
    if (rule.type === 'or') {
        return <span>{value}</span>;
    }
    if (rule.type === 'args') {
        return (
            <span>
                {rule.bounds ? rule.bounds[0] : '('}
                {value.map((v: any, i: number) => (
                    <span key={i}>
                        <ShowRule value={v} rule={rule.item} />
                        {i < value.length - 1 ? ', ' : null}
                    </span>
                ))}
                {rule.bounds ? rule.bounds[1] : ')'}
            </span>
        );
    }
    if (rule.type === 'peggy') {
        return <span>{value}</span>;
    }
    if (rule.type === 'named') {
        return <ShowRule value={value[rule.name]} rule={rule.inner} />;
    }
    if (rule.type === 'ref') {
        if (typeof value === 'object' && 'type' in value) {
            return <ShowRule value={value} rule={processed[value.type]} />;
        }
        return <ShowRule value={value} rule={processed[rule.id]} />;
    }
    if (rule.type === 'sequence') {
        return (
            <span>
                {rule.items.map((item, i) => (
                    <ShowRule key={i} value={value} rule={item} />
                ))}
            </span>
        );
    }
    if (rule.type === 'suffixes') {
        return (
            <span>
                <ShowRule value={value.target} rule={rule.target} />
                {value.suffixes.map((s: any, i: number) => (
                    <ShowRule key={i} value={s} rule={rule.suffix} />
                ))}
            </span>
        );
    }
    return <span>{rule.type} nope</span>;
};

export const Editor = () => {
    return (
        <div>
            <ShowRule value={parsed} rule={processed[parsed.type]} />
        </div>
    );
};
