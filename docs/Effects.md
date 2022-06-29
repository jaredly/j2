

oooooh ok so antelang takes `k` and just makes it a keyword! Honestly that has some appeal.
```
handle_give_int (f: unit -> a with GiveInt) -> a =
    handle f ()
    | give_int str ->
        if str == "zero"
        then resume 0
        else resume 123
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
