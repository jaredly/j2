
#

ok so this is where I wish that I could be building up my grammar incrementally.
I guess nothing's stopping me, right?
I can make an #include pragma or whatever.

# Ok so next steps

- [ ] oh wait, I haven't gotten p.AST -> TAST yet
	so I need to do that. But it'll be ... fairly typeless?
	and then I run the algorithm to determine types of all symbols
	as far as I can, at least.
- [ ] make a way to convert the TAST back into the p.AST
- use the pegjs to autogenerate a pretty-printer, yes you better believe it.
- when inflating the p.AST to the TAST, I'll be giving all symbols unique symbol names, and then I'll have a ctx-level whatsit that keeps track of symbol types, so I can run the HM algorithm.
BUT can hm handle a polymorphic ID function?
`(f) => (f(1), f("hi"))`? and infer `f: <X>(x: X) => X`?


Ok but here's a question.
What if hashes were contained in []?
`hello#[builtin]`?
`hello#[abcd.12]`? 

```
hello#[b] #[builtin]
.awesome#[abcd.0] // record type and idx

```

So, modular implicits, right? or something like them.
I think that was the realm where having a record that's
the sole body of a type lambda made sense. I don't really recall.


Anyway, when thinking about the "output with ~unique names"
I'll uniqueify everything that's relevant:
- meaning, unique symbol names, unique reference names
	and if I need to use an incorrect(augmented) name for a
	reference, that's fine
	can I have a bare ... something?

alias abc #[hello]
alias cde #[hwhatsit]
alias abc #[hello] cde #[hwhatsit] T #[0] T1 #[1] a #[4]

hmm do I really need the aliases for local vbls? I don't think so?
I can just change them to be all unique.
The point of the alias declaration is to insulate the term from changes around it, and local variable declarations can't be impacted by that.

OK so also, I should make the rule that: a global vbl can never
/win/ over a local vbl. I think that just makes sense. That is to say, when parsing, if there's one local vbl, we don't even need to
check the global registry.
SO if, when serializing we're using a global vbl with the same
name as a local vbl, we modify the global vbl's alias. it's cool.


# Type Inference yes

so I think what I want to be able to do
is (a) represnet not-yet-resolved identifiers
(b) keep track of type variables somehow

where in the TAST do the Ts live?
Is it only at like a function declaration?
so like fn args know what types they are?
what about variable declarations?
seems like they have the capacity to constrain types
but then, what if they don't?
what if we actually don't declare types anywhere?
and it's just fully-typed terms that have types associated with them
and you can specify them as an afterthought.

buut I'm relying on knowing about types to know how to type
a given ambiguous identifier. but then again maybe I should lean
into the UI part of things.

Ok so what I'm imagining is: if we come across something that's ambiguous,
we just leave it ambiguous. Treat it as "unresolved". unless there's something
in the immediate environment to constrain it.

tbh I like that. We're not making arbitrary choices.

Ok, so we can have a node that represents the potentially unresolved
nature of an identifier, or an attribute fn, or even a FloatOrInt.

And then we go through, and try to resolve things down.
And anything that we can't resolve, we boot up to the user.
Does that mean I can do a straightforward hindley milner in here somewhere?
idk if HM allows for rank-N polymorphism, which I'm pretty sure I do.

butttt yeah I think that'll be a much more satisfying inference story?


isss there any use to having ... the ability to overload /Type/ names?
like, that seems like it would just be too confusing. Right?
Maybe I'll disallow it for the moment.



howw will I maintain a mapping from expressions to their types?
I'm shying away from denomalizing them onto the nodes themselves
but when I'm doing my unification, and .. after, during type generation,
I will need to know the types of things.
hm although again, I think I'll only need to keep track of the types
of local variables. global variables already have locked-down types.


