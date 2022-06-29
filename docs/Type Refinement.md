
https://antelang.org/docs/language/
lots of cool things going on

So, using "uninterpreted functions" to basically do phantom types? very interesting.



--- general ramblings ---

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

Oh I wonder if the issue is that ... you might be passing in ... an object with more fields?

```
let gm = <T where (T <: int) and (T > 5)>(n: T) => {
	// ... so T is a subtype of int... or uint, really. hm maybe I should have a uint type.
}

let gm = <T: int, V: int + 5>(n: T) => {

}
```

Ok so how do I model this, and what is it doing?

- "constraints"
- constraints can exist on ... types that aren't functions?
	- hmm well also there are type literals. Should I do those first?
		then I can figure out whether subtyping & variance are really all that bad.

		I should dig up some of those examples of type-level arithmetic, see if I can
		use those as a jumping-off point.

ALSO what about "hello" + string? So we can represent prefixes? And string + "suffix"? Sounds very cool.
I mean even string + ":" + string has a bit of a ring to it.
You could have a `split<Sep: string, T: string + Sep + string>(sep: Sep, str: T)` that returns a
`Array<string> where .length > 1`. That seems very interesting.

Now, one question is: Can function bodies access type variables as values? I should look at zig to see how they handle that bit.
anyway, let's not mess with that just yet. If I need to, I can request that a constant be passed along? ugh but I don't like that. hmm.

oh btw `split<Sep: string>(sep: Sep)` means that we're instantiating this function with a specific string ~constant. If you don't have a variable where the type is an exact string constant, you can't call this function.



Ok anyway, I should get started on this kind of thing right away.
Do I do something like `TConstant`? or is "hello" just a String with a toplevel constraint?
Or is it TExpr which could be any number of things? hmm I guess it would be.

Again, how to functions play into this?
And ... type arguments? I Think that TExprs can only make sense as part of a bound on a variable.
Yeah let's start with that.

Ok I don't actually have type application set up syntactically.
Need to do that, and ... maybe also function calls? I can't remember if I want to do rest args, or requiring arg labels to be correct.

also, what about optional args? That would require a builtin nullable. which, eh, maybe I'll just do? What were the thoughts I had about ... a #Tag for easily creating Error types? Oh it was that I would allow inline creation of records. Sounds fine.

btw I want "navigate to the definition of the thing I have highlighted" to be extremely fast, an also not break flow / local navigation.

Oh hey so I geuss type expressions need to be valid annotations. or at least it makes sense for them to be.
