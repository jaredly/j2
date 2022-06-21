
- [x] use the `analyze` from `constants.ts`
- [ ] start ... tracking the path of things? Should `ctx` always have a path component? Seems like a decent idea.
- [x] actually use the `grammar` exports from elements
- [x] actually use the `fixtures` exports from elements
- [x] move as much as possible into `elements`
- [x] split up fixtures, colocate yes please.
	Would it make sense to just have them be parallel files?
	tbh that might be the best way to do it. ...
- [x] I want to be outputting the `type` of each toplevel.
	- as a comment? Seems like a reasonable approach.
	- yeah I guess it's fine.
- [ ] support parsing & printing lambdas
	- [ ] and TApply
	- [ ] and TVars
- [ ] do analyze pass for types, decorating unresolved ones? hmm or actually I want a "verify" pass, I think.
	- also if the "type" that something ends up being from getType is not a valid type, it should be null, right?

- [x] actually resolve decorators
- [ ] I might want to think about de-duping hashes in the output.
	they're getting pretty verbose.
	- hmmm so 'alias' would be a single mapping.
- [x] oh fix a transformer bug

High-level goal: I want fixtures to really exercise
each of the things I have going on.
In order to do that, I want to be able to declare
ephemeral "builtin"s, including builtin decorators, types, and values.
This will happen via a fixture preamble.
In order to make it work, I need to be able to parse lambda types.

- [ ] automate exporting all element types through typed-ast.ts


## Transformer

I want, before we call e.g. transformApply,
to first check for visitor.Expression_Apply, and
call it if it exists. If what we get is different,
then we .... hmmm ...
hm maybe what we do is ...
make an earlier switch?
dunno how I feel about that really.

because that would, give it another chance to get traversed ...
.. and I do want that to be the default, I think.
Because the alternative is that it wouldn't even be a post-op. It
would prevent traversal altogether.


```ts
visitor.Expression_${name}

const subTransformer = visitor[`Expression_${node.type}`]
if (subTransformer) {
	const transformed = subTransformer(node, ctx)
}
```

## TExpr here we come

this might end horribly. But at least I'm getting in early.


- tref -> add string and int literals
- make a .. toy function that accepts some string & int literals
- make a way to indicate in the title of a fixture whether it should "clear"





##

- [x] STRINGSSS Follow the TODO brick road

- [x] do test cases, and coverage
	- [x] huh yeah I guess jest will be the easiest way to do that. ok fine.
		I can always have a separate cmd that will run the tests w/o jest if I want to.
- [ ] String literals! Gotta have 'em. And I think I'll stick with all strings are template strings.
	`${}` just makes sense. And the representation of "list of strings" and "list of things" also works for me.
	Do I want to have special formatty whatsits? I ... don't really think so.
	Do I want format strings? like I don't think I do.
	You can pipe it through a formatter function.
	hmm should I make a pipe? I reall probably should. |>? sure. As a simple "pass to a fn"
	with no fancy argument munging? Yeah. `->` does enough that's fancy, I should think.
	and |> dec vs |> dec(places: 2)? |> dec()... seems more wordy than I want.
	%0.2f ... hmm. idk maybe at some point I'll make a c-formatter macro.

	Ok, and then once I have string literals I can actually report errors lol.
- [ ] hmmmm then do we do generic functions? Well as soon as I have full coverage of everything so far.

...
oh, so ...
my transform generator, needs to know that Expression items
can be transformed into other Expression items.
Same with Types.
For now I will cheat with any.
hmmm so but also, if the Pre pass turns it into Not an Apply, we need to passs it immediately to the appropriate handler.


Ok so now I ... should ...
... I guess if I have decorators I need
... to allow them to have types. So that I can report decorator errors.
- [x] eh ok let's just make the traversal-generator
- [ ] decorators have types now thanks
- [ ] make a type error checker
	- [ ] but first I think I need a generic mapper over the whole ast
		- [ ] make it automatically yes please

Things I never made it to last time:
- mutually recursive values
- mutually recursive types

## Kinds of errors

- decorator can't be applied to that thing
- decorator hash wrong # of args
- a decorator arg has the wrong ~type (???? what am I going to do with decorators? I guess I did widgets. ok.)

- ref can't be resolved satisfactorily (either nothing by that name, or nothing agrees with the args)
- apply
	- wrong number of args (wrap the apply)
	- an arg of the wrong type (wrap the arg)
- TApply
	- wrong number of args (wrap the TApply)
	- an arg ... of the ... wrong ... hmmm yeah I guess "kind" is what I want here. Wrong number of args expected by this type.
	- OHWAIT do I need a ... separate something for kinds?
		idk if I actually want to do HKT thoo
	- ok but yeah once I have type bounds (must conform to this struct), you can also have a type arg of the wrong type.

Wow ok that's not a lot of errors just yet.
I'm sure it'll get a lot more complicated lol

### What can be decorated (atm)

- expressions
- types
- 


### Things that I will add that will have different thingsy

