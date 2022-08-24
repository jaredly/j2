
# So, what's a reasonably simple way to build up this hullabaloo?

Getting binops to work at all is certainly a thing to tackle.
so like a basic math dealio?

And then, like separately,
a basic lambda dealio
maybe with ifs?







# So, I want my new grammar format to:

- generate the types of the (T?)Ast
- define Text -> (T?)Ast (peggy grammar + the transform functions)
- (T?)Ast -> Text (pretty-printer)
- (T?)Ast -> Structured Editor (React)

Howwww much do I care about alternative syntaxes?
I guesssss if I just make it so the alternative defintion produces the same generated Types,
then actually that's great? OK sounds fine to me.

how far can `inferrable` take me? maybe as much as I need to make this a true TAst?

the other big question mark, is with Atom/WithUnary/etc.

like
at the type level, I want

Expression = Apply | Switch | Number

but, to prevent left-recursion (which peggy doesn't like)
the grammar need to be

Expression = Apply
Apply = Atom Suffix*
Atmo = Switch | Number

hmmmmm so maybe all we need is auto-detection of left-recursion, and a way to ~fix it?

so also ... what about binops?
can I just lump those in with suffixes?
...

a + b.c - d.e

I might want some explicit support for binops? hmmm

so, in a counterpoint, maybe I /don't/ want binops to be "just fncalls"?
it's a little funky for them to jump back and forth.
and like, it's maybe a little convenient, but idk maybe not.

ok,
so we will need to do something special with precedence parsing ... of the binops
... and then printing I imagine? maybe? well I guess I'll have to do some fancy
un-recursing of the dealios anyway.
