// Ok folks

export type Grams = { [key: string]: TopGram };
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
    | { type: 'drill'; inner: Gram }
    // | { type: 'withDefault'; inner: Gram; default: any }
    | { type: 'or'; options: Gram[] }
    | { type: 'named'; name: string; inner: Gram }
    | { type: 'star' | 'plus' | 'optional'; item: Gram }
    // This produces a {inferred: boolean, inner: T}
    // And it expects an `inferSomeThing` function to exist somewhere??
    | { type: 'inferrable'; item: Gram }
    | Gram[];

export type TopGram = Gram | { type: 'tagged'; tags: string[]; inner: Gram };