http://lucacardelli.name/Papers/BasicTypechecking.pdf
https://ocw.mit.edu/courses/6-827-multithreaded-parallelism-languages-and-compilers-fall-2002/a981df4e1fd91ddf5cf7c1a15c5d1b03_L07HindleyMilner2Print.pdf
http://steshaw.org/hm/
https://legacy-blog.akgupta.ca/blog/2013/05/14/so-you-still-dont-understand-hindley-milner/
https://github.com/billpmurphy/hask/blob/master/hask/lang/hindley_milner.py
https://github.com/kevinbarabash/compiler/blob/main/src/infer/constraint-solver.ts
https://web.cecs.pdx.edu/~mpj/thih/TypingHaskellInHaskell.html
https://github.com/eignnx/hindley-milner/blob/master/hindley_milner/src/unifier_set.py
https://github.com/jfecher/algorithm-j/blob/master/j.ml
https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system#Algorithm_J
https://www.youtube.com/watch?v=8coUL8G1lFA







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


OK SO
all suffixes are function calls

some prefixes are function calls
and some prefixes are type shenanigans. introducing type or effect variables.


I think it's related to GADTs? hmm maybe not.

you might have
```ts
type Showable<T> = {
	value: T,
	show: T => string,
}

const ok: Array<<T>Showable<T>> = [
	Showable<int>{value: 10, show: intToString},
	Showable<float>{value: 10.0, show: floatToString},
]

// hmm no that's not right.
// Ok so does it only make sense for records containing functions?
// Maybe, and that sounds fine to me.
```






CANNNN I model .attributeaccess as just functions?
I feel like there was some reason that it wasn't going to work.

```ts
struct X<Z> {
	y: int,
	z: Z
}

const m = (n: X<int>) => n.z
.z (n)

// oh there was something about .z needing to know ... the un..specialized .. type of the record or something.

// so .z is a special kind of (node?) AttributeAccessLiteral
// it knows what type it operates on
// and the index.
// lovely.
// but ... then it needs type variables?
// .z: <Z>(value: X<Z>) ={}> Z
// .z<int>(n)
// huh yeah I guess it ... can just be what it is
// very interesting.
// Ok suffixes, we have:
// [ as ], which is also a function call.
// we look for `let as` right? Yeah I think so. Love it, it's also a function call. Although with the caveat that we're printing out the return type. Which is interesting.
// And then [index] access. Which we decided is also a function call.
// x[y, z] -> '[]'(x, y, z)
// and there's a builtin definition for

type Index<Col, Idx, Ret> = {
	'[]': (collection: Col, idx: Idx) => Ret
}
// but then how to type
let ArrGet = <T>Index<Array<T>, number, T>{
	'[]': (collection: Array<T>, idx: number) => T
}

// And how to use ArrGet?
ArrGet<int>.'[]'([1,2],3) -> int
// Ok so in order to do anything to ArrGet, you need
// to pass it a type variable.

let Whatsit = <T>{
	let m = (n: T, m: Eq<T>) => m.eq(n, n);
	Index<Array<T>, number, T>{
		'[]': (arr, idx) => m(arr[idx])
	}
}

/*
CAN RECORD LITERALS
have OPEN TYPE VARIABLES
like
what

the type of this value
is
T -> Index<Array<T>, int, T>

is that weird?


ok yeah so I can't actually think of downsides of this
approach at the moment. Just let people declare type functions
like wherever they want... all they do is
- add a type vbl to the scope
- return the body, with the type changed to be a type function.

Where am I using ':' as a prefix already?
oh yeah I was thinking of using it for 'silent args'.
but that's still a long way off.
'<' as a prefix fights with JSX if I should ever want it,
and idk if I do
yeah I don't think so; I think I'll take care of that usability
as an editor plugin.
so '<' is fine.

nowwww a question becomes; how about effects?
{* *} - I could use that for effects, I assume they'll be
less used than records yaknow.
yeah I think that's fine. I could change it later.

anyway, ={* e *}>
what about effects, where
<T>(x: T) => T
is no longer just a function type, it's a T -> (x: T) => T
with effects
<T>{* e *}(x: () ={e}> T) ={e}> T

is this

let monn = T ~> e ~> (x: () ={e}> T) ={e}> T?

monn<int>{* Send *}(sender)

is this

((monn<int>){* Send *})(sender) ?

I guess I don't see why not?
that would also allow me to generally have effect variables
in records and stuff.
which I remember thinking would be desirable for some reason.




*/

// type Index<A, B, C> { '[]': (A, B) => C }
// let ArrGet: <T>Index<Array<T>, number, Result<T, OutOfBounds>> = {
//   '[]': <T>(arr: Array<T>, idx: number) => Result<T, OutOfBounds>,
// }
// let ArrSlice = {
//   '[]': <T>(arr: Array<T>, slice: (number, number)) => Array<T>,
// }
// Does this mean that 1...3 is just sugar for (1, 3)?
// seems like a reasonable thing ... idk. I like not having
// to introduce some non-representable bonanza.
// like, you could have a function
// (slicer: (number, number)) => myarr[slicer]
// now if you wanted to be really fancy
// <T>(slicer: T, :Index<Array<int>, T, int>)

```


