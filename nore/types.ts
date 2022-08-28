// Ok folks

export type Grams = { [key: string]: Or | TopGram | Gram[] };
export type Gram =
    | {
          type: 'args';
          sep?: string;
          bounds?: [string, string];
          item: Gram;
          last?: Gram;
      }
    // if it starts with a Capital letter, it's a named grammar
    // if it starts with $ and then a capital, then it's the string value of the named grammar
    // otherwise, it's a literal
    | string

    // If the contents are empty, then take the other named thing in this story, and just use that.
    // hrmmmmmm do I want like a `drill` instead?
    // so it ends up being `main:Main rest:Main_Others?`?
    // | { type: 'drill'; inner: Gram }
    // ^ Yeah ok, I don't think I need drill

    // | { type: 'withDefault'; inner: Gram; default: any }
    | Or
    | { type: 'named'; name: string; inner: Gram }
    | { type: 'star' | 'plus' | 'optional'; item: Gram }
    // This produces a {inferred: boolean, inner: T}
    // And it expects an `inferSomeThing` function to exist somewhere??
    | { type: 'inferrable'; item: Gram }
    // // I need a way to regex? Or something?
    // | Binops
    // // This requires that (target + any number of suffixes) matches the same "tag" as the suffixes.
    // | Suffixes
    // | {
    //       type: 'ref';
    //       kind: string; // will be passed to the autocomplete fn
    //       pattern: string; // regex or similar
    //       hash: Gram;
    //   }
    | Gram[];
export type Or = { type: 'or'; options: Gram[] };

export type Binops = {
    type: 'binops';
    inner: Gram;
    precedence: string[][];
    chars: string;
    exclude: string[];
};
export type Suffixes = { type: 'suffixes'; target: Gram; suffix: Gram };

export type TopGram = {
    type: 'tagged';
    tags: string[];
    inner: Gram[] | Binops | Suffixes;
};
