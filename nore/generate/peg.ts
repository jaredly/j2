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
            lines.push({ name, defn: gram.raw });
            continue;
        }
        let defn = topGramToPeg(
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
    const builtins: { [key: string]: string } = {
        UIntLiteral: '[0-9]+ { return +text() }',
    };
    Object.keys(builtins).forEach((k) => {
        lines.push({
            name: k,
            defn: builtins[k],
        });
    });
    return lines.map(({ name, defn }) => `${name} = ${defn}`).join('\n\n');
};

export const topGramToPeg = (gram: TopGram<never>['inner']): string => {
    if (Array.isArray(gram)) {
        return gramToPeg({ type: 'sequence', items: gram });
    }
    if (gram.type === 'suffixes') {
        return `target:${gramToPeg(gram.target)} suffixes:${gramToPeg(
            gram.suffix,
        )}+`;
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
        case 'literal':
            return `"${gram.value}"`;
        case 'literal-ref':
        case 'ref':
            return gram.id;
        case 'args': {
            return [
                `"${gram.bounds ? gram.bounds[0] : '('}"`,
                '_',
                `items:(${gramToPeg(gram.item)} _ ',' _)*`,
                `_ ',' _`,
                gram.last ? `last:(${gramToPeg(gram.last)})` : '',
                `"${gram.bounds ? gram.bounds[1] : ')'}"`,
            ].join(' ');
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
