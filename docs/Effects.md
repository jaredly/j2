


# Definition of `Task`

```
Task<[`A(a, ar) | `B(b, br) | `C(c, [])], D>
// becomes
type Whatsit = [
	`A(a, ar => Whatsit) |
	`B(b, br => Whatsit) |
	`C(c, ()) |
	`Return(D)
]
```

## Two Magic Functions

### andThen
lets you use the eventual returned value.
(this is "bind")
R => Task<[T], R'>

### withHandler
lets you map all subtasks??
Task<[T + E], R> => Task<[T], R>


# Ramblings


Ok, so once I have `Task<>` style effects ...
what do I have next?

```
(a) ={X}> b
is the same as
(a) => Task<X, b>
```

which seems fine?

ok so the really nice thing is that I don't need any type-level magic for it, right?
I mean, especially if ...

ok, so I'm considering doing "auto-task-magic".
so, no special syntax needed.
BUT then we would need a special syntax to /not/ task-magic.
but then, what's the cost of having special syntax?

hello!()

it can be nice to know that your call might not be forwarded.

yeah, I feel like: If you're going to be making them representable
as part of the normal language, it's weird to auto-dealio them.
orr
I could have some hint at the fn level
that tasks will be dealt with harshly.
oh but then
you might want to
combine tasks
and then what do you do

ok?()

there's the ol' question mark

ok!()

ok, so I feel like

if a fn has a `!` function, then return values will be wrapped.

so there is a little bit of function color going on
but it's ~easy to go back & forth. hopefully.

## Handle ##

ok anyway, what does handling them look like?

```
type Store = <Value>['Get((), Value) | 'Set(Value, ())]
// <Value, E: effect, R>(v: Value, task: () ={E | Store<Value>}> R)
let provide = <V, E, R>(v, task) => switch task() {
	'Get((), k) => provide<V, E, R>(v, () => k(v))
	'Set(v, k) => provide<V, E, R>(v, k)
	// ok, and we'll be able to infer
	// that the other parts of E are just passed through
	// and 'Return as well
	// So it's fine?
	v => v
	// Not needed, it'll just pass through
	// 'Return(v) => 'Return(v)
}


let subjugate = <Sub: const string>(task) => switch task() {
	'Get((), k) => '{"Get:" + sub}((), k)
	'Set(v, k) => '{"Set:" + sub}(v, k)
	// is the same as x => x
	// *
	// maybe too early for that sugar idk
	x => x
}

let provideSub = <V, E, R, Sub: const string>(v, task) => switch task() {
	'{"Get:" + Sub}((), k) => provideSub<>(v, () => k(v))
	'{"Set:" + Sub}(v, k) => provideSub<>(v, k)
	x => x
}


```





hmm I think I want a type bound that's like `effect`,
which is "the kind of thing you can put in `Task`".
So the weird thing is that ... you wouldn't really produce
a value that matches type `effect`.
Is that too weird? idk

OH also, `Task<['Failure(string, never)], int>` means
one of the options will be `'Failure(string)`. btw.







-- thnking thgouth effects as tags ---

So, what if I model effects as tasks
in such a way
that they can be modeled in-universe as enums
and then
we could also have syntax for
'call this function as a task'

```

also, [ 'One(['A]) | 'One(['B]) ] 
equals [ 'One(['A | 'B])]




fn!(a, b, c)

is like

fn(a,b,c).then(() => everything else)

type X = [
	'Failure(string)
	| 'Return(int)
	| 'PartyParty((v: string) => X)
	]


let x = () => {
	print!("What is your name?");
	let name = getName!();
	print!("What is your age?");
	let age = getAge!();
	"${name} is ${age as string} years old"
}

type Task<E: [*], T> = [ E | 'Return(T) ]

[ 'Print(string, () => *)
| 'Readline((v: string) => *)
| 'Return(string)]

let getName = (): ['Readline((v: string) => ['Return(string)])] => {
	'Readline(name => 'Return(name))
}

let getAge = (): ['Readline((v: string) => ['Return(int)])] => {
	'Readline(name => 'Return(parseIntOrElse(name)))
}

let print = (v: string) => 'Print(v, () => 'Return(()))

let x = () => {
	'Print("What is your name?", () => {
		'Readline(name => {
			'Print("What is your age?", () => {
				'Readline()
			})
		})
	})
}


/// soooo the hmmmmm
thenn would need to
bascially .. pass through ..
so yeah, "Task" needs to line up all the 'return' values,right?

[ 'Print(string, () => *)
| 'Readline((), (v: string) => *)
| 'Return(string)]

and * is ^ some more?
so like, 'Return(X), and then otherwise all enums have a tuple payload
where the second is a function ...

does this have to just be ... a ... keyword?
because I don't think I can express that type constraint
and I definitely don't think I can write that function.

Task<[
	'Print(string, ()) |
	'Failure({0: string}) |
	'Readline((), string)
], returnValue>

() ={'Print(string, ()), 'Failure(string)}> string

let x = () => {
	print("What is your name?") andThen () => {
		getName() andThen (name) => {
			print("What is your age?") andThen () => {
				getAge() andThen (age) => {
					'Return("${name} is ${age as string} years old")
				}
			}
		}
	}
}

andThen takes a Task<A, X> and (X) => Task<B, Y> and returns a Task<[A | B], Y>

... I think that makes sense?

and so the question of: can you do sufficient type unification
to make this happy?

so a runtime function, that checks the values

now, if you *could* do it at runtime, that would be cool
like, what are the monad functions that people do
eh nvm

ok yeah so we need to be able to unify
[ 'Print(string, () => Task<[], int>)
| 'Failure(string, never)
| 'Readline((), string => Task<[], int>)]

with

Task<['Print(string, ()) | 'Failure(string, never) | 'Readline((), string)], int>

```

Ok so failures, make sure that works
like

```
['Failure({0: string})]

can align with a task returning anything.
Task<[*], *>
```

SO:

```
does fail!("Error")

let fail = value => `Failure(value);

fail!("Error")

becomes

fail("Error") andThen (() => {})

but if it's in the final position, it won't need the `andThen`




ok but so

are we going to go hard on unification?
like

[ 'Failure({x: ['A]}) | 'Failure({x: ['B]}) ]

