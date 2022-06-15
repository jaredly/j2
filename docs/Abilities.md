
So, thinking about Roc's abilities.

What if, I just make it easy to wrap an ... object .... with a ... thing that will implement all the functions expected ... and it becomes a record?

```

let needsASerializable = <T: Serializable>(x: T) => {...}

struct Serializable {
	toString: (self: Self) => string,
	fromString: (raw: string) => Selfffffff
}

impl Serializable for int {
	toString(self) {
		"hi"
	},
	fromString(raw) {
		42
	}
}

needsASerializable<int>(324)

...

struct Serialize<T> {
	toString: (value: T) => string,
	fromString: (raw: string) => T
}

let stringSerializer = Serialize<string>{
	toString: (x) => x,
	fromString: (x) => x,
}

needsSerializable<T>(x: T, serialize: Serialize<T>): T {
	serialize.fromString(serialize.toString(x))
}

// Is this actually any better??? I guess people don't like passing around
// two things when they could pass one?
needsSerializable<T: Serializable>(x: T): T {
	Serializable.fromString(Serializable.toString(x))
}


needsSerializable<T>(both: (T, Serialize<T>)): T {
	both.1.fromString(both.1.toString(both.0))
}

what ... if .... hm .........................
so like I'm imagining some compiler magic where, if there's a tuple, you can
call ... the .... yeah that sounds absolutely bonkers, foget about it. like both.fromString would
be translated to both.1.fromString behind the scenes. Bad news bears. I think? idk.


struct SelfSer<T> {
	value: T,
	toString: () => string,
	fromString: (v: string) => SelfSer<T>,
}

// ???????? can this even work
<!-- struct SelfSerInt {
	...SelfSer<int>,
	value: int,
} -->
// oh but I don't even need that do I? At least not for this case. hmm.
// huh if everything's immutable, some of these things become less compelling

const intSer = (v: int) => SelfSer<int>{
	value: v,
	toString: () => intToString(v),
	fromString: (raw: string) => intSer(42)
};

// I probably want a way to say "It just needs to inherit from SelfSer, I don't care what the vbl is"
needsSerializable<I, T: SelfSer<I>>(ss: T): T {
	ss.fromString(ss.toString())
}

needsSerializable<int, SelfSer<I>>(intSer(23))

needsSerializable<I>(ss: SelfSer<I>): SelfSer<I> {
	ss.fromString(ss.toString())
}
needsSerializable<int>(intSer(23))

// ok but also, I think typeclasses become more compelling when you can have multiple, right?
// Although with record type bounds, I think I can get essentially the same thing, right?
// I guess my way is probably some amount of less performant, because I'm shuttling objects
// all over the place? hmmm.

// OK but actually the other way is ... if I have a special thing for "find a function on a record
// that's in scope, and then use it."

needsSerializable<T>(x: T, _: Serialize<T>): T {
	// serialize.fromString(serialize.toString(x))
	x..toString() lol that looks terrible
	x$toString I actually don't hate it?
	_.toString(x)
	x~toString
	// huh that's interesting
	x$toString$fromString
	x |> _.toString |> _.fromString
	x|toString|fromString // hmmm
	// so ... what about other arguments.
	x|serialize(tabs: true)
	serialize(x, tabs: true)
	serialize(x)(tabs:true)
	// tbh if you want it to be the latter, you can do `x|serialize()(tabs: true)` which I'm fine with.
	// x$toString()

	// Ok
	// `x$serialize()(tabs:true)`
	// is parsed as `(x$serialize())(tabs: true)`. To be clear
	// oh I could do x->serialize(y)

	//# options are
	x$serialize(y)
	x|serialize(y)
	x->serialize(y)
	// And critically, this would eat these up and prevent them from being used
	// to start binops. which is an argument against |, because || is a thing.
	// ok -> it is
}
// yeah ok, I think that's all I need to respond to the modular implicits question?
// I mean sure it's probably going to make inference a little more interesting
// but that's fine.

```
