
So, binops w/ multiple dispatch is a good thing, right?
lots of GLSL relies on it, very cool stuff.

Thinking about how `2 + 3` should get processed
and I wonder
how do we lock down `+`? (well we can hash, that's true)
I guess aliasing will work the same way?a
ALSO, for binops that have ... generic arguments. We decided
that they need to have either 1 generic (where one side fits)
or 2 generics (one on each side) right?
I can certainly start with that.
So
`let + = <A: int>(a: A, b: A) => 10`
OR
`let + = <A: int, B: int>(a: A, b: B) => 10`

ok and I guess binops can .. have ... hashes.
I might need like an 'abbreviated hash' something, which
ties into aliases?
b/c I can't just add a string suffix onto binops.
how bout `#[:prefix]`?