- declare record (enries should be decoratable, but labels don't need to be)
- declare enum (entries should be decoratable)
- declare effects ooh baby



```
struct Awesome = <<Inner>Container>{
	party: Container<int>,
}

let m = Awesome<Array>{party: [1, 2, 3]};
let n = Whatsit<Maybe>{party: None};
```


	- soooo cann I get away with treating decorators as just some special kind of function application?
		that gets ignored when codegenning?
		hmmm.
		for expression decorators, probablys. like not 100%, but maybe.
		oh but then I'd need to allow nested decorators, wouldn't I
		ok yeah.
		but, what about decorators on other things?
		TDecorated can't be.
- 



# Phase 1

- [x] basic parsing & printing (incl comments!)
	- [x] decorators for type errors, sounds fine
	- [x] want to be able to represent "partial" states
- [ ] 


- [x] parse decorators
- [x] ast-tast decorators
- [x] parsing and printing some decorators folks!
- [-] hmmmm cannnnnn I get my grammar-generation stuff so good that ... it'll produce the tast instead?
		my motivation is, what if I could pretty-print the tast, using the grammar
		although, hmmm idk. seems like an unlikely amount of cleverness.
		yeah, dont do it
- [-] remove some annoying intermediate ast nodes. ugh maybe it's fine
- [x] get everything ts happy
	- [x] need a `parens` for if we run into a decorator within an apply target
- [ ] actually do some type checking now.
- [ ] (maybe not) eventually, I'll want a `idOf()` function that will give me a user-representable ID, that I can use for like registering a plugin??? maybe??? Although actually, the editor UI can just take care of it I think ... and maintain that list internally. No need ... for some syntax for it? I think? Although I do like the idea of being able to export everything as a file .. idk.



Next up?
I guess we do ... some type ... checking? I guess there's nothing to infer just yet
but, I do still have to decide what to do about type mismatches right?

- [ ] when resolving a function, IF there's a hash, BUT the args don't line up, AND another hash does fit those args, go with it. OTHERWISE keep the hash and the kids are wrong.
	- BUT if there's multiple and none fit the types, leave it ambiguous.


- [ ] ok, and so a type error, is going to look like ... I guess we want to know
	what the type is we were looking for, and what we found. It's ok to denomalize
	them onto here because they're probably ephemeral anyway, right?

hmmmmm I'd forgotten about decorators.
@decorator(something) myself
should I allow argless decorators? I don't think so? because then we could have ambiguity
with tuples.

btw, we're getting rid of forced spaces between binops, right? I think so.

ok, so what if type errors were indicated by a decorator?
like
then the UI could filter it out, show it nicely or something
but it also wouldn't have to be ... a whole separate ... thing

ok, but so if we're making a record, and ... there are multiple options for the record type...
... I think I decided that records just weren't allowed to have name collisions.
...
Does that mean I need to make scoping a thing?
hmmm
yeah I mean using packages to organize names of things, it's a time-honored tradition.
but then do you like `open` stuff? hmm. And again, it is possible that you'd open
something that has a record that collides with one you have.
BUT I think I'd just say "we'll grab the one with the smaller hash or whatever", you
need to specify it better next time.
And I mean theoreeetically this is all academic, because in the UI you'll be ...
... getting things directly.
OK so also, `open` can just exist at the editor UI level, and you can be asked
to clear up any confusion there directly. Ok problem solved? I think?

Ok, and if you make a record with actually the same name as another, it will get
renamed out from under you. Or the old one will lose its name. yeah idk.

Ok, but all this to say: when handling record instantiation, we don't need to do
fancy comparisons of the attributes in order to determine what record we're actually
working with.
Type names will essentially be unambiguous. Which is good.

ok back to the matter at hand.
Should we indicate type errors with a decorator?
decorators are already meant to be able to go anywhere.
so, sure.



# PRINTINGG

Yeah ok so I'm turning the TAST back into an AST.
haven't done hash subsitution yet, but that's fine.

now I need to autogenerate a pretty-printer. How hard could it be?
I think my strategy will be to use the PP DSL, so use the parsed pegjs grammar to produce PP DSL objects, and then I can pretty-print to my heart's content.

For the structured editor, I think I feel better about producing the components by hand. I'm sure I'll make a DSL for that too of course. And who knows maybe I'll do the same .pegjs => DSL thing there too. I imagine I'll need to do a bunch of annotations and stuff, we'll see.

OK so I need to make a `comment` pp type. I'm pretty sure.
So that my args no not to comma-separate it.

- [x] get comments printing!
- [x] make the pretty printer by hand, it's not really that hard. I like having it in the two steps though tbh, idk.
- [x] ok just for fun, I've verified that HM (alg-j) can't handle rank-2 polymorphism. I think.
	like, it can'd type `f => (f(1), f("hi"))`. I'm pretty sure I've established that.
	So, that's exciting. We'll see how far I can get with inference.
	But I do think it'll be a good exercise.
- [x] ok so I'm so glad that comments are printing.

#

ok so this is where I wish that I could be building up my grammar incrementally.
I guess nothing's stopping me, right?
I can make an #include pragma or whatever.

# Ok so next steps

- [x] oh wait, I haven't gotten p.AST -> TAST yet
	so I need to do that. But it'll be ... fairly typeless?
	and then I run the algorithm to determine types of all symbols
	as far as I can, at least.
- [x] make a way to convert the TAST back into the p.AST
- use the pegjs to autogenerate a pretty-printer, yes you better believe it.
- when inflating the p.AST to the TAST, I'll be giving all symbols unique symbol names, and then I'll have a ctx-level whatsit that keeps track of symbol types, so I can run the HM algorithm.
BUT can hm handle a polymorphic ID function?
`(f) => (f(1), f("hi"))`? and infer `f: <X>(x: X) => X`?
spoiler, no it can't.


So, modular implicits, right? or something like them.
I think that was the realm where having a record that's
the sole body of a type lambda made sense. I don't really recall.










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