Ohhk so editor idea. When you have a line focused, off to the right
(similar to vcode's lens thing) you have all of the fns used on that line, along with like their type signatures or something.
So you can see what you're getting.



soooo arguments for having operators just be free-floating functions: it's easier in a lot of ways.
arguments for having them be gathered into records: it's cooler or something ... because you can do monads maybe idk.
honestly let's not bother with that just yet.
how far can we get without it, you know.

ok so for now, we're just doing a lookup for functions.
And there are some builtin functions and stuff.

but this also means I don't necessarily need to support partially type-applied records just yet. which is nice I thikn.

Am I already using ' for something? Do I even have the concept of chars? maybe I should idk.
um anyway, how do I quote operators? \`? yeah all strings are template for me, so \` is open.
seems appealing.
how about quoting things for like quasiquoting? idkk.

So a common way to quote operators is to just surround in parens. How annoying would that be? Seems like it's probably ok.

`let (+) = `.
Because you can't have a 1-ary tuple.


# AMBIguouity

So how do I deal with it?
What iff, only `id`entifiers are allowed to have ambiguity?
Like once you get to a `call`, or whatever, you're required to lock it down.

Ok so that just means that I can have a node
called 'multi-identifier', right?
If asked, it'll report the type of the first identifier,
but anything that knows how to deal with them can do so.
hm yeah I think that's a reasonable approach.

OK ALSO what about type errors.

So there's `NotFound`, right
and `TypeMismatch`
anyway I'll deal with things as they come.

# Ok so the thing that I want to be automating is:
- first generate a parser & the types from some peg.
	- we're finding the peg via a script, lets just write that
	- and get a very basic something working.




# Ok, so visual

thinking about how to make this all nice and stuff
honestly I should really just write out by hand a basic
thing, and then figure out how to make it nice.
SO no binops or anything weird like that.
just a lisp or something? I mean I guess rite




Ok, so what if
the way I did things was with registrars?
explicitly
like
`FromAst.register('Int', fromAst)`
hm that wouldn't give me the type checking I want tho.

Ok anyway, I have a basic grammar, and it appears to parse.
now to see about type checking.


HMM make a `P_All_Nodes` type that is the OR of all the nodes that have a `type`. So then I can maybe get fancy with typescript.

WHAT are the types of errors

'UnknownReference'

and

'InvalidApplication'

ok so there's also like 'this pattern doesn't make sense'
and a whole bunch of other things.

is there an ... auto . magic . way to 'insert' all
of these error nodes as possibilties into the
type hierarchy

ok so then I'm like
"What if any thing with a type error just gets commented out/??
but then also I'm like
"then what if it's an unknown attribute, but the value is large and complex and you don't wnat it to look just like a comment"
so then I'm like
"what if you could mark parts of a comment as wanting to be typechecked??"

Sooo would just all AST nodes own their comments then?
Or would I still have "comments live at the top level and are injected in-place"?
But then how would you know what scope to type-check the comments at?
hmmm I kinda think maybe all nodes ... should ... be autogenned to have like pre_ and post_ comments for everything? that sounds absolutely exhausting.
and like what about comments in between list items?
yaknow.

maybe back off on the P_, and just import * and p.


# OK SO INFERENCE

Places where it's more important than not:
- knowing if an expression should be an int or a float, is .. pervasively important.
	- and so we might have complex expectations
- 


ambiguous: if in future it becomes important to dig deeper (e.g. resolving the target of an apply with more knowledge of stuff)

# UI FOR NAMING

What if it was much more like a database view or something ...
and so if you're looking at a "named thing", you also have listed out the other things
with that name.
And you can like collapse the others, but they're always there. Unless you want to
"detach" something from that name.

And you can like "detatch & migrate users to this one" or something.
