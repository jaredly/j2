
So if I'm saying that you have to TypeApply a generic in order to then use it in an Apply
...
what does that mean for binops?

`//:value:+: <A: int, B: int>(a: A, b: B) => A + B`

like
`2 + 3` might end up as `(+)<2, 3>(2, 3)` but how would it transform back without being lossy?
but if binops can't be generic, that's super annoying.
the root problem is that `2 + 3` just doesn't have syntactic space for locking down the generic types.
Does that mean I need a whole nother TAST node? that's a little annoying.

So the rules of it are:
if it's generic, it has to be 2 arg generic e.g. `<A, B>(a: A, b: B) => ...`. Otherwise ... it's "too complex for a binop". That's an error that happens at point of use by the way, because names can change.
OK and because it's a separate TAST node, we don't have to much with sometimes inferring stuff for normal apply.
That's nice.
