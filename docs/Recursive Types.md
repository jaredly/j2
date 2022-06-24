hmmm not totally sure about this tbh.
How would I determine that e.g. L4 and L5 are equivalent?

```ts
type L1 = { t: 'nil' } | { t: 'cons'; l: L5 };
type L2 = { t: 'nil' } | { t: 'cons'; l: { t: 'nil' } | { t: 'cons'; l: L2 } };
type L3 =
    | { t: 'nil' }
    | {
          t: 'cons';
          l:
              | { t: 'nil' }
              | { t: 'cons'; l: { t: 'nil' } | { t: 'cons'; l: L4 } };
      };
type L4 =
    | { t: 'nil' }
    | {
          t: 'cons';
          l:
              | { t: 'nil' }
              | {
                    t: 'cons';
                    l:
                        | { t: 'nil' }
                        | { t: 'cons'; l: { t: 'nil' } | { t: 'cons'; l: L3 } };
                };
      };
type L5 =
    | { t: 'nil' }
    | {
          t: 'cons';
          l:
              | { t: 'nil' }
              | {
                    t: 'cons';
                    l:
                        | { t: 'nil' }
                        | { t: 'cons'; l: { t: 'nil' } | { t: 'cons'; l: L4 } };
                };
      };

const x = (m: L4): L5 => m;
const x1 = (m: L5): L4 => m;
```
