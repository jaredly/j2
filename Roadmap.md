# Decisions we're making

PARSER GENERATOR
probably still peggy?
but like, with heavy preprocessing & stuff

//

Ok also, what about parser recovery.
Do we care a bunch about that?

Can I make my prototype with just a few features, and make sure that
- comments
- parser error recovery
- etc. work?
- structured editor generator. from the grammar.

How often would you want to edit the whole thing, such that you would introduce parser errors?
hmmmm

So, for text editing, I thought I was being clever with adding html attributes to stuff to identify their IDs.
It turns out, it was miserable.

Shouuuld I make a contenteditable
that ... knows how to ... manage changes and stuff?
no I think it's just better to lean into the structured editor side of things.
Fully control the drag & select, not falling back on text. Maintain a sane state.

BUT ok so that gets us to the other angle:
HOW do I represent invalid types?

https://lezer.codemirror.net/


TEXT REPRESENTATION

ok so what if:
at the top of each ... item, I have a mapping of name to ID?

Ok also, what about multiple names for a single item?
And how do you reconcile this stuff.

hmm what were those 'idx's about ... uniquely identifying source positions, right?

ok remind me why I need an AST that's separate from the typed tree ...

what if it's just the typed tree without types?

is it because I have type-ambiguous syntax?
am I overloading things?

ok anyway I think I want to target C++ too.



OHHHk so also in order to do macros, I need to be able to
represent the (typed?) AST in-house.
anyway the nice thing about macros is they're reified, right?
so even if what they produce is dependent on the local environment,
we're hashing what they output and fixing it in place.

ok yeah I think first blush is to let them operate post-typechecking.
And then we have a type-validation pass to make sure they didn't mess anything up.





issss there a way to write this language,
and then add type variables
and then add effect variables?
like
what kinds of things can I have, and what things can have effects.

A {value} has a type. A {lambda} knows what effects it would trigger, if called. An {expression} knows what effects it requires in the environment.

So, how about parameters?
- a Record can have a type parameter
- an Enum can have a type parameter
- a lambda can have a type parameter and an effect parameter
- what do multiple effect parameters do? they're positional, it's fine.






cannnn indexing desugar into like calling `[]` that's available on a record somewhere? That's kinda rad.
Would need to figure out the Slice type probably? like I assume it's just a tuple of ... ints? idk. Not sure how parsing would work otherwise. I guess ... is free real estate, as they say.

```ts
type Slicers<T, R> = {
	'[]': (T, slice) => R,
	'[]': (T, slice, slice) => R,
}

const IntSlicer = {
	'[]': (v: int, slice) => v + 1,
}
```

Ok yeah the deal is, the peggyjs parser doesn't have types associated.
So I need to build up the "parsed types" by hand.
OHWAIT jk I've definitely built autotypes and autowhatsits from the grammar. Awesome.

OK
so
(grammar -> ast w/ typescript types of it)
nowww I need a transformer, for the ast.
Can we just assume that ... one ast node maps to one tst node?
maybe I can just ... "declare" the kind of thing
that I'll map to.


CAN I
declarative the pretty-printer
in such a way
that I can infer the grammar?
OR
declarative the grammar
on the flip side


side note, checking out Roc's "tag"s. Which are like my records/enums, a little bit I think.
except they're a ton more permissive.



# V0

numbers + builtin ops

(.jd -> ast -> tast -> ir -> .ts)

# V1

define, id(pattern)

# V2

???


