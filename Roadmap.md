
# North Starnstuff

WHAT IS MY
current north star

- getting a basic Task / async/await / error coalescence story going
	- need withHandler, andThen
	- and a bunch of custom js dealio
- getting some kind of UI framework going
	- hmmmm i dunno what the story is
- GLSL PLSSS

So, I probably want to be working toward running
the effects examples
and/or a nice error coalescing example.

## Next little minute

- [x] on first load of the TestSplit, nothing works!
	Or at least, several things don't work. Why??
- [x] WOW tail recusion is broken? or something???
- [x] highlight hashes to reduce noise
- [ ] colorize vbls by sym!
- [ ] SHOW JS RESULT! Gotta have it.

- [ ] it would be quite nice if I could infer the type variables for `withHandler`. Seems like it shouldn't be too hard, right?

### Moving forward with effect crushing

- [ ] wow gotta make generic functions folks
- [x] hoist awaits to a block-level, thanks!
	- [x] make sure nested awaits still work
- [x] and then withHandler! yes please.
	- [x] figure out the type
	- [x] make a third arg to Task for 'inner effects'
	- [x] get switch case type refinement happening
		- ooooof. how do I .. capture the fact that ... the parent ...
			ugh I'll maybe just stick the whole switch onto the dealio.
			don't love it.
	- [x] see if it can all come together???

NOW YES

- [-] switch -> if-let simplifyer
	- lol ok this is causing some problems!
	<!-- - [ ] if-let needs to refine the types my good folks! no two ways about it.
		which meeeans, we need a way to set locals in the `else` side of the if-let...
		probably by pulling another fast one and putting the whole if on the context.
		and makeing an `IfElse` node, that we can visitor it up on. -->
	- ugh I'll just do the switch->iflet transition at the to-ir boundary. cleaner.
- [x] do switch->if-let at the to-ir border. a little riskier, but I think it's fine
- [x] get withHandler working!
- [ ] I want things to be /much/ more introspectable, now that I'm actually doing complex computation.
	- breakpoints? could be nice to be able to drop in a `debuggerfy()` anywhere. with a decorator? sure why not.
	- also `log`? yeah, love it.
- [x] response time is suffering in the large editor. I think it's time to break up into separate "editors"?
	- definitely, one per toplevel
	- also, what about: @break and @log / @trace


- [ ] then we can actually start into some of those eff paper examples!
	That would be charming.

	Oh also can we do some error coalescing?







- [x] TSTEES are broken
	we've got an import loop somewhere, and its bad
- [ ] ALSOOOO Why does `FullContext` have `ToTast` on it????
	we should definitely have the conversion ctx's be like
	`FullContext & {ToTast: ToTast}`.

- [x] STOP SHORTENING ALIASES it jumps too much

	because now defaultCtx is dying.
- [-] try doing ... a more forgiving parser! closing things are optional! but recommended.
	- lol that went poorly. I'd have to lock down keywords a bunch more I think.
		better plan: hoist all aliases to the top? at least then things won't be jumping around
		also, if the cursor is right after a '(' and parsing fails, insert the dealio. Same for {

- [x] ohhhh `if let`, my Analysis for `let` is being wrong :( I'll have to do it under /block/ now :/.





- [x] andThen!
	- [x] basic support with specified args
	- [ ] could be cool to be able to infer the type variables.
		however, I assume we won't be doing too much of that.
- [ ] await!
	- [x] syntaxxx
	- [x] getType of the await
	- [x] getType of the lambda, gotta do it
	- [ ] transform the IR pls
- [ ] MAKE A THING
	- power-call! Also known as `await` probably.
		`print!()`.
		`let m = print!(); ...` => `andThen<??, ??, ??, ??>(print(), m => ...)`
- [ ] let's do some member expression support, so `makeSuper` will work better

### [ ] Switch type refinement!
```
let wantsTwo = (v: [`Two(int)]) => 123

