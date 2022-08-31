// Ok folks

export type GramDef<Extra> =
    | Or<Extra>
    | TopGram<Extra>
    | Derived<Extra>
    | Gram<Extra>[]
    | { type: 'peggy'; raw: string };

export type Grams = {
    [key: string]: GramDef<EExtra>;
};
export type Derived<Extra> = {
    type: 'derived';
    inner: Gram<Extra>;
    typeName: string;
    derive: (raw: string) => any;
};
export type Gram<Extra> =
    | {
          type: 'args';
          sep?: string;
          bounds?: [string, string];
          item: Gram<Extra>;
          last?: Gram<Extra>;
      }
    | Derived<Extra>

    // If the contents are empty, then take the other named thing in this story, and just use that.
    // hrmmmmmm do I want like a `drill` instead?
    // so it ends up being `main:Main rest:Main_Others?`?
    // | { type: 'drill'; inner: Recur }
    // ^ Yeah ok, I don't think I need drill

    // | { type: 'withDefault'; inner: Recur; default: any }
    | Or<Extra>
    | { type: 'named'; name: string; inner: Gram<Extra> }
    | { type: 'star' | 'plus' | 'optional'; item: Gram<Extra> }
    // This produces a {inferred: boolean, inner: T}
    // And it expects an `inferSomeThing` function to exist somewhere??
    | {
          type: 'inferrable';
          item: Gram<Extra>;
          //   infer: (locals: any, ctx: any) => any;
      }
    // // I need a way to regex? Or something?
    // | Binops
    // // This requires that (target + any number of suffixes) matches the same "tag" as the suffixes.
    // | Suffixes
    // | {
    //       type: 'ref';
    //       kind: string; // will be passed to the autocomplete fn
    //       pattern: string; // regex or similar
    //       hash: Recur;
    //   }
    | { type: 'literal'; value: string }
    | { type: 'literal-ref'; id: string }
    | { type: 'ref'; id: string }
    | { type: 'sequence'; items: Gram<Extra>[] }
    | Extra;

// // if it starts with a Capital letter, it's a named grammar
// // if it starts with $ and then a capital, then it's the string value of the named grammar
// // otherwise, it's a literal
// | string
// | Gram[];
export type Or<Extra> = { type: 'or'; options: Gram<Extra>[] };

export type Binops<Extra> = {
    type: 'binops';
    inner: Gram<Extra>;
    precedence: string[][];
    chars: string;
    exclude: string[];
};
export type Suffixes<Extra> = {
    type: 'suffixes';
    target: Gram<Extra>;
    suffix: Gram<Extra>;
};

export type EasyGram = Gram<EExtra>;
export type EExtra = string | EasyGram[];

export type TopGram<Extra> = {
    type: 'tagged';
    tags: string[];
    inner: Gram<Extra>[] | Binops<Extra> | Suffixes<Extra>;
};

export type TGram<B> =
    | Or<B>
    | TopGram<B>
    | Derived<B>
    | { type: 'peggy'; raw: string }
    | { type: 'sequence'; items: Gram<B>[] };

export const transformGram = <B>(
    gram: Grams['a'],
    check: (v: Gram<EExtra>) => v is EExtra,
    change: (a: EExtra) => Gram<B>,
): TGram<B> => {
    if (Array.isArray(gram)) {
        return {
            type: 'sequence',
            items: gram.map((g) => transform(g, check, change)),
        };
    }
    if (gram.type === 'peggy') {
        return gram;
    }
    if (gram.type === 'derived') {
        return {
            type: 'derived',
            inner: transform(gram.inner, check, change),
            typeName: gram.typeName,
            derive: gram.derive,
        };
    }
    if (gram.type === 'tagged') {
        return {
            type: 'tagged',
            tags: gram.tags,
            inner: Array.isArray(gram.inner)
                ? gram.inner.map((g) => transform(g, check, change))
                : gram.inner.type === 'binops'
                ? {
                      ...gram.inner,
                      inner: transform(gram.inner.inner, check, change),
                  }
                : gram.inner.type === 'suffixes'
                ? {
                      type: 'suffixes',
                      target: transform(gram.inner.target, check, change),
                      suffix: transform(gram.inner.suffix, check, change),
                  }
                : gram.inner,
        };
    }
    return {
        type: 'or',
        options: gram.options.map((g) => transform(g, check, change)),
    };
};

export const transform = <A, B>(
    gram: Gram<A>,
    check: (v: Gram<A>) => v is A,
    change: (a: A) => Gram<B>,
): Gram<B> => {
    if (check(gram)) {
        return change(gram);
    }
    switch (gram.type) {
        case 'sequence': {
            return {
                ...gram,
                items: gram.items.map((item) => transform(item, check, change)),
            };
        }
        case 'args': {
            return {
                ...gram,
                item: transform(gram.item, check, change),
                last: gram.last
                    ? transform(gram.last, check, change)
                    : undefined,
            };
        }
        case 'or': {
            return {
                ...gram,
                options: gram.options.map((item) =>
                    transform(item, check, change),
                ),
            };
        }
        case 'derived':
        case 'named': {
            return { ...gram, inner: transform(gram.inner, check, change) };
        }
        case 'inferrable': {
            return { ...gram, item: transform(gram.item, check, change) };
        }
        case 'star':
        case 'plus':
        case 'optional': {
            return { ...gram, item: transform(gram.item, check, change) };
        }
        default: {
            return gram;
        }
    }
};

export const check = (v: Gram<EExtra>): v is EExtra =>
    typeof v === 'string' || Array.isArray(v);
export const change = (v: EExtra): Gram<never> => {
    if (typeof v === 'string') {
        if (v.match(/^\$[A-Z]/)) {
            return { type: 'literal-ref', id: v.slice(1) };
        }
        if (v.match(/^[A-Z]/)) {
            return { type: 'ref', id: v };
        }
        return { type: 'literal', value: v };
    }
    return {
        type: 'sequence',
        items: v.map((b) => transform(b, check, change)),
    };
};
