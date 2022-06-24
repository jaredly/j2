
# Binops?
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

# Records?
Ok, so there's this thing where ... i'm doing record types by name and not by shape, right?
and the supposed benefit is that I can rename things without changing the hash.
but I need to force-uniquify things to keep dumb things from happening. Names have semantic meaning,
it probably doesn't be great to pretend they don't.
That is to say:
`type Pos {x: number, y: number}` should not be considered the same as `type Pos {y: number, x: number}`.

Fortunately, I'll need to really grease the wheels on propagating changes, so it shouldn't be too painful to
update a bunch of hashes when renaming something. Because I can just say "propagate this automatically, you do your thing".

hmmmmmmmmmmmmmmmmm

Ok so this might have some implications.

Does that mean I'm moving to structural types? 🤔.
```ts
type Some = <T>{
	value: T,
	slice: float,
}

type SomeInt = Some<int>
type SomeInt2 = {
	value: int,
	slice: float,
}
```
^^ should these two ... hash ... to the same thing? 🤔 🤔
... perhaps not. But I think they should be ... allowable equivalent types?
... hmm no that wouldn't work, would it. ... because ..
... so all my records are tagged, right?
so that they can slide in and out of tagged unions.
wouldn't `Some<int>` and `Some<float>` have the same tag?
I mean it kinda seems like they wouldn't.
but I think ... that would mean I'd have to monomorphize everything?
like

```ts
const m = <T>(x: Some<T> | Other, default: T): T => {
	switch (x) {
		Some{value} => value,
		_ => default
	}
}
```

^^^ it wouldn't know what tag to check for. Right?
but, on the other hand, that would allow an enum of like

```ts
type X = Some<int> | Some<float>
```

which ... seems a little bit loopy.

but, so, that would again mean that ... I don't have to declare records anymore. right?
and bounds ... are structural too.
this might open up a bunch of nice things, I'm not quite sure.

ok, so does that also mean...

that

```ts
type HasName = {
	name: string,
}
type HasAge = {
	age: int,
}
type Person = {
	...HasName,
	...HasAge,
}
type Person2 = {name: string, age: int}
```

Person and Person2 are equivalent types?

and I can do a type bound of `{name: string}` and it would just work?
hmmmmm.
This is quite interesting.


ohhhhk wait so here's where it maybe gets wild.

```ts
type Bob = Person where .name = "Bob"
// is the equivalent type of
type Bob = {name: "Bob", age: int}
// right?
```

I've also wanted something like
```
Person where .kind = [ Dealio ]
```
like
```
type Node = `Node{kind: string, children: Array<Tree>}
type Leaf = `Leaf(string)
type Tree = [ Node | Leaf ]
// and what I might want is something like

type Depth2Tree = Node where .children[everyidk] isa Node

// ok simpler example
type Cons<T> = `Cons(List<T>, T)
and List<T> = [ Cons<T> | `Nil ]

type Last<T> = Cons<T> where .0 = [ `Nil ]
```

like, can we say that [ 'Nil ] is a subtype of [ 'Nil | 'Cons ]?
Seems like it ought to be.

ooh, so for an open union

```
type Whatsit<T: []> = [ `Nil | T ]
```
right?
Saying "T is a supertype of the empty enum".



hmmmm ok another question, how do we ... do recursive types, when it's structural?

that is to say, I would hope that my type checker is good enough to detemine that
```
type List<T> = [ `Cons(List<T>, T) | `Nil ]
```
is the same as
```
type List<T> = [ `Cons([ `Cons(List<T>, T) | `Nil ], T) | `Nil ]
```
I think it would have to accomplish it by expanding the first out?
although ... comparing one that's 1-level expanded to one that's 2-levels expanded
seems like a potentially difficult challenge.

🤔 hmm I guess what might be happening is that it's expanding them back & forth until
you get to LCM.





hmmmm

allllrightythen, but we also get into enums, and how enum wrapping works.
because in the cruel world, we need to know all of the cases of an enum
in order to know what fields we're going to need.

Now, Roc deals with this by ... having tags on everything, right?
I'm thinking about:

const m = <T: {name: string}>(x: T) => x.name

and

const m = (x: {name: string} | {name: int}) => {
	type Stringer = {name: string}
	type Inter = {name: int}
	switch x {
		// lol not this. you would need a name here my folks.
		// gotta alias your records if you're going to switch on them.
		// ooh but this means I could have local type aliases no problem. If I want them.
		Stringer{name} => name,
		_ => 10
	}
}

anyway point being, Roc deals with this little dealio by having enums be tagged
with a string name, of course
so it's like

const m = (x: Stringer {name: string} | Inter {name: int}) => {
	switch x {
		Stringer {name} => name,
		Inter => "hi"
	}
}

you can't just slam records together into an enum.

this also has the very convenient syntax of just making up unions to return
like Result<int, `DidntWork>

yeah I feel like backticks for tags is nice?

type Result<Ok, Err> = `Ok(Ok) | `Err(Err)

Yeah tbh that's nice, because we can just say 'tags only hold one thing, and `Ok(1, 2) is sugar
for `Ok((1, 2)) and `Ok{name: 1} is sugar for `Ok({name: 1}).
yeah ok I'm pretty well sold.

This conveniently means that I'll be monomorphizing all over the place, so I don't need to
muck with go's interfaces. Or generics in any target language.





const x = (y: Some<int>) => 10
... is the same as ...
const x = (y: {value: int})
```