(m: [`One | `Two(int)]) => switch m {
	`One => 1
	x => wantsTwo(x)
}
```

eh so I might not actually need type refinement to make if/let compile ok.
like, maybe it would be nice idk. but, I can just compile if/lets in tojs, and
I think it'll be fine.

- [ ] make if/let work!
	hmmmmmm might be awkward. like
	for traversal I mean. I'll have to have a node
	that combines the (test) with the (yes) so I can ensure that type
	refinements happen correctly.

	yeah that sounds fine!

	SOULD if/let be a different thing entirely from if?
	eh, probably not.

	if let hello = what,
		 someboolean,
		 let other = things {
			// yeah it's all one happy family.
		 }

		relatedly, you could do
		if 1 < 3, 3 > 2 { }
		so `,` instead of `&`.



- [x] get it so that there's one codepath, used by both the web ui & the jest tests.
	- outputs: validation, annotations, jsraw & stuff
		- text -> ast
		- ast -> tast
		- tast (analyze)
		- for each toplevel
			- validate
			- refmt (w/ sourcemap???)
			- ToIR
			- ToJS
	- [x] OK FOLKS, use `processFile` and `processTypeFile` everywhere
		- [x] run-test.ts
			- [x] initial
			- [x] make sure failures propagate
			- [x] see if any other validation needs to come through
			- [x] figure out the Alias toplevel dealio
				- when fmting things back out, we probably want to ..
					.. ok maybe include 'aliases' in the toplevelinfo
						for a given thing?
					which means we might as well just not return the
					`ast`, but instead use our custom object. 🤔.
		- [x] Test.tsx
		- [x] typetest.ts
		- [x] TypeTest.tsx
		- [x] OneFixture
			- ugh why is my comment placement stuff not working?
				why won't it place between lines?
				I feel like I would want comments to be 'alwaysbreak' type things.
				OH it was that my `loc`s on outer elements were wrong.
		- [x] fixtures.test.ts
- [x] then get rid of `syms`, so that we can pave the way for type refinement
	- [ ] basic type refinement?
- [ ] if/let it up my folks

## Switch next

- [ ] set up a `simplify` thing
	like, 'if a switch target is complex, bring it out into a let'
- [ ] also a `extract stmts to the toplevel`
- [ ] and 'switch to if/lets'
	- once we're at `if let`s, I think we're in good shape?
		BUT I do need to get type refinement working
	- ehm. ... 

- [x] ugh it's really vexing that the UI uses different codepaths for at least some of its stuff, such that it can be broken without the jest tests being alerted.

... run 'analyze' after 'simplify', to ensure that nothing went wrong
hmmm, so if/let
can IR .. do things like 

```js
/*

switch hello {
	`One(thing) => thing
	`Two(12, b) => 2 * b
	`Three => 23
}

