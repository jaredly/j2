# Decorators

So, I've been initially basing things off of ocaml's decorators.
Where there's a special syntax, and you can drop in things like types and patterns in addition to
... expressions.
It does seem like this would be useful for when I'm doing macros.

... but ... I think I'm planning on having macros behave a little differently?
Or rather, have different syntax for decorators vs macros.
Basically my question is:

Can I have decorators be ... values? like, specifically records.
b/c I'm thinking of error reporting, right
and I'm like "what if I could represent type errors in-universe
because why not I guess?

and it could be like

@TypeError
@ResolutionError

and such.

Now, ResolutionError should list the options considered, so we need to be able to
represent IDs in-universe. Which I think would be useful anyway. I guess it's another primitive?
eh and I don't love the need to come up with new syntax for it.
`#[hsomething]`. Maybe two hashes? might be interesting. And it would work.

Ok but then there's the matter of "I expected this type, but got this other one".
and I don't have a way to represent types as values.
Should I just go ahead and codegen up my typed-ast in-universe? Then I could definitely
start representing things.
And I do want to do that eventually.
Ideally I would also be codegenning a way to convert from js->jd->js.
So I can just go `ToJd[typ.type](typ, ctx)` and it would get the job done.

oh wait lol I need to be able to produce record types, and like recursive types, and kindof a whole bunch of other stuff first. hah.

OHWAIT so then I want quoting! So I don't have to write out `TRef{Ref::Global{id: ##[someid]}}`.
huh yeah I'll have to figure out how to turn IDs into my ID primitive instead of a record.

ooh I wonder if I can write compile-time arbitrary type bound macros?
hmm but if I don't work within the world of the type system, then whatever's handling the value will still have to account for filtered-out stuff. So that's not awesome.

To clarify: What I'm thinking I'll probably want is a way for macros to indicate more clearly what kinds of things they'll accept. Not just an `Expression`, but an `Apply` with an `Int` and a `Float`.
...
So, the fact that all of my enum options are their own records seems like it ought to help some?
but it ... doesn't quite.
```
struct Apply {
	args: Array<Expr>,
}
```
We can't say `args needs to be length 2, where the first arg is an Number with kind "int"`

honestly I think what I want is type refinement.
which seems like it has the potential to be extremely complicated.
BUT
I think it would also be an answer to my ahead-of-time compilation desires. (where I want to be able to know if an array has a fixed known length, for compiling to glsl)

it feels like I would be tracking a ridiculous amount of information though.
like
building an extremely specific type for a given value.

...

...

....

will this run me afoul of ... co/contra-variance? because I super don't want to mess with that.

I'm imagining that something like
```
struct Apply {
	target: Expr,
	args: Array<Expr>
}
enum Expr {
	Apply,
	Id{name: string},
	Int{value: int},
	Float{value: float},
	Bool{value: bool},
	Lambda{arg: string, body: Expr},
}
```
and then, quasiquoting something like `hello(1, 2)` would (um am I resolving things too? I think so?) so we're giving folks the typed ast. Anyway it .. would ... have the value ... of
```
const expr = Expr::Apply{Expr::Id{"hello"}, [Expr::Int{1}, Expr::Int{2}]}
```
// hmmm I wonder if I want to be able to suppress record arg labels for specific records .. or whether I should just do it automatically for single-arg ones. And yeah, I do think I want to be able to at least write records w/o giving names.

Ok anyway, the type of this would normally be `Expr`
but with refinement, it could be as much as
```
Expr where Expr::Apply{
	target: Expr where Expr::Id {string where "hello"},
	// etc etc
}
```
like
how would that even make sense.

I need to remind myself of why implicit subtyping is the bane of my existence.
Soo if you have a `Dog` and it's a subtype of `Animal` and you have a function that accepts an `Animal` and you pass it a `Dog` ... then .... idk?
OH maybe it's only bad if ... there's a different runtime represnetation for Dog vs Animal? I mean yes...
like "not all Animals are Dogs". And .. when using generic types, you need to know which type args can be supertyped vs subtyped? I think?

can I stick to my principles on not implicitly casting things to each other, while also doing this ridiculous type refinement bonanza?

🤔

I should probably take a look at languages with type refinment.

Also would it be TOO bad news to allow integer comparison? hoenstly I'd be satisfied with nonnegative numbers being the limit for doing fancy maths.

ohhhh yeah caus I was definitely thinking about having a recursive function be annotated such that I didn't have to use hueristics to turn it into a plain for loop.
Which would involve doing addition & subtraction in the type system.
And I think it involved having type variables .. that were numeric constants?

```
let rec sum = <N>(arr: Array<int> where arr.length == N): int => {
	switch arr {
		[] => 0,
		[v, ...rest] => v + sum<N - 1>(rest)
	}
}
```
// Now this isn't tail recursive, but I don't have TCO in javascript anyway, so I'll want to
// turn it into a loop if I can.

// Hmm I need a type-algebra way to indicate "where the Enum variant is this one"

// anyway I should think about this more later.