becomes

[ 'Failure({x: [ 'A | 'B ]}) ]

?

I mean, it seems like I would indeed want that.

someone's going to say that would be harder to make a machine representation for.
and like, probably. but that's fine

ok so like a `unifyTypes` fn











--- Antelang stuff ---


oooooh ok so antelang takes `k` and just makes it a keyword! Honestly that has some appeal.
```
handle_give_int (f: unit -> a with GiveInt) -> a =
    handle f ()
    | give_int str ->
        if str == "zero"
        then resume 0
        else resume 123
```


With fresh eyes & the new plan for records & enums:



```
effect State<T> {
	`Get => T,
	`Set(T) => (),
}

type State:Effect = <T>[ `Get | `Set(T) ]
type State:Full = <T, Final>[ State:Effect<T> | `Final(Final)]

let rec loop = (current, fn) => {
	switch handle!(fn) {
		`Get => resume!(current),
		`Set(value) => loop(value, () => resume!()),
		`Final(value) => value,
	}
}

// mensch I would just love to be able to unify effects
// with enums.

// eh I wonder if I should give effects a rest for a minute?
// erg but then we'd run the monad gauntlet. no ways.

// ok I guess we probably need effectvbls and effect tracking
// to exist separate from type vbls. 🤔. There are different rules
// between them, after all.

// waiiiiiit ok so hm if enums are .. anonymous now,
// are effects as well? like structural?
let rec loop = (current, fn) => {

	// yeah, so if handle! were to return some value.
	`Final(value) make sense.
	but the rest of it doesn't really.

	// when providing multiple ... effects here,
	// how do we distinguish which one gets lopped off?
	// calling handle!{# one, two, three #}
	// would it really just be the first that is plucked?
	// I guess the ... syntax makes that something to expect

	handle! : <Result>{# Efff, ...e #}(someFn: () ={Efff, e}> Result) ={e}> [
		`Final(Result),
		`Effect(Efff)
	]

	switch handle!(fn) {
		`Effect(`Get, k) => k(current),
		// nooo because the type of K dependson the type of the effect.
		`Get => resume!(current),
		`Set(value) => loop(value, () => resume!()),
		`Final(value) => value,
	}
}

<T>[# `Get => T | `Set(T) => () #]

and ... if I claim to handle just `[# `Get => T #]`, what does that mean?
It means I don't get it at all, right?

Hm so like I'd need to fully resolve out the effect definition,
and then probably hash it? Seems like that would do the trick.
oh hm wait.
what about effect polymorphism.
Am I hoping that ... monomorphising everything will fix that too?
I guess it'll have to.

```













Soooo
```ts

effect State<T> {
	Get{} => T,
	Set{value: T} => (),
}

// -> produces (essentially? Maybe literally?)
enum State:Effect<T> {
	Get{},
	Set{value: T}
}
// And then:
enum State:Full<T, Final> {
	...State:Effect<T>,
	Final{value: Final},
}

// Handle! Does it actually return a value? How would it?
let rec loop = (current, fn) => {
	switch handle!(fn) {
		State:Effect::Get => resume!(current),
		State:Effect::Set{value} => loop(value, () => resume!()),
		State:Full::Final{value} => value,
	}
}

// Alternatively, I could just do
handle! fn {
	State:Effect::Get => resume!(current),
	State:Effect::Set{value} => loop(value, () => resume!()),
	State:Full::Final{value} => value,
}
// which would still allow me to reuse switch syntax for the most part.
```

resuming must happen in the body of the switch



Btw we're going to use `{* x *}` instead of `{x}`, to avoid collisions with records,
and to allow separation off EffLambda and EffApply.

Ok while I'm in the 'thinking about weird things' mood,
do we have any solution for 'effects are special and weird'?

```ts
effect State<T> {
	Get{} => T,
	Set{value: T} => (),
}
// -> produces (essentially? Maybe literally?)
enum State<T> {
	Get{},
	Set{value: T}
}
// and I mean do we just have a rule that you
// can't have a `k`? No, I think we just make it k_ or something.
enum StateCatch<T, Final> {
	Get{k: (value: int) => Final},
	Set{value: int, k: () => Final},
	End{value: Final}, // right?? maybe???
}
// And then you can later
raise!(State<int>::Get)
raise!(State<int>::Set{:10})
// now, if you try to raise an enum that wasn't created
// with ... ... .. . .. ... .... . .. .... .. .... . . .. ...
// hmm maybe that's misleading.
// because you can't do something like. ...
(eff: State<int>) => raise!(eff)
// because we wouldn't know the return value.
// I mean I guess technically we mighttt be able to if all of them were the same
// but that seems very weird.
// Really, I want the type of `eff` to have information on it of what the result
// of the raise is. But we don't.
// So, you're stuck with producing any effect enums that you wan't to raise,
// right at the moment you raise them.

// this might make some sense.

let rec loop = (current, fn) => {
	switch handle!(fn) {
		Get{k} => k(current),
		Set{value, k} => loop(value, k),
		End{value} => value,
	}
}
```

idk if it could actually be realized
from a computational flow sense.
or whether it's even accurate type-wise.
but it's cool to think about.
