// Generate types

import {
    change,
    check,
    EExtra,
    Gram,
    Grams,
    TGram,
    TopGram,
    transform,
    transformGram,
} from '../types';

export const generatePeg = (grammar: Grams) => {
    const lines: { name: string; defn: string }[] = [];
    const tags: { [name: string]: string[] } = {};
    for (const [name, egram] of Object.entries(grammar)) {
        const gram: TGram<never> = transformGram<never>(egram, check, change);
        if (gram.type === 'or') {
            lines.push({ name, defn: gramToPeg(gram) });
            continue;
        }
        if (gram.type === 'tagged') {
            gram.tags.forEach((tag) => {
                if (!tags[tag]) tags[tag] = [];
                tags[tag].push(name);
            });
        }
        if (gram.type === 'peggy') {
            lines.push({ name, defn: `$(${gram.raw})` });
            continue;
        }
        if (gram.type === 'derived') {
            lines.push({
                name,
                defn:
                    gramToPeg(gram.inner) +
                    ` {
                return {
                    type: '${name}',
                    raw: text(),
                    value: (${gram.derive})(text()),
                    loc: range(),
                }
            }`,
            });
            continue;
        }
        let defn = topGramToPeg(
            name,
            gram.type === 'sequence' ? gram.items : gram.inner,
        );
        lines.push({ name, defn });
    }
    Object.keys(tags).forEach((tag) => {
        lines.push({
            name: tag,
            defn: tags[tag].join(' / '),
        });
    });
    return lines.map(({ name, defn }) => `${name} = ${defn}`).join('\n\n');
};

export const pegTransform = (vbl: string, gram: Gram<never>): string => {
    switch (gram.type) {
        case 'optional':
            return `${vbl} ? ${pegTransform(vbl, gram.item)} : null`;
        case 'literal':
        case 'literal-ref':
        case 'ref':
        case 'or':
            return vbl;
        case 'inferrable':
            return `${vbl} ? {inferred: false, value: ${vbl}} : {inferred: true, value: undefined}`;
        case 'args':
            return vbl;
        case 'derived':
            return `{
                raw: ${vbl},
                value: (${gram.derive})(${vbl})
            }`;
        // Gotta be only one non-literal folks
        case 'sequence': {
            const first = gram.items.findIndex(
                (item) =>
                    item.type !== 'literal' && item.type !== 'literal-ref',
            );
            if (first === -1) {
                return `":bad news bears:"`;
            }
            return pegTransform(`${vbl}[${first}]`, gram.items[first]);
        }
        default:
            throw new Error(`Not impl ${gram.type}`);
    }
};

export const topGramToPeg = (
    name: string,
    gram: TopGram<never>['inner'],
): string => {
    if (Array.isArray(gram)) {
        const named: string[] = [];
        gram.forEach((item) => {
            if (item.type === 'named') {
                named.push(
                    `${item.name}: ${pegTransform(item.name, item.inner)}`,
                );
            }
        });
        return (
            gramToPeg({ type: 'sequence', items: gram }) +
            ` {
            return { type: '${name}', ${named.join(', ')}, loc: range() }
        }`
        );
    }
    if (gram.type === 'suffixes') {
        return `target:${gramToPeg(gram.target)} suffixes:${gramToPeg(
            gram.suffix,
        )}* {
            if (!suffixes.length) {
                return target
            }
            return {type: '${name}', target, suffixes, loc: range()}
        }`;
    }
    throw new Error('not yet');
};

export const sequenceToPeg = (grams: Gram<never>[]): string => {
    return grams.map(gramToPeg).join(' ');
};

export const gramToPeg = (gram: Gram<never>): string => {
    switch (gram.type) {
        case 'sequence': {
            return sequenceToPeg(gram.items);
        }
        case 'derived':
            return gramToPeg(gram.inner);
        case 'literal':
            return `"${gram.value}"`;
        case 'literal-ref':
        case 'ref':
            return gram.id;
        case 'args': {
            return (
                '(' +
                [
                    `"${gram.bounds ? gram.bounds[0] : '('}"`,
                    `first:${gramToPeg(gram.item)}?`,
                    '_',
                    `rest:(_ ',' _ @${gramToPeg(gram.item)})*`,
                    `_ ','? _`,
                    gram.last ? `last:(${gramToPeg(gram.last)})` : '',
                    `"${gram.bounds ? gram.bounds[1] : ')'}"`,
                ].join(' ') +
                `
            { return [
                ...first ? [first] : [],
                ...rest,
            ]}
            )`
            );
        }
        case 'or': {
            return gram.options.map(gramToPeg).join(' / ');
        }
        case 'named':
            switch (gram.inner.type) {
                case 'optional':
                case 'inferrable':
                case 'ref':
                case 'star':
                case 'literal-ref':
                case 'plus':
                    return `${gram.name}:${gramToPeg(gram.inner)}`;
            }
            return `${gram.name}:(${gramToPeg(gram.inner)})`;
        case 'star':
            return `(${gramToPeg(gram.item)})*`;
        case 'plus':
            return `(${gramToPeg(gram.item)})+`;
        case 'optional':
        case 'inferrable':
            return `(${gramToPeg(gram.item)})?`;
    }
};