// typeof hello !== 'string' && hello.tag === 'One'
if let `One(thing) = hello {
	thing
// typeof hello !== 'string' && hello.tag === 'Two' && hello.payload[0] === 12
} else if let `Two(12, b) = hello {
	let `Two(_, b) = hello
	2 * b
} else {
	23
}

*/
```

OK um . 

### Type Refinement!
So, in order for type refinement to work...
I'll need to get rid of syminfo? 🤔





ok so, I need much better inference (typeMatches should return new constraints)

also, I want : 



BIG NEXT

- [x] tests in browser
- [x] value/fn recursion
	- [x] oh wait, aliases ...
		hm ok
		...
- [x] switch/enum patterns
	- next up! switch!
	- hm should I do if/let first?
		that way I can change switch to a series of if/lets.
	- [x] basic
	- [x] whyyyyy isn't resolve working?
	- [x] Enum?
- [ ] figure out withHandler and andThen
	- so, the function won't have a real type, right?
		andThen<A: [*], B: [*]>(
			Task<A, R>,
			R => Task<B, V>
		) => Task<[A, B], V>
	- withHandler<A: [*], B: [A | *], R>(
			Task<B, R>,
			t => Task<A, R>,
		)
- [ ] eq deriving for realsies

# Much more fancy type arithmatic

- comparison ops, let's do this
- mul/div why not

# TYPE INFERENCE

Ok sooo I think I want `typeMatches` to return `false` or
a list of new constraints that must be successfully applied
in order for the types to match.
... and ... I need a way to constrain variables to be equal
to each other ...

anyway, worst that happens is people need to annotate stuff.
which is kinda fine. idk.

ohhh also what happens when we .. have a type variable on
either side of the typeMatches?
like `(a, b) => a(b) + takesInt(a)`?

hmmm so `(a, b) => (a == b, takesInt(a), a == b)`
.. the first a == b fails, the second one succeeds.
I guess I need to do an inference pass first, and then
a 'highlight all errors' pass. Yeah it doesn't work to mix them.




ooohhhh what if the type restriction shortcut syntax looks like:
- `Type 'where' Pattern`?
that could be cool.
ok also with type arithmetic, I might need to allow
an upper & lower bound to a number. idk.


# Patternings

- Enum (w/ or w/o payload specified)
- Constants
- Exaustiveness
- `as` pls

# SWitches




# Let & If
What validation do I need?
- [x] let, pattern must match initializer type
- [ ] let, pattern needs to be exhaustive.
	- ok this doesn't actually enter into the picture until
		we can have Enum patterns. because so far we only have
		record patterns, which are always exaustive.
- if, cond/yes/no ... I think that's it?
- it might be good to allow full patterns at the toplevel?
	although, the UI coud make it so that it doesn't come up.
	If you're making a toplevel term, you fill in the name,
	and then go to the "body". Which is a block by default.


# Make ExprTests
or probably just tests

- [x] make the tests, make them work
- [x] toplevel let! gotta have it folks, for the tests
	- [x] jctx addName, my jctx needs to persist, and know
		about toplevel, and such.
- [x] if/else comes next
- [x] unwrap iffe pls
	- [x] why is transform not getting all the sub dealios?
- [x] oh with empty let, need to just grab the syms out of the pattern.
- [ ] then recursive functions pls


# Up nExtt

- [ ] hm for `unit` value, maybe have a global variable `unit` or something?
	so that you can do cheap comparisons? idk can just do a .length

- [x] (a) => a + 2
	- so we're looking at a given option, so we don't want to just constrain
		in case this isn't the one
		So we like ... return a list of ... constraints?
- [x] `let` thanks
	- [x] basic working
	- [x] keep track of generated js in fixture output, I'd say yes
		- hmmm orrr ToIR? like the IR output?

- [x] tvbl as apply target
- [x] (a, b, *) for open tuples?

## Inferred stuff, feel free to drop it!

hm I guess I need to have some tests that are like
"print & reparse" and make sure it matches? oh wait I already have that.

## so can we do some type variable stuff
tvbl, is like ok folks

- with patterns, should I be ... passing up ... a 'path' or constraint things. yeah I think so.
hm nope. make a `typeForPattern`, should suffice.
Also need a `constrainType` that's the opposite of `unifyTypes`.

- [x] lambda getType make it work
- [x] .res, we should keep track if it was inferred, and
	if so, don't print it in toast. Same for arg types.

- [x] ok, when adding decorators - clear them first
- [x] fix jest tests so I can like run them
	- [x] turns out I need to do analyze after parsing because I'm doing inference stufffss, so that comparing them works.
	- [x] fix the pattern to not have an array so we can traverse it
	- [x] figure out what I want to do with type variables...
		ok yeah, in the anaalyze pass I want to replace the TVbl
		with whatever it was inferref to be. Sounds reasonable.


- [x] make a basic collectSymInfo
	- oh but like ... 

SO
I think I want a `symInfo` dealio that I can get by
traversing a tast

and then pass to to-ast and to-ir and to-js ctx's
So that they don't have to keep track of a bunch of madness.

Does that make sense?
Seems like it would.


# and such


So ... what about
- [x] ... having a `TBlank` type. would be good. For when there's an `apply` that needs application. like "underscore"


- [x] normal (reolved) apply, let it infer type args
- [x] oh I need to support Expression_ApplyPost in transformer
- [x] when printing apply's, drop type args if inferrable

- [x] little cleanup, remove all of the `as any`s
	- [x] do some by hand
	- [x] make a little macro system for generating some switch statements
	- [x] get fed up, do a full codegen step for all aggregate types
	- [x] YAYYY love it

- [x] binops
	- [x] parse
	- [x] totast
		- [x] basic
		- [x] honor precendence
	- [x] allow referencing binops like (*)
	- [x] print with parens if appropriate in an apply
	- [x] print for real, with parens for precedence where needed
	- [x] print js too? like yeah
	- [x] binops w/ type variables, so
		<A: int, B: int>(a: A, b: B) => A + B
	- [x] eq! <A: eq>(a: A, b: A) => bool
	- [ ] ohhhh am I going to need multiple & divide at the type level?
		Or, am I just going to have fanciness for + and -?
		Because, once I get fancy, it might be hard to go back.
		Although my precedence tree rebalancing dealio does seem
		very slick & simple to understand.

- [x] lambdas
- [ ] ifs
- [ ] lets
- [ ] have js gen use pretty names where possible
- [ ] probably make some tests that compare the expected js output? Or something? hmmm or maybe just tests that run the one thing and run the other & expect them to be equal.

OH also, what's my plan for equality?
Now that I don't have nominal types, how would ... traits
be defined?

x ==#[b] y

builtin eq might fail if the type isn't eqable


ohhh also, we can have a type bound that's just `eq`, like
"this can be eq'd with itself". e.g. doesn't contain a fn




so we say that everything is auto-deep-equalable?
seems likely
and fns do by-reference comparison or just always false?
hmmmmmm oh so Roc just disallows equality on things containing
functions.

but I do kindof want serde to be controllable ... at least a bit.
hm oh maybe with annotations on the record? and stuff?
yeah that sounds like probably it.
like if you want custom serde, pop those on.

ok anyway, so like
how do we do like trait bounds?

let hello = <T: $eq>(x: T) => {
	T$eq(x, x)
}

let eqeeq = ()
hello<hello & $eq=eqeeq>

==#[???]
a == b

hmmm ok so what about just extra arguments

type Eq = <T>{==: (x: T, y: T) => bool}

let hello = <T, M>(x#[0]: T, y#[$1]: M, #[$2]:Eq<T>, #[3]:Eq<M>) => {
	x ==#[$2] x
}

Should I have a `num` bound that meets all numeric types?




--

Sooo at some point I'm going to need (mybe in the IR)
a thing that inserts a `genConversionSomething` from the
actual type to the expected type, in the case where
we're in a subtype situation, and the receiver needs
something different.
This is where we would realize default values.


oh btw `[]` is uncreatable, and so is effectively `never`.


ok I actually think I'm ready to try representing
effects, pre-sugar.
ok but yeah I should make function literals a thing.
and then I'll need switches or something at some point.

alsooo tuples are needed to represent the bodies of the fns.

- [x] ok so I do want to take a little check through the files
	see if there are things I need to split out into elements more

- [x] record types
	- [x] parse, print, validate
- [x] tuple types
	- [x] parse, print, validate
- [.] enum unify
	- [x] very basic, not really enough
	- [x] decent unification
	- [ ] lambdas and tvars and whatnot
- [x] pretty parsing tuples as enum bits

- [x] record expr parse & print
- [x] record analyze
- [x] record default values!!
	- anything special here? I don't think so.

DO I WANT functions to be single-argument?
What do I gain?
idk
what do I lose?
probably some things.

- [x] tuple expr parse & print
- [x] enum tuple pretty
- [ ] enum record pretty?

- [ ] lets get basic IR going before we get too carried away

- [ ] ifs
- [ ] binops ... lets and suches
- [ ] lambdas

- [ ] so, a fundamental type that is 'attr'? and it's a fn that gets
  the attribute of that name? because we're not declaring these things
	anymore. hm that dashes my hopes of declaring things like `let .ok = ...`
	but that's probably fine. I could always do `let ->ok =`.

- [ ] tuples & records (attributes etc)
	- `.hello` is the fn `<T>(x: {hello: T, *}) => T`

- [ ] lambdas
	- basic patterns

- [ ] blocks

- [ ] lets?

- [ ] switches maybeee





# Thoughts about recursion

What if I did have `recurse up 1 level` or `up 2 levels`
on a type scene?
That would make it possible to have anonymous recursive types.





# Now...

I think I want to get rid of the enum `*` star.
(not ready too yet tho, might be nice)


So, obvious things before we can really go anywhere:
- [ ] lambdas lol
- [x] records & tuples
- [ ] let (it would be nice not to have non-expressions)
	egh but then again, I don't really want to support expr-level
	let. it needs braces.
- [ ] arrays. whatayathink
- [ ] could be nice to have a `Map` type builtin
- [ ] switch
- [ ] if/else

then we get around to `Array<int> where .length = 10u`
oh wait jk `Array<int, 10>` it's fine

ok also,
can I design my algebraic effects, so that it solves the
Error collection problem?

e.g. we can infer the types of errors that you're going to
be coming up with.

So there's the `$Error<T>` effect.
And people are raising `$Error`s, but with different
payloads. BUT they're enums.
so we want to infer that we've got:
```
$Error<[ `Some(x) | `Other ]>
```
when doing `raise!($Error<``Some(x)>)` and `raise!($Error<``Other>)`.

like, that would be quite cool.


anyway here's a question:
Is it critical to handle all of the parts of an effect together?
Could I concievably have a single-handle thing,
that just does either `Get` or `pure`, and another one that
does `Set` or `pure`?
Again here I think I need to just dive into the manual CPS
version of the effects stuff. So I can remember the particulars.



- Q: what code do I want to be writing?
	like, what do I want to make

C++ for microcontrollers. Meaning I really need to be able to
monomorphize all of these enums.
either that, or I make a monotype for all enums?
seems really wasteful.
well, I guess I could determine the ~maximum size for any
given generic enum function. tbh that might not be terrible.
But also then I might need to figure out allocation
which I don't really want to do

TSX for react interfaces. I would quite like to be able to
dovetail. although useState being inherently side-effectful
isn't awesome.
yeah ok I could use virtual-dom or snabbdom, seems like at
least a way to get started.

golang for servers, would be very cool.

glsl for shaders, definitely want to get that running again.
will need to figure out a story for lambdas.
OH I wonder if I could piggy-back on enums?

like
somehow have some big old dispatchlambda

```
// This is all of the lambdas that take these args
// and have this return type
type Scope = [
	`hashOfScope(id1: number, scope: idkrecord)
]
function lambda[hashOfArgs](scope: Scope, arg1: int, arg2: string){
	switch (scope) {
		`hashOfScope(id, scope) => {

		}
	}
})
```

so, um, yeah; I do kindof want to have a transform that's like
"tear through IR, and at the end we have no lambdas.

now is that happening at the IR level?
or the TAST?

similarly, is the effects -> CPS transform happening
at the IR level? or the TAST?

because I feel like when we bottom out with the `handle!`,
we do need like variable reassignment.

but idk we could probably get away with doing nearly all of it at the TAST level.

same with monomorphizing.

now, these whole-program-optimizing functions would be working
on the level of ... the whole program. the whole library.

I'd like to go through the effects paper examples,
and do a manual rewrite to CPS.
see what it takes.



# Now that typetests are working:

- [x] oh check our coverage my folks


so
here's a thing

- [x] when in the analyze phase, it's nice to be able to know what the ID is of the current toplevel type, for resolving rescursion.
- [x] ummm wait EnumCase needs to be decoratable. RecordItem will need to be too.






- [x] detect all kinds of more issues
	- [x] enum reusing tags
	- [x] get type checking of recursive types working!
	- [x] prevent infinite loop types from borking things
		- [x] add an annotation to make it obvious?
			- like, if this type is just infinitely recursive, pull the plug
			- yes definitely do that.

- let's do a bunch of expression stuff?
	- lambda, if, and binops
	- that'll get me far enough that I can do interesting
		recursive functions with interesting type math.

	- then I can do `switch`
	- and like effects idk

	- we'll need ToIR

IR does the following:
- control flow as statements, not expressions
	- switches as ifs
- CPS transform of effects
- monomorphise? maybe? but like not necessarily completely.
	hm.


- [ ] 🤔 do I want to be able to mark tests as "known failures?"
	like "I'm going to be working on this"?
	to distinguish from "unexpected failures"
	⚠️ so it would get the warning sign?
	or maybe just `@todo`? Then we could /flag/ if there's
	a `@todo` test that's now working.







#

- [x] get highlighting working in the editor!
	- [x] indicate parser error location, could be fun
		- would that be a 'zero-length span'? yeah looks like that would work
			orr I could just use my current markup setup!
			I'll probably expand it to allow underlines & popovers? Seems like it.
			data-tooltip idk
	- [x] undo/redo now have to be done manually!
		- let's slap something together
			it's ridiculous not to be able to undo

- [x] then get .typetest files going in the UI
	- [x] TypeFile (to-tast to-ast to-pp)
	- [x] (string) => TypeTest
	- [x] show in the UI
	- [x] editor!
	- [ ] dedup files.test.ts
	- [x] with squigglies for failures
	- and .test
	- seems like "listing" all of them at once makes sense?
		but why would I do things that make sense lol

- [x] so there's something ... that I need to change about
	writing & loading aliases

- [x] "recursive bound, own tvar" isn't working
	ohhhhhhhhhhhhhh ok so I see.
	getBound is not working
	we need to:
	- to-tast and then immediately analyze, a given toplevel.
	can't do the whole file and then go back and analyze.

	because the syms mapping, of course.
	
	I think I'll need a way to 'recreate the syms mapping'
	from an existing tast, for when I'm revalidating a dealio.
	do I then also clear out all 'error' decorators? Seems
	like I would.

	Ok, so I do actually want the contexts to be different.
	And ToABC.File isn't really the style that I want.
	Just make a toplevel function to manage that stuff.

	but a quick & dirty, to get tests passing, would still reuse
	things.

- [ ] would be nice to bring back sym aliases ...	


ok maybe fixtures are only for ... errors?





- [ ] do I also need to add some tests for re-parsing?

- [x] wait perf is really bad
	- Lesson learned: hashing stuff takes time, so reparsing builtins was killing me.
	- Now we have 2ms rerender instead of 40!

- Wait, hm, the resetSyms thing isn't quite working with
	aliases. anddd the .. syms map thing isn't working
	so figuring out what the toplevel is that a 'Recur' is
	referencing.
	Yeah so I'm losing names from other things
- OK so aliases .. maybe I'll only start doing the aliases
  thing ... hm ...

OK so ... yeah my syms need to be unique.
erg.

whyyyyy is jest mad???
need to figure out why runFixture isn't working consistently.


# ENUM Next Steps

- [-] Ohhh ok so I think I want to /actually/ split out TCtx from TACtx and such.
	Which means I want a "library" that'll be shared.
	- turns out that might be super hard

- [ ] SO I'm getting a lot of fixtures, and I probably want to split fixture files up
	unto a file tree, you know?


- 🤔 should I make a 'checkType' annotation or something? @type(:hello)
	- `@expect:type(:sometype) expr`
	- `@expect:matches(:10) int`
		hmm

- [x] basic shouldMatch / shouldNotMatch / shouldBe
- [ ] better assertion



Ok, so I feel like there are two kinds of tests.
Fixture tests (input / expected output)

and

'types' 


- [x] ok folks, local fixture-level builtins
- [x] enum typeMatches
- [x] "open" enums ("*" or "..."). Does it make sense to have them, when a type vbl would work?
	`<T>(x: [ ``What | T ]) => int`
	problem here: that `T` needs a `bound`... like `[...]`. But then the question is, do we allow
	that syntax in general?
	when I'm thinking about monomorphising, ... I would ~like to be able to lock down enums,
	because otherwise ... I'd need to do boxing or something to put them all in the same union?
	right. hm like technically someone could do `[ ``X | [...] ]`, right? because I really don't
	want differences between the `bound` things and normal types.

	hmmmm. So, given that you can't get anything out, maybe it's fine?
	we can try it at least. Ok, open enums are ok.

- [x] recursive type bounds, make it work!
- [x] validate elements of the enum
	- hmm need to know whether the /recur/ thing is an enum type or something else
		so that we can reject it. Which means we need a 'parse just enough to figure out
		what kind of thing this is'.
- [ ] hm ok so to use the enum types, I'll have to make functions?
	- yeah let's get lambdas going

# RECONSIDER

What parts of the code have gotten ungainly?
- [x] updating fixtures when hashing changes (due to a modification of types) is super annoying.
	- [x] I want a cli function that is "update all fixtures that are the same modulo the aliases mapping"
- [x] oh wait I really need sync to also sync the ToXYs as well
- [x] make it clear when only aliases changed

- [x] fixture overview doesn't highlight failing fixtures
- [x] test coverage is pretty good though, that's nice.
- [x] I've been pretty fast & loose with FullContext. It would be good to rein that in.
	Like, have `typeMatches` only take a subset, you know.


# ENUMS

- [x] enum basic type parsing
- [x] enum expression parsing
- [x] WAIT need to be able to reject fixtures. or like. mark them as "pending"?	
	like there is a difference. "under construction". maybe the triangle warning icon
- [x] recursive types!
	- [x] so, hm, I should ... know the 'kind' of the type. yeah.
- [x] analyze/validate enum types, and enum expressions
- [x] typeMatches for enums



Ok what Im doing now:

- [x] type aliases
- [x] TDecorated, so we can make bound errors more visible
- [x] check bounds! awesome
- [x] tapply at the tast level
- [x] tapply at the ast level?
- [x] typeMatch for ... tvars?
- [x] defaults
- [x] pin
- [x] TYPE ARITHMATIC
	- [x] hm 10 <- 5 + 5
- [x] then enums? Could be fun. At that point recursive types make sense.
- [ ] records! and tuples. do we decide that tuples are just records with numbers for attributes? might as well
- [ ] ok eventually I have to do control structures. and, like ,lambdas


- [x] Printing (<T>int)<T> isn't quite right



- [-] type aliases! 
	- [x] And let's make sure that mutually recursive types work
	- Can I even do those without records yet? No idea. like, functions seem weird
```ts
type X = () => Y
type Y = () => x
```
Ok so yeah technically that works. without combining it with records or tuples or something it seems quite useless.


# DEVUI MUST HAVES

- [ ] when just the aliases change, but the printed output doesn't, indicate that somehow. Maybe just have a diff view? Could be good.
- [ ] the sidebar should indicate files that have failing fixtures.
	Which means I need to pull all calculations up to the top level,
	and load all fixture files.
- [ ] I'd love to have individual fixture-level builtins too.


# Big Things To Add

## Better Fixture Setup

hmm I do think I need a fixture UI now.
or ... something. yeah jest just really isn't cutting the mustard.
What I want:
- hot reloading (vite probably?)
- button to commit all
- show diffs, show json if asked.

hmm ok
vite
JSON
stringify
parsing .. and stuff ...



## Elements

### [-] Generics (TVars TApply TypeApplication TypeVariables)
- [x] TVars
- [x] TypeApplication
- [ ] oh TApply, I think we need it
	Yeah for like `Array<int>`
- [ ] Defaults!
	- [x] builtin types need type args
	- hmmm ok so also, I'm not sure about types
	- errors:
		- defaults need to not be followed by non-defaults
		- hmmm anything else?
- [ ] 
- [ ] TypeVariables (we don't need this until we have lambdas)
... I'm not sure that I need TApply?

### [ ] Now let's try type mathsss



### [ ] Oh toplevel defines

`define` maybe? or just a toplevel `what =`, idk.

### Record types!
And defining records of course
`struct`? or `record`? might be nice to call things what they are.

### Type Aliases
I think `getType` would resolve these? Yeah.
`type Under10Arr = <T>Array<T> where .length = 10 - usize`

### BinOps and such
- `let + = add`

So things that are apply's


### Attributes (modeled as fn application)

### oh lol control flow right
- if/else
- switch
- let my folks
- loop/recur I think? idk

### Type Refinement madness
- [x] allow specifying constant types
- [x] "hello" gets inferred as "hello" not string
- [ ] oh but "hello" needs to .. work as the type of things
- [ ] get everything together such that the type of (+) results in
	`1 + 2` to have the type `1 + 2`.
	`+: <A: int, B: int>(a: A, b: B): A + B => a + b`
	also, types should collapse reasonably, like `2 + int` is still just `int`,
	but `2 + uint` is `2 + uint`.
- [ ] do the subtypings
- [ ] I definitely want something like Array.length = 5, or Array.length = 5 + uint

## Bigger things

### Generate like typescript and stuff

### TAST -> IR probably?

This ... is where effects get eliminated. right?
and blocks get flattened, where `if`s are statements not expressions.

but we probably still have refined types?
because I think it's here that we'd turn some recursive functions into loops,
and also some loopys into fixed loops? like glsl compatible.

### IR optimizations right

seems like it would be good
also maybe monomorphization happens here?

# Thinking about GLSL

I'm hoping the type refinement will be all I need to make things groovy.

# Thinking about microcontrollers

I just need to generate C++, right?
which means ... some amount of malloc/free?
I guess I managed to get away with no heap memory in my pen plotter stuff so far, by just using
a fixed-length global array that I mutated.
so, how do I keep track of what allocation strategy I'm going to use?

Roc's platforms are very cool. A very nice way to separate out the pure from the side effects.

what would it look like to ... turn my setup, and loop, and such ...
have the State object ... hmm .... I guess
if I use Setup to set up the state object, behind the scenes I could define
it as a static global.
And then the Loop function just takes the state, and returns a new one ... and as long as
we disallow recursive types, that means the sum of the Loop function can have no reason
to allocate outside of the stack.
which is interesting.
I guess I could do the arena allocator trick.

anyway

one thing going on there is a fixed-length array.
What if I have a ... max-length array? would that even make sense?
```
type State = {
	steps: Array<Step> where .length = 1000 - uint,
}
```
that's kindof interesting.
but actually, a fixed-length array should be just as doable
```
type State = {
	steps: Array<Step> where .length = 1000
}
```

I guess I'd have a `set(arr, idx, v)` that would "return" a new array, unless I knew I could
get away with mutating it?
eh idk, seems a little convoluted.
maybe I should try to raise it up to the platform level? but that would be too much I think.
orr I could just use a linked list like a reasonable person. given that I don't need random access.
but that would mean heap allocation.

# Thinking about React

It would be quite nice to have drop-in react support.
it would be very cool to autogen runtime type checkers to validate incoming values 🤔
although if we have typescript, that can represent much of what we'll be using. so maybe its fine.

so like
do I imagine a "platform" kindof setup?

What would it look like to use typescript-annotated components directly inline? and such.

Alternatively, what would it look like to keep everything pure on my end, essentially passing a
POJO data structure over to the TS side, which gets inflated into react components? a la elm ui.
oh right, elm has its own virtualdom impl.
i guess cljs is the more react-compatible idea. but it does side effects.

so, it would have to be an opaque type, right?
`createComponent<Props>(fn: (props) => ReactComponent, props: Props) => ReactComponent`
is that all we need?
I guess the various hooks would have to be wrapped as well.
but that's all fine.
Native components are a little interesting, because there's different allowed props
based on which string is passed. I guess I'll just do wrappers for all of them
`createNativeDiv(props: DivProps) => ReactComponent` etc.
Anyway, seems like that would get the job done!
OH Wait I can use an enum
`createNative(props: NativeProps)`
```
enum NativeProps {
	DivProps,
	SpanProps,
	... etc
}
```
so `createNative(DivProps{})` gets the job done for you. I like that a lot.

dunno about jsx though. is it worth it?
prolly not.



# Thinking about tests for things

## Apply

So, if we're applying, and there are unspecified type variables ...
also, like, if we change an argument, which would change the ~inferred type variable.
then what?
OH RIGHT that's where autofixers come it.
AWSOME
so we have an autofixer that's like "this arg type is wrong, you could either change the type param over here
or change the whatsit over there"

So anyway, when first pass happens, do we already try to infer stuff?
hmmm. might have annoying cascading consequences if I don't?
but tbh I could add that later.







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

- [x] test passing lambdas
- [ ] ok lol I do need to dehash things this is getting ridiculous
	- should I have there be an actual syntax for this?
		maybe a toplevel macro or something?
		or just `alias something #[hashashash]`
		hmm should I /try/ to oneliner them?
		I could also condense to emojis, with like `e` prefix.

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
